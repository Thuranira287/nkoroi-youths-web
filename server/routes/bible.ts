import { RequestHandler } from "express";
import { BibleBook, BibleVerse, BibleSearchResult } from "@shared/api";
import { getDatabase } from "../database/db";

export const handleGetBibleBooks: RequestHandler = async (req, res) => {
  try {
    const { testament } = req.query;
    const db = await getDatabase();

    let query = "SELECT * FROM bible_books";
    let params: any[] = [];

    if (testament && ["old", "new"].includes(testament as string)) {
      query += " WHERE testament = ?";
      params.push(testament);
    }

    query += " ORDER BY testament, book_order";

    const books = await db.all(query, ...params);

    const formattedBooks: BibleBook[] = books.map((book) => ({
      id: book.id.toString(),
      name: book.name,
      testament: book.testament,
      chapters: book.chapters,
    }));

    res.json({
      success: true,
      data: formattedBooks,
    });
  } catch (error) {
    console.error("Get bible books error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving Bible books",
    });
  }
};

export const handleGetBibleChapter: RequestHandler = async (req, res) => {
  try {
    const { bookId, chapter } = req.params;
    const db = await getDatabase();

    // Get book info
    const book = await db.get("SELECT * FROM bible_books WHERE id = ?", bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Bible book not found",
      });
    }

    // Get verses for the chapter
    const verses = await db.all(
      "SELECT * FROM bible_verses WHERE book_id = ? AND chapter = ? ORDER BY verse",
      bookId,
      chapter,
    );

    const formattedVerses: BibleVerse[] = verses.map((verse) => ({
      id: verse.id.toString(),
      book: book.name,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    }));

    res.json({
      success: true,
      data: {
        book: book.name,
        chapter: parseInt(chapter),
        verses: formattedVerses,
      },
    });
  } catch (error) {
    console.error("Get bible chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving Bible chapter",
    });
  }
};

export const handleSearchBible: RequestHandler = async (req, res) => {
  try {
    const { q, testament, book, limit = 50 } = req.query;

    if (!q || typeof q !== "string" || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 3 characters long",
      });
    }

    const db = await getDatabase();
    const searchTerm = `%${q.trim()}%`;

    let query = `
      SELECT v.id, b.name as book, v.chapter, v.verse, v.text
      FROM bible_verses v
      JOIN bible_books b ON v.book_id = b.id
      WHERE v.text LIKE ?
    `;
    let params: any[] = [searchTerm];

    if (testament && ["old", "new"].includes(testament as string)) {
      query += " AND b.testament = ?";
      params.push(testament);
    }

    if (book) {
      query += " AND b.name LIKE ?";
      params.push(`%${book}%`);
    }

    query += " ORDER BY b.book_order, v.chapter, v.verse LIMIT ?";
    params.push(parseInt(limit as string));

    const results = await db.all(query, ...params);

    const searchResults: BibleSearchResult[] = results.map((result) => {
      // Highlight the search term in the text
      const highlightedText = result.text.replace(
        new RegExp(`(${q.trim()})`, "gi"),
        "<mark>$1</mark>",
      );

      return {
        book: result.book,
        chapter: result.chapter,
        verse: result.verse,
        text: result.text,
        highlight: highlightedText,
      };
    });

    res.json({
      success: true,
      data: searchResults,
      query: q,
      count: searchResults.length,
    });
  } catch (error) {
    console.error("Search bible error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching Bible",
    });
  }
};

export const handleGetRandomVerse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();

    // Get a random verse
    const verse = await db.get(`
      SELECT v.id, b.name as book, v.chapter, v.verse, v.text
      FROM bible_verses v
      JOIN bible_books b ON v.book_id = b.id
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: "No verses available",
      });
    }

    const randomVerse: BibleVerse = {
      id: verse.id.toString(),
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    };

    res.json({
      success: true,
      data: randomVerse,
    });
  } catch (error) {
    console.error("Get random verse error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving random verse",
    });
  }
};

export const handleGetVerseOfTheDay: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();

    // Get a "verse of the day" based on current date
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Get total verse count
    const totalVerses = await db.get(
      "SELECT COUNT(*) as count FROM bible_verses",
    );
    const verseIndex = dayOfYear % totalVerses.count;

    const verse = await db.get(
      `
      SELECT v.id, b.name as book, v.chapter, v.verse, v.text
      FROM bible_verses v
      JOIN bible_books b ON v.book_id = b.id
      ORDER BY v.id
      LIMIT 1 OFFSET ?
    `,
      verseIndex,
    );

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: "No verse available",
      });
    }

    const verseOfDay: BibleVerse = {
      id: verse.id.toString(),
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    };

    res.json({
      success: true,
      data: verseOfDay,
      date: today.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Get verse of the day error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving verse of the day",
    });
  }
};
