import { RequestHandler } from "express";
import {
  Announcement,
  CreateAnnouncementRequest,
  PaginatedResponse,
} from "@shared/api";
import { getDatabase } from "../database/db";

export const handleGetAnnouncements: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const db = await getDatabase();

    // Get total count
    const countResult = await db.get(
      "SELECT COUNT(*) as count FROM announcements",
    );
    const totalCount = countResult.count;

    // Get announcements with user info, sorted by date (most recent first)
    const announcements = await db.all(
      `
      SELECT 
        a.id, a.title, a.description, a.date, a.time, a.venue, 
        a.created_at, u.username as created_by
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      ORDER BY a.date DESC, a.created_at DESC
      LIMIT ? OFFSET ?
    `,
      limit,
      offset,
    );

    const formattedAnnouncements: Announcement[] = announcements.map(
      (announcement) => ({
        id: announcement.id.toString(),
        title: announcement.title,
        description: announcement.description,
        date: announcement.date,
        time: announcement.time,
        venue: announcement.venue,
        created_by: announcement.created_by,
        created_at: announcement.created_at,
      }),
    );

    const response: PaginatedResponse<Announcement> = {
      results: formattedAnnouncements,
      count: totalCount,
      next:
        offset + limit < totalCount
          ? `?limit=${limit}&offset=${offset + limit}`
          : undefined,
      previous:
        offset > 0
          ? `?limit=${limit}&offset=${Math.max(0, offset - limit)}`
          : undefined,
    };

    res.json(response);
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving announcements",
    });
  }
};

export const handleGetAnnouncement: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const announcement = await db.get(
      `
      SELECT 
        a.id, a.title, a.description, a.date, a.time, a.venue, 
        a.created_at, u.username as created_by
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `,
      id,
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const formattedAnnouncement: Announcement = {
      id: announcement.id.toString(),
      title: announcement.title,
      description: announcement.description,
      date: announcement.date,
      time: announcement.time,
      venue: announcement.venue,
      created_by: announcement.created_by,
      created_at: announcement.created_at,
    };

    res.json({
      success: true,
      data: formattedAnnouncement,
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving announcement",
    });
  }
};

export const handleCreateAnnouncement: RequestHandler = async (req, res) => {
  try {
    const { title, description, date, time, venue }: CreateAnnouncementRequest =
      req.body;
    const user = (req as any).user;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and date are required",
      });
    }

    const db = await getDatabase();

    const result = await db.run(
      "INSERT INTO announcements (title, description, date, time, venue, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      title,
      description,
      date,
      time,
      venue,
      parseInt(user.id),
    );

    // Get the created announcement
    const newAnnouncement = await db.get(
      `
      SELECT 
        a.id, a.title, a.description, a.date, a.time, a.venue, 
        a.created_at, u.username as created_by
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `,
      result.lastID,
    );

    const formattedAnnouncement: Announcement = {
      id: newAnnouncement.id.toString(),
      title: newAnnouncement.title,
      description: newAnnouncement.description,
      date: newAnnouncement.date,
      time: newAnnouncement.time,
      venue: newAnnouncement.venue,
      created_by: newAnnouncement.created_by,
      created_at: newAnnouncement.created_at,
    };

    res.status(201).json({
      success: true,
      data: formattedAnnouncement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
    });
  }
};

export const handleUpdateAnnouncement: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, venue }: CreateAnnouncementRequest =
      req.body;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if announcement exists and user has permission
    const existingAnnouncement = await db.get(
      "SELECT created_by FROM announcements WHERE id = ?",
      id,
    );

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Only admin or creator can update
    if (
      user.role !== "admin" &&
      existingAnnouncement.created_by !== parseInt(user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    // Update announcement
    await db.run(
      "UPDATE announcements SET title = ?, description = ?, date = ?, time = ?, venue = ? WHERE id = ?",
      title || null,
      description || null,
      date || null,
      time || null,
      venue || null,
      id,
    );

    // Get updated announcement
    const updatedAnnouncement = await db.get(
      `
      SELECT 
        a.id, a.title, a.description, a.date, a.time, a.venue, 
        a.created_at, u.username as created_by
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `,
      id,
    );

    const formattedAnnouncement: Announcement = {
      id: updatedAnnouncement.id.toString(),
      title: updatedAnnouncement.title,
      description: updatedAnnouncement.description,
      date: updatedAnnouncement.date,
      time: updatedAnnouncement.time,
      venue: updatedAnnouncement.venue,
      created_by: updatedAnnouncement.created_by,
      created_at: updatedAnnouncement.created_at,
    };

    res.json({
      success: true,
      data: formattedAnnouncement,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
    });
  }
};

export const handleDeleteAnnouncement: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if announcement exists and user has permission
    const existingAnnouncement = await db.get(
      "SELECT created_by FROM announcements WHERE id = ?",
      id,
    );

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Only admin or creator can delete
    if (
      user.role !== "admin" &&
      existingAnnouncement.created_by !== parseInt(user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    await db.run("DELETE FROM announcements WHERE id = ?", id);

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
    });
  }
};
