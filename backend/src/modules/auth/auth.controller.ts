import { Request, Response } from "express";
import authService           from "./auth.service";
import logger                from "../../config/logger";

export class AuthController {

  // POST /auth/bootstrap
 async bootstrap(req: Request, res: Response) {
  try {
    if (authService.isBootstrapped()) {
      return res.status(403).json({
        error: "Bootstrap already completed. Superadmin already exists.",
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const result = await authService.bootstrap(username, password);
    logger.info(`System bootstrapped by: ${username}`);
    return res.status(201).json(result);

  } catch (error) {
    logger.error("Bootstrap error:", error);
    return res.status(400).json({ error: (error as Error).message });
  }
}

  // POST /auth/login
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const result = await authService.login(username, password);
      return res.status(200).json(result);
    } catch (error) {
      logger.error("Login error:", error);
      return res.status(401).json({ error: (error as Error).message });
    }
  }

  // POST /auth/register
  async register(req: Request, res: Response) {
    try {
      const { username, password, role = "viewer" } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      if (!["superadmin", "admin", "viewer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await authService.register(username, password, role, req.user!);
      return res.status(201).json(user);
    } catch (error) {
      logger.error("Register error:", error);
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  // GET /auth/users
  async listUsers(req: Request, res: Response) {
    try {
      return res.status(200).json(authService.listUsers());
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  // DELETE /auth/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = authService.deleteUser(id, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      logger.error("Delete user error:", error);
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  // GET /auth/me
  async me(req: Request, res: Response) {
    return res.status(200).json(req.user);
  }

  // GET /auth/status
  async status(req: Request, res: Response) {
    return res.status(200).json({
      bootstrapped: authService.isBootstrapped(),
    });
  }
}

export default new AuthController();