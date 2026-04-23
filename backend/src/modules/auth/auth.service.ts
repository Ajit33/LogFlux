import bcrypt   from "bcryptjs";
import jwt      from "jsonwebtoken";
import type { User, JwtPayload, UserRole } from "./auth.types";
import logger   from "../../config/logger";

const users: User[] = [];

const JWT_SECRET  = process.env.JWT_SECRET  ?? "super-secret-change-in-prod";
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "24h";

export class AuthService {

  async bootstrap(username: string, password: string) {
    if (users.length > 0) {
      throw new Error("Bootstrap already completed.");
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin: User = {
      id:        "1",
      username,
      password:  hashed,
      role:      "admin",       // ← just admin, no superadmin
      createdBy: null,
      createdAt: new Date().toISOString(),
    };
    users.push(admin);
    logger.info(`First admin created: ${username}`);
    return this.signToken(admin);
  }

  async login(username: string, password: string) {
    const user = users.find(u => u.username === username);
    if (!user) throw new Error("Invalid credentials");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");
    return this.signToken(user);
  }

  async register(username: string, password: string, role: UserRole, createdBy: JwtPayload) {
    // Only admin can create users
    if (createdBy.role !== "admin") {
      throw new Error("Only admins can create users");
    }
    // Admin can only create viewers
    if (role !== "viewer") {
      throw new Error("Admins can only create viewer accounts");
    }
    const exists = users.find(u => u.username === username);
    if (exists) throw new Error("Username already taken");

    const hashed = await bcrypt.hash(password, 10);
    const user: User = {
      id:        String(users.length + 1),
      username,
      password:  hashed,
      role,
      createdBy: createdBy.username,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    logger.info(`User created: ${username} (${role}) by ${createdBy.username}`);
    return { id: user.id, username: user.username, role: user.role, createdBy: user.createdBy };
  }

  listUsers() {
    return users.map(u => ({
      id:        u.id,
      username:  u.username,
      role:      u.role,
      createdBy: u.createdBy,
      createdAt: u.createdAt,
    }));
  }

  deleteUser(id: string, requestedBy: JwtPayload) {
    if (requestedBy.role !== "admin") {
      throw new Error("Only admins can delete users");
    }
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("User not found");

    const target = users[idx];
    if (target.id === requestedBy.id) throw new Error("Cannot delete yourself");
    if (target.role === "admin") throw new Error("Cannot delete admin accounts");

    users.splice(idx, 1);
    logger.info(`User deleted: ${target.username} by ${requestedBy.username}`);
    return { message: `User ${target.username} deleted` };
  }

  isBootstrapped() {
    return users.length > 0;
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  private signToken(user: User) {
    const payload: JwtPayload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
    return { token, user: { id: user.id, username: user.username, role: user.role } };
  }
}

export default new AuthService();