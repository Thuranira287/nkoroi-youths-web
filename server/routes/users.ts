// server/routes/users.ts
import express from "express";
import { getUsers } from "../database/pg";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err });
  }
});

export default router;
