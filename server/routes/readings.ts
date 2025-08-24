import { RequestHandler } from "express";
import {
  SundayReading,
  CreateReadingRequest,
  PaginatedResponse,
} from "@shared/api";
import { getDatabase } from "../database/db";

export const handleGetReadings: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const db = await getDatabase();

    // Get total count
    const countResult = await db.get(
      "SELECT COUNT(*) as count FROM sunday_readings",
    );
    const totalCount = countResult.count;

    // Get readings with user info, sorted by Sunday date (most recent first)
    const readings = await db.all(
      `
      SELECT 
        r.id, r.title, r.reading_text, r.pdf_path, r.sunday_date, 
        r.created_at, u.username as uploaded_by
      FROM sunday_readings r
      JOIN users u ON r.uploaded_by = u.id
      ORDER BY r.sunday_date DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `,
      limit,
      offset,
    );

    const formattedReadings: SundayReading[] = readings.map((reading) => ({
      id: reading.id.toString(),
      title: reading.title,
      reading_text: reading.reading_text,
      pdf_url: reading.pdf_path,
      sunday_date: reading.sunday_date,
      uploaded_by: reading.uploaded_by,
      created_at: reading.created_at,
    }));

    const response: PaginatedResponse<SundayReading> = {
      results: formattedReadings,
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
    console.error("Get readings error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving Sunday readings",
    });
  }
};

export const handleGetReading: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const reading = await db.get(
      `
      SELECT 
        r.id, r.title, r.reading_text, r.pdf_path, r.sunday_date, 
        r.created_at, u.username as uploaded_by
      FROM sunday_readings r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.id = ?
    `,
      id,
    );

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Sunday reading not found",
      });
    }

    const formattedReading: SundayReading = {
      id: reading.id.toString(),
      title: reading.title,
      reading_text: reading.reading_text,
      pdf_url: reading.pdf_path,
      sunday_date: reading.sunday_date,
      uploaded_by: reading.uploaded_by,
      created_at: reading.created_at,
    };

    res.json({
      success: true,
      data: formattedReading,
    });
  } catch (error) {
    console.error("Get reading error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving Sunday reading",
    });
  }
};

export const handleCreateReading: RequestHandler = async (req, res) => {
  try {
    const { title, reading_text, sunday_date }: CreateReadingRequest = req.body;
    const user = (req as any).user;

    if (!title || !sunday_date) {
      return res.status(400).json({
        success: false,
        message: "Title and Sunday date are required",
      });
    }

    if (!reading_text) {
      return res.status(400).json({
        success: false,
        message: "Reading text is required",
      });
    }

    const db = await getDatabase();

    // Check if reading for this Sunday already exists
    const existingReading = await db.get(
      "SELECT id FROM sunday_readings WHERE sunday_date = ?",
      sunday_date,
    );

    if (existingReading) {
      return res.status(409).json({
        success: false,
        message: "Reading for this Sunday already exists",
      });
    }

    // In a real implementation, handle PDF file upload here
    const pdfPath = null; // Will be set when file upload is implemented

    const result = await db.run(
      "INSERT INTO sunday_readings (title, reading_text, pdf_path, sunday_date, uploaded_by) VALUES (?, ?, ?, ?, ?)",
      title,
      reading_text,
      pdfPath,
      sunday_date,
      parseInt(user.id),
    );

    // Get the created reading
    const newReading = await db.get(
      `
      SELECT 
        r.id, r.title, r.reading_text, r.pdf_path, r.sunday_date, 
        r.created_at, u.username as uploaded_by
      FROM sunday_readings r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.id = ?
    `,
      result.lastID,
    );

    const formattedReading: SundayReading = {
      id: newReading.id.toString(),
      title: newReading.title,
      reading_text: newReading.reading_text,
      pdf_url: newReading.pdf_path,
      sunday_date: newReading.sunday_date,
      uploaded_by: newReading.uploaded_by,
      created_at: newReading.created_at,
    };

    res.status(201).json({
      success: true,
      data: formattedReading,
      message: "Sunday reading created successfully",
    });
  } catch (error) {
    console.error("Create reading error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating Sunday reading",
    });
  }
};

export const handleUpdateReading: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, reading_text, sunday_date }: CreateReadingRequest = req.body;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if reading exists and user has permission
    const existingReading = await db.get(
      "SELECT uploaded_by FROM sunday_readings WHERE id = ?",
      id,
    );

    if (!existingReading) {
      return res.status(404).json({
        success: false,
        message: "Sunday reading not found",
      });
    }

    // Only admin or uploader can update
    if (
      user.role !== "admin" &&
      existingReading.uploaded_by !== parseInt(user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    // Update reading
    await db.run(
      "UPDATE sunday_readings SET title = ?, reading_text = ?, sunday_date = ? WHERE id = ?",
      title || null,
      reading_text || null,
      sunday_date || null,
      id,
    );

    // Get updated reading
    const updatedReading = await db.get(
      `
      SELECT 
        r.id, r.title, r.reading_text, r.pdf_path, r.sunday_date, 
        r.created_at, u.username as uploaded_by
      FROM sunday_readings r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.id = ?
    `,
      id,
    );

    const formattedReading: SundayReading = {
      id: updatedReading.id.toString(),
      title: updatedReading.title,
      reading_text: updatedReading.reading_text,
      pdf_url: updatedReading.pdf_path,
      sunday_date: updatedReading.sunday_date,
      uploaded_by: updatedReading.uploaded_by,
      created_at: updatedReading.created_at,
    };

    res.json({
      success: true,
      data: formattedReading,
      message: "Sunday reading updated successfully",
    });
  } catch (error) {
    console.error("Update reading error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating Sunday reading",
    });
  }
};

export const handleDeleteReading: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if reading exists and user has permission
    const existingReading = await db.get(
      "SELECT uploaded_by FROM sunday_readings WHERE id = ?",
      id,
    );

    if (!existingReading) {
      return res.status(404).json({
        success: false,
        message: "Sunday reading not found",
      });
    }

    // Only admin or uploader can delete
    if (
      user.role !== "admin" &&
      existingReading.uploaded_by !== parseInt(user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    await db.run("DELETE FROM sunday_readings WHERE id = ?", id);

    res.json({
      success: true,
      message: "Sunday reading deleted successfully",
    });
  } catch (error) {
    console.error("Delete reading error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting Sunday reading",
    });
  }
};

export const handleGetCurrentWeekReading: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();

    // Get the most recent Sunday reading
    const reading = await db.get(`
      SELECT 
        r.id, r.title, r.reading_text, r.pdf_path, r.sunday_date, 
        r.created_at, u.username as uploaded_by
      FROM sunday_readings r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.sunday_date <= date('now')
      ORDER BY r.sunday_date DESC
      LIMIT 1
    `);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "No Sunday reading available",
      });
    }

    const formattedReading: SundayReading = {
      id: reading.id.toString(),
      title: reading.title,
      reading_text: reading.reading_text,
      pdf_url: reading.pdf_path,
      sunday_date: reading.sunday_date,
      uploaded_by: reading.uploaded_by,
      created_at: reading.created_at,
    };

    res.json({
      success: true,
      data: formattedReading,
    });
  } catch (error) {
    console.error("Get current week reading error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving current week reading",
    });
  }
};
