import { RequestHandler } from "express";
import { DailyQuote } from "@shared/api";
import { getDatabase } from "../database/db";

export const handleGetDailyQuote: RequestHandler = async (req, res) => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const db = await getDatabase();

    // Get quote based on day of year, cycling through available quotes
    const totalQuotes = await db.get(
      "SELECT COUNT(*) as count FROM daily_quotes",
    );
    const quoteIndex = (dayOfYear % totalQuotes.count) + 1;

    const quote = await db.get(
      "SELECT * FROM daily_quotes WHERE date_index = ?",
      quoteIndex,
    );

    if (!quote) {
      // Fallback to first quote if none found
      const fallbackQuote = await db.get(
        "SELECT * FROM daily_quotes ORDER BY date_index LIMIT 1",
      );

      if (!fallbackQuote) {
        return res.status(500).json({
          success: false,
          message: "No quotes available",
        });
      }

      const dailyQuote: DailyQuote = {
        id: `quote_${today.toISOString().split("T")[0]}`,
        verse: fallbackQuote.verse,
        reference: fallbackQuote.reference,
        date: today.toISOString().split("T")[0],
      };

      return res.json(dailyQuote);
    }

    const dailyQuote: DailyQuote = {
      id: `quote_${today.toISOString().split("T")[0]}`,
      verse: quote.verse,
      reference: quote.reference,
      date: today.toISOString().split("T")[0],
    };

    res.json(dailyQuote);
  } catch (error) {
    console.error("Daily quote error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving daily quote",
    });
  }
};

// Get all quotes (for admin purposes)
export const handleGetAllQuotes: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const quotes = await db.all(
      "SELECT * FROM daily_quotes ORDER BY date_index",
    );

    const formattedQuotes = quotes.map((quote) => ({
      id: `quote_${quote.date_index}`,
      verse: quote.verse,
      reference: quote.reference,
      date: new Date().toISOString().split("T")[0], // Current date for display
    }));

    res.json({
      success: true,
      data: formattedQuotes,
      count: quotes.length,
    });
  } catch (error) {
    console.error("Get all quotes error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving quotes",
    });
  }
};
