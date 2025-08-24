import { RequestHandler } from "express";
import {
  TripAlbum,
  Photo,
  CreateTripAlbumRequest,
  PaginatedResponse,
} from "@shared/api";
import { getDatabase } from "../database/db";

export const handleGetTripAlbums: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const db = await getDatabase();

    // Get total count
    const countResult = await db.get(
      "SELECT COUNT(*) as count FROM trip_albums",
    );
    const totalCount = countResult.count;

    // Get albums with user info and photo count, sorted by creation date (most recent first)
    const albums = await db.all(
      `
      SELECT 
        t.id, t.title, t.description, t.cover_photo, t.created_at,
        u.username as created_by,
        COUNT(p.id) as photo_count
      FROM trip_albums t
      JOIN users u ON t.created_by = u.id
      LEFT JOIN photos p ON t.id = p.album_id
      GROUP BY t.id, t.title, t.description, t.cover_photo, t.created_at, u.username
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `,
      limit,
      offset,
    );

    const formattedAlbums: TripAlbum[] = albums.map((album) => ({
      id: album.id.toString(),
      title: album.title,
      description: album.description,
      cover_photo: album.cover_photo,
      created_by: album.created_by,
      created_at: album.created_at,
      photo_count: album.photo_count,
    }));

    const response: PaginatedResponse<TripAlbum> = {
      results: formattedAlbums,
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
    console.error("Get trip albums error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving trip albums",
    });
  }
};

export const handleGetTripAlbum: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const album = await db.get(
      `
      SELECT 
        t.id, t.title, t.description, t.cover_photo, t.created_at,
        u.username as created_by,
        COUNT(p.id) as photo_count
      FROM trip_albums t
      JOIN users u ON t.created_by = u.id
      LEFT JOIN photos p ON t.id = p.album_id
      WHERE t.id = ?
      GROUP BY t.id, t.title, t.description, t.cover_photo, t.created_at, u.username
    `,
      id,
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Trip album not found",
      });
    }

    const formattedAlbum: TripAlbum = {
      id: album.id.toString(),
      title: album.title,
      description: album.description,
      cover_photo: album.cover_photo,
      created_by: album.created_by,
      created_at: album.created_at,
      photo_count: album.photo_count,
    };

    res.json({
      success: true,
      data: formattedAlbum,
    });
  } catch (error) {
    console.error("Get trip album error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving trip album",
    });
  }
};

export const handleCreateTripAlbum: RequestHandler = async (req, res) => {
  try {
    const { title, description }: CreateTripAlbumRequest = req.body;
    const user = (req as any).user;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const db = await getDatabase();

    const result = await db.run(
      "INSERT INTO trip_albums (title, description, created_by) VALUES (?, ?, ?)",
      title,
      description,
      parseInt(user.id),
    );

    // Get the created album
    const newAlbum = await db.get(
      `
      SELECT 
        t.id, t.title, t.description, t.cover_photo, t.created_at,
        u.username as created_by,
        0 as photo_count
      FROM trip_albums t
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `,
      result.lastID,
    );

    const formattedAlbum: TripAlbum = {
      id: newAlbum.id.toString(),
      title: newAlbum.title,
      description: newAlbum.description,
      cover_photo: newAlbum.cover_photo,
      created_by: newAlbum.created_by,
      created_at: newAlbum.created_at,
      photo_count: 0,
    };

    res.status(201).json({
      success: true,
      data: formattedAlbum,
      message: "Trip album created successfully",
    });
  } catch (error) {
    console.error("Create trip album error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating trip album",
    });
  }
};

export const handleUpdateTripAlbum: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description }: CreateTripAlbumRequest = req.body;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if album exists and user has permission
    const existingAlbum = await db.get(
      "SELECT created_by FROM trip_albums WHERE id = ?",
      id,
    );

    if (!existingAlbum) {
      return res.status(404).json({
        success: false,
        message: "Trip album not found",
      });
    }

    // Only admin or creator can update
    if (
      user.role !== "admin" &&
      existingAlbum.created_by !== parseInt(user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    // Update album
    await db.run(
      "UPDATE trip_albums SET title = ?, description = ? WHERE id = ?",
      title || null,
      description || null,
      id,
    );

    // Get updated album
    const updatedAlbum = await db.get(
      `
      SELECT 
        t.id, t.title, t.description, t.cover_photo, t.created_at,
        u.username as created_by,
        COUNT(p.id) as photo_count
      FROM trip_albums t
      JOIN users u ON t.created_by = u.id
      LEFT JOIN photos p ON t.id = p.album_id
      WHERE t.id = ?
      GROUP BY t.id, t.title, t.description, t.cover_photo, t.created_at, u.username
    `,
      id,
    );

    const formattedAlbum: TripAlbum = {
      id: updatedAlbum.id.toString(),
      title: updatedAlbum.title,
      description: updatedAlbum.description,
      cover_photo: updatedAlbum.cover_photo,
      created_by: updatedAlbum.created_by,
      created_at: updatedAlbum.created_at,
      photo_count: updatedAlbum.photo_count,
    };

    res.json({
      success: true,
      data: formattedAlbum,
      message: "Trip album updated successfully",
    });
  } catch (error) {
    console.error("Update trip album error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating trip album",
    });
  }
};

export const handleDeleteTripAlbum: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if album exists and user has permission
    const existingAlbum = await db.get(
      "SELECT created_by FROM trip_albums WHERE id = ?",
      id,
    );

    if (!existingAlbum) {
      return res.status(404).json({
        success: false,
        message: "Trip album not found",
      });
    }

    // Only admin or creator can delete
    if (
      user.role !== "admin" &&
      existingAlbum.created_by !== parseInt(user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    // Delete album (photos will be cascade deleted due to foreign key constraint)
    await db.run("DELETE FROM trip_albums WHERE id = ?", id);

    res.json({
      success: true,
      message: "Trip album deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip album error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting trip album",
    });
  }
};

export const handleGetAlbumPhotos: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const db = await getDatabase();

    // Check if album exists
    const album = await db.get("SELECT id FROM trip_albums WHERE id = ?", id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Trip album not found",
      });
    }

    // Get total count of photos in album
    const countResult = await db.get(
      "SELECT COUNT(*) as count FROM photos WHERE album_id = ?",
      id,
    );
    const totalCount = countResult.count;

    // Get photos for this album
    const photos = await db.all(
      `
      SELECT id, album_id, file_path, caption, uploaded_at
      FROM photos 
      WHERE album_id = ?
      ORDER BY uploaded_at DESC
      LIMIT ? OFFSET ?
    `,
      id,
      limit,
      offset,
    );

    const formattedPhotos: Photo[] = photos.map((photo) => ({
      id: photo.id.toString(),
      album_id: photo.album_id.toString(),
      url: photo.file_path,
      caption: photo.caption,
      uploaded_at: photo.uploaded_at,
    }));

    const response: PaginatedResponse<Photo> = {
      results: formattedPhotos,
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
    console.error("Get album photos error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving album photos",
    });
  }
};

export const handleUploadPhoto: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const db = await getDatabase();

    // Check if album exists
    const album = await db.get("SELECT id FROM trip_albums WHERE id = ?", id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Trip album not found",
      });
    }

    // In a real implementation, handle file upload here
    // For demo, we'll simulate a file upload
    const photoUrl = `/api/uploads/photo-${Date.now()}.jpg`;

    const result = await db.run(
      "INSERT INTO photos (album_id, file_path, caption) VALUES (?, ?, ?)",
      id,
      photoUrl,
      caption,
    );

    const newPhoto: Photo = {
      id: result.lastID!.toString(),
      album_id: id,
      url: photoUrl,
      caption,
      uploaded_at: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newPhoto,
      message: "Photo uploaded successfully",
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading photo",
    });
  }
};

export const handleDeletePhoto: RequestHandler = async (req, res) => {
  try {
    const { albumId, photoId } = req.params;
    const user = (req as any).user;

    const db = await getDatabase();

    // Check if photo exists and user has permission
    const photo = await db.get(
      `
      SELECT p.id, t.created_by
      FROM photos p
      JOIN trip_albums t ON p.album_id = t.id
      WHERE p.id = ? AND p.album_id = ?
    `,
      photoId,
      albumId,
    );

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Only admin or album creator can delete photos
    if (user.role !== "admin" && photo.created_by !== parseInt(user.id)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    await db.run(
      "DELETE FROM photos WHERE id = ? AND album_id = ?",
      photoId,
      albumId,
    );

    res.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting photo",
    });
  }
};
