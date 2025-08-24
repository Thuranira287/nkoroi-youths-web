import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDatabase } from "./database/db";
import {
  rateLimit,
  sanitizeInput,
  validateRequestOrigin,
  requestLogger,
  securityHeaders,
} from "./middleware/security";

// Route handlers
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleRegister,
  handleLogout,
  handleGetUser,
  authenticateToken,
  requireAdmin,
} from "./routes/auth";
import { handleGetDailyQuote, handleGetAllQuotes } from "./routes/daily-quotes";
import {
  handleGetAnnouncements,
  handleGetAnnouncement,
  handleCreateAnnouncement,
  handleUpdateAnnouncement,
  handleDeleteAnnouncement,
} from "./routes/announcements";
import {
  handleGetTripAlbums,
  handleGetTripAlbum,
  handleCreateTripAlbum,
  handleUpdateTripAlbum,
  handleDeleteTripAlbum,
  handleGetAlbumPhotos,
  handleUploadPhoto,
  handleDeletePhoto,
} from "./routes/trips";
import {
  handleGetReadings,
  handleGetReading,
  handleCreateReading,
  handleUpdateReading,
  handleDeleteReading,
  handleGetCurrentWeekReading,
} from "./routes/readings";
import {
  handleGetRosaryMysteries,
  handleGetMysteryInstructions,
} from "./routes/rosary";
import {
  handleGetBibleBooks,
  handleGetBibleChapter,
  handleSearchBible,
  handleGetRandomVerse,
  handleGetVerseOfTheDay,
} from "./routes/bible";
import {
  uploadSingle,
  uploadMultiple,
  handleSingleUpload,
  handleMultipleUpload,
  handleServeFile,
  handleDeleteFile,
  handleUploadError,
} from "./routes/uploads";

export function createServer() {
  const app = express();

  // Initialize database
  initDatabase().catch(console.error);

  // Security middleware
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(validateRequestOrigin);
  app.use(sanitizeInput);

  // Rate limiting
  app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 })); // 5 auth requests per 15 minutes
  app.use("/api", rateLimit({ windowMs: 60 * 1000, maxRequests: 100 })); // 100 API requests per minute

  // Basic middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/user", authenticateToken, handleGetUser);

  // Daily quotes routes
  app.get("/api/daily-quote", handleGetDailyQuote);
  app.get("/api/quotes", authenticateToken, requireAdmin, handleGetAllQuotes);

  // Announcements routes
  app.get("/api/announcements", handleGetAnnouncements);
  app.get("/api/announcements/:id", handleGetAnnouncement);
  app.post(
    "/api/announcements",
    authenticateToken,
    requireAdmin,
    handleCreateAnnouncement,
  );
  app.put(
    "/api/announcements/:id",
    authenticateToken,
    requireAdmin,
    handleUpdateAnnouncement,
  );
  app.delete(
    "/api/announcements/:id",
    authenticateToken,
    requireAdmin,
    handleDeleteAnnouncement,
  );

  // Trip albums routes
  app.get("/api/trips", handleGetTripAlbums);
  app.get("/api/trips/:id", handleGetTripAlbum);
  app.post(
    "/api/trips",
    authenticateToken,
    requireAdmin,
    handleCreateTripAlbum,
  );
  app.put(
    "/api/trips/:id",
    authenticateToken,
    requireAdmin,
    handleUpdateTripAlbum,
  );
  app.delete(
    "/api/trips/:id",
    authenticateToken,
    requireAdmin,
    handleDeleteTripAlbum,
  );

  // Photos routes
  app.get("/api/trips/:id/photos", handleGetAlbumPhotos);
  app.post(
    "/api/trips/:id/photos",
    authenticateToken,
    requireAdmin,
    handleUploadPhoto,
  );
  app.delete(
    "/api/trips/:albumId/photos/:photoId",
    authenticateToken,
    requireAdmin,
    handleDeletePhoto,
  );

  // Sunday readings routes
  app.get("/api/readings", handleGetReadings);
  app.get("/api/readings/current", handleGetCurrentWeekReading);
  app.get("/api/readings/:id", handleGetReading);
  app.post(
    "/api/readings",
    authenticateToken,
    requireAdmin,
    handleCreateReading,
  );
  app.put(
    "/api/readings/:id",
    authenticateToken,
    requireAdmin,
    handleUpdateReading,
  );
  app.delete(
    "/api/readings/:id",
    authenticateToken,
    requireAdmin,
    handleDeleteReading,
  );

  // Rosary routes
  app.get("/api/rosary", handleGetRosaryMysteries);
  app.get("/api/rosary/instructions", handleGetMysteryInstructions);

  // Bible routes
  app.get("/api/bible/books", handleGetBibleBooks);
  app.get("/api/bible/books/:bookId/chapters/:chapter", handleGetBibleChapter);
  app.get("/api/bible/search", handleSearchBible);
  app.get("/api/bible/random", handleGetRandomVerse);
  app.get("/api/bible/verse-of-day", handleGetVerseOfTheDay);

  // File upload routes
  app.post(
    "/api/upload/single",
    authenticateToken,
    requireAdmin,
    uploadSingle,
    handleSingleUpload,
  );
  app.post(
    "/api/upload/multiple",
    authenticateToken,
    requireAdmin,
    uploadMultiple,
    handleMultipleUpload,
  );
  app.get("/api/uploads/:filename", handleServeFile);
  app.delete("/api/uploads/:filename", authenticateToken, handleDeleteFile);

  // Add upload error handling middleware
  app.use(handleUploadError);

  return app;
}
