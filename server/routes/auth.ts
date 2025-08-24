import { RequestHandler } from "express";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "@shared/api";
import { getDatabase } from "../database/db";
import crypto from "crypto";

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const db = await getDatabase();

    // Find user
    const user = await db.get(
      "SELECT id, username, email, role, created_at FROM users WHERE email = ? AND password_hash = ?",
      email,
      hashPassword(password),
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await db.run(
      "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      user.id,
      token,
      expiresAt.toISOString(),
    );

    // Clean up expired tokens
    await db.run('DELETE FROM auth_tokens WHERE expires_at < datetime("now")');

    const userResponse: User = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const response: AuthResponse = {
      user: userResponse,
      token,
      message: "Login successful",
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.get(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      email,
      username,
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already in use",
      });
    }

    // Create new user
    const result = await db.run(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      username,
      email,
      hashPassword(password),
      "user",
    );

    const userId = result.lastID;

    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await db.run(
      "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      userId,
      token,
      expiresAt.toISOString(),
    );

    const newUser: User = {
      id: userId!.toString(),
      username,
      email,
      role: "user",
      created_at: new Date().toISOString(),
    };

    const response: AuthResponse = {
      user: newUser,
      token,
      message: "Registration successful",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      const db = await getDatabase();
      await db.run("DELETE FROM auth_tokens WHERE token = ?", token);
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const db = await getDatabase();

    // Get user from token
    const result = await db.get(
      `
      SELECT u.id, u.username, u.email, u.role, u.created_at 
      FROM users u 
      JOIN auth_tokens t ON u.id = t.user_id 
      WHERE t.token = ? AND t.expires_at > datetime("now")
    `,
      token,
    );

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user: User = {
      id: result.id.toString(),
      username: result.username,
      email: result.email,
      role: result.role,
      created_at: result.created_at,
    };

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Middleware to authenticate requests
export const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const db = await getDatabase();

    // Get user from token
    const result = await db.get(
      `
      SELECT u.id, u.username, u.email, u.role, u.created_at 
      FROM users u 
      JOIN auth_tokens t ON u.id = t.user_id 
      WHERE t.token = ? AND t.expires_at > datetime("now")
    `,
      token,
    );

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Add user to request object
    (req as any).user = {
      id: result.id.toString(),
      username: result.username,
      email: result.email,
      role: result.role,
      created_at: result.created_at,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// Middleware to check admin role
export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};
