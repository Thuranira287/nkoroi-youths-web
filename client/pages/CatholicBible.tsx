import React, { useState, useEffect, useCallback } from "react";
import {
  Book,
  Search,
  Star,
  Shuffle,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Heart,
  Calendar,
  Bookmark,
  Copy,
  Share2,
  Volume2,
  Eye,
  Settings,
  ArrowUp,
  ArrowDown,
  Home,
  List,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import {
  BibleBook,
  BibleVerse,
  BibleSearchResult,
  BibleChapter,
} from "../services/bibleApi";
import enhancedBibleApiService from "../services/bibleApi";

const CatholicBiblePage: React.FC = () => {
  const { toast } = useToast();

  // Core data state
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [verseOfDay, setVerseOfDay] = useState<BibleVerse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<BibleChapter | null>(
    null,
  );

  // Loading states
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTestament, setSelectedTestament] = useState<
    "all" | "old" | "new"
  >("all");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedBookForChapters, setSelectedBookForChapters] =
    useState<BibleBook | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [readingMode, setReadingMode] = useState<"normal" | "focus">("normal");

  // User preferences
  const [bookmarkVerses, setBookmarkVerses] = useState<string[]>([]);
  const [recentChapters, setRecentChapters] = useState<
    Array<{ bookId: string; chapter: number; book: string }>
  >([]);
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);

  // Navigation state
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [booksData, verseData] = await Promise.all([
          enhancedBibleApiService.getBooks(),
          enhancedBibleApiService.getVerseOfTheDay(),
        ]);

        setBooks(booksData);
        setVerseOfDay(verseData);

        // Load user preferences from localStorage
        const savedBookmarks = localStorage.getItem("bible_bookmarks");
        if (savedBookmarks) {
          setBookmarkVerses(JSON.parse(savedBookmarks));
        }

        const savedRecent = localStorage.getItem("bible_recent_chapters");
        if (savedRecent) {
          setRecentChapters(JSON.parse(savedRecent));
        }

        const savedFavorites = localStorage.getItem("bible_favorite_books");
        if (savedFavorites) {
          setFavoriteBooks(JSON.parse(savedFavorites));
        }

        const savedFontSize = localStorage.getItem("bible_font_size");
        if (savedFontSize) {
          setFontSize(parseInt(savedFontSize));
        }
      } catch (error) {
        console.error("Error loading Bible data:", error);
        toast({
          title: "Error",
          description: "Failed to load Bible data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("bible_bookmarks", JSON.stringify(bookmarkVerses));
  }, [bookmarkVerses]);

  useEffect(() => {
    localStorage.setItem(
      "bible_recent_chapters",
      JSON.stringify(recentChapters),
    );
  }, [recentChapters]);

  useEffect(() => {
    localStorage.setItem("bible_favorite_books", JSON.stringify(favoriteBooks));
  }, [favoriteBooks]);

  useEffect(() => {
    localStorage.setItem("bible_font_size", fontSize.toString());
  }, [fontSize]);

  // Enhanced search functionality
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      toast({
        title: "Search too short",
        description: "Please enter at least 2 characters to search.",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    try {
      const results = await enhancedBibleApiService.searchVerses(
        searchTerm,
        selectedTestament !== "all" ? selectedTestament : undefined,
      );

      setSearchResults(results);
      setActiveTab("search");

      if (results.length === 0) {
        toast({
          title: "No results found",
          description: `No verses found containing "${searchTerm}". Try different search terms.`,
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${results.length} verses containing "${searchTerm}"`,
        });
      }
    } catch (error) {
      console.error("Error searching Bible:", error);
      toast({
        title: "Search failed",
        description: "Failed to search the Bible. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, selectedTestament, toast]);

  // Random verse functionality
  const handleRandomVerse = async () => {
    try {
      const verse = await enhancedBibleApiService.getRandomVerse();
      setVerseOfDay(verse);
      toast({
        title: "Random verse loaded",
        description: `${verse.book} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      console.error("Error fetching random verse:", error);
      toast({
        title: "Error",
        description: "Failed to load random verse.",
        variant: "destructive",
      });
    }
  };

  // Chapter loading with history tracking
  const loadChapter = async (bookId: string, chapter: number) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    setChapterLoading(true);
    try {
      const chapterData = await enhancedBibleApiService.getChapter(
        bookId,
        chapter,
      );
      setSelectedChapter(chapterData);
      setActiveTab("chapter");

      // Add to recent chapters
      const newRecent = { bookId, chapter, book: book.name };
      setRecentChapters((prev) => {
        const filtered = prev.filter(
          (r) => !(r.bookId === bookId && r.chapter === chapter),
        );
        return [newRecent, ...filtered].slice(0, 10); // Keep last 10
      });

      toast({
        title: "Chapter loaded",
        description: `${book.name} Chapter ${chapter}`,
      });
    } catch (error) {
      console.error("Error loading chapter:", error);
      toast({
        title: "Error",
        description: "Failed to load chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChapterLoading(false);
    }
  };

  const showBookChapters = (book: BibleBook) => {
    setSelectedBookForChapters(book);
    setActiveTab("chapters");
  };

  // Bookmark functionality
  const toggleBookmark = (verseId: string) => {
    setBookmarkVerses((prev) =>
      prev.includes(verseId)
        ? prev.filter((id) => id !== verseId)
        : [...prev, verseId],
    );
  };

  const toggleFavoriteBook = (bookId: string) => {
    setFavoriteBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId],
    );
  };

  // Navigation functions
  const navigateChapter = (direction: "prev" | "next") => {
    if (!selectedChapter) return;

    const currentBook = books.find((b) => b.name === selectedChapter.book);
    if (!currentBook) return;

    const currentChapter = selectedChapter.chapter;

    if (direction === "next" && currentChapter < currentBook.chapters) {
      loadChapter(currentBook.id, currentChapter + 1);
    } else if (direction === "prev" && currentChapter > 1) {
      loadChapter(currentBook.id, currentChapter - 1);
    }
  };

  // Copy verse functionality
  const copyVerse = async (verse: BibleVerse) => {
    const text = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Verse copied",
        description: "Verse copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy verse to clipboard",
        variant: "destructive",
      });
    }
  };

  // Share verse functionality
  const shareVerse = async (verse: BibleVerse) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${verse.book} ${verse.chapter}:${verse.verse}`,
          text: `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`,
        });
      } catch (error) {
        // Fallback to copy
        copyVerse(verse);
      }
    } else {
      copyVerse(verse);
    }
  };

  // Filter books
  const filteredBooks = books.filter((book) => {
    if (selectedTestament !== "all" && book.testament !== selectedTestament) {
      return false;
    }
    return true;
  });

  const oldTestamentBooks = filteredBooks.filter(
    (book) => book.testament === "old",
  );
  const newTestamentBooks = filteredBooks.filter(
    (book) => book.testament === "new",
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Catholic Bible...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Book className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Catholic Bible
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Access the complete Catholic Bible with enhanced search,
            bookmarking, and reading features. Grow in your understanding of
            God's word with our comprehensive Bible study tools.
          </p>

          {/* Quick stats */}
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>{books.length} Books</span>
            <span>{bookmarkVerses.length} Bookmarks</span>
            <span>{recentChapters.length} Recent</span>
          </div>
        </div>

        {/* Verse of the Day */}
        {verseOfDay && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-6 w-6 mr-3" />
                  <CardTitle className="text-2xl">Verse of the Day</CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={handleRandomVerse}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => shareVerse(verseOfDay)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="text-xl italic mb-4 leading-relaxed">
                "{verseOfDay.text}"
              </blockquote>
              <cite className="text-blue-200 font-medium">
                — {verseOfDay.book} {verseOfDay.chapter}:{verseOfDay.verse}
              </cite>
            </CardContent>
          </Card>
        )}

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Search the Bible
              </div>
              <Badge variant="outline">Enhanced Search</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search for words, phrases, or topics (e.g., 'love', 'salvation', 'peace')..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="text-lg"
                  />
                </div>

                <div className="flex gap-2">
                  <Select
                    value={selectedTestament}
                    onValueChange={(value: any) => setSelectedTestament(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Books</SelectItem>
                      <SelectItem value="old">Old Testament</SelectItem>
                      <SelectItem value="new">New Testament</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading || searchTerm.length < 2}
                    className="px-6"
                  >
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              {/* Search suggestions */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Try searching:</span>
                {["love", "peace", "hope", "faith", "salvation", "joy"].map(
                  (term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm(term);
                        setTimeout(handleSearch, 100);
                      }}
                      className="text-xs"
                    >
                      {term}
                    </Button>
                  ),
                )}
              </div>

              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p className="text-sm text-gray-500">
                  Please enter at least 2 characters to search
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reading Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Reading Settings
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Font:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {fontSize}px
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="outline" className="flex items-center">
                  <Bookmark className="h-3 w-3 mr-1" />
                  {bookmarkVerses.length} Bookmarks
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Button
                  variant={readingMode === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReadingMode("normal")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Normal
                </Button>
                <Button
                  variant={readingMode === "focus" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReadingMode("focus")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Focus Mode
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Chapters */}
        {recentChapters.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Recent Chapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {recentChapters.slice(0, 6).map((recent, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto p-3"
                    onClick={() => loadChapter(recent.bookId, recent.chapter)}
                  >
                    <div>
                      <div className="font-medium text-xs">{recent.book}</div>
                      <div className="text-xs text-gray-500">
                        Chapter {recent.chapter}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="browse" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Books
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search Results
            </TabsTrigger>
            <TabsTrigger value="chapter" className="flex items-center">
              <Book className="h-4 w-4 mr-2" />
              Reading
            </TabsTrigger>
          </TabsList>

          {/* Browse Books Tab */}
          <TabsContent value="browse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Old Testament */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                      Old Testament
                    </div>
                    <Badge variant="outline">
                      {oldTestamentBooks.length} books
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
                        : "space-y-2"
                    }
                  >
                    {oldTestamentBooks.map((book) => (
                      <div key={book.id} className="space-y-1">
                        <Button
                          variant="outline"
                          className="w-full justify-between h-auto p-3 hover:bg-purple-50"
                          onClick={() => showBookChapters(book)}
                        >
                          <div className="text-left">
                            <div className="flex items-center">
                              <div className="font-medium">{book.name}</div>
                              {favoriteBooks.includes(book.id) && (
                                <Star className="h-3 w-3 ml-2 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {book.chapters} chapters
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteBook(book.id);
                              }}
                              className="p-1"
                            >
                              <Heart
                                className={`h-3 w-3 ${favoriteBooks.includes(book.id) ? "text-red-500 fill-current" : "text-gray-400"}`}
                              />
                            </Button>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Button>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex-1"
                            onClick={() => loadChapter(book.id, 1)}
                          >
                            Ch 1
                          </Button>
                          {book.chapters > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs flex-1"
                              onClick={() =>
                                loadChapter(
                                  book.id,
                                  Math.floor(book.chapters / 2),
                                )
                              }
                            >
                              Ch {Math.floor(book.chapters / 2)}
                            </Button>
                          )}
                          {book.chapters > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs flex-1"
                              onClick={() =>
                                loadChapter(book.id, book.chapters)
                              }
                            >
                              Ch {book.chapters}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* New Testament */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-600" />
                      New Testament
                    </div>
                    <Badge variant="outline">
                      {newTestamentBooks.length} books
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
                        : "space-y-2"
                    }
                  >
                    {newTestamentBooks.map((book) => (
                      <div key={book.id} className="space-y-1">
                        <Button
                          variant="outline"
                          className="w-full justify-between h-auto p-3 hover:bg-red-50"
                          onClick={() => showBookChapters(book)}
                        >
                          <div className="text-left">
                            <div className="flex items-center">
                              <div className="font-medium">{book.name}</div>
                              {favoriteBooks.includes(book.id) && (
                                <Star className="h-3 w-3 ml-2 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {book.chapters} chapters
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteBook(book.id);
                              }}
                              className="p-1"
                            >
                              <Heart
                                className={`h-3 w-3 ${favoriteBooks.includes(book.id) ? "text-red-500 fill-current" : "text-gray-400"}`}
                              />
                            </Button>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Button>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex-1"
                            onClick={() => loadChapter(book.id, 1)}
                          >
                            Ch 1
                          </Button>
                          {book.chapters > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs flex-1"
                              onClick={() =>
                                loadChapter(
                                  book.id,
                                  Math.floor(book.chapters / 2),
                                )
                              }
                            >
                              Ch {Math.floor(book.chapters / 2)}
                            </Button>
                          )}
                          {book.chapters > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs flex-1"
                              onClick={() =>
                                loadChapter(book.id, book.chapters)
                              }
                            >
                              Ch {book.chapters}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            {selectedBookForChapters ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      {selectedBookForChapters.name} - Chapters
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleFavoriteBook(selectedBookForChapters.id)
                        }
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${favoriteBooks.includes(selectedBookForChapters.id) ? "text-red-500 fill-current" : ""}`}
                        />
                        {favoriteBooks.includes(selectedBookForChapters.id)
                          ? "Favorited"
                          : "Add to Favorites"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("browse")}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Books
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
                    {Array.from(
                      { length: selectedBookForChapters.chapters },
                      (_, i) => i + 1,
                    ).map((chapter) => (
                      <Button
                        key={chapter}
                        variant="outline"
                        className="aspect-square p-2 hover:bg-blue-50"
                        onClick={() =>
                          loadChapter(selectedBookForChapters.id, chapter)
                        }
                        disabled={chapterLoading}
                      >
                        {chapterLoading ? "..." : chapter}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a book to view chapters
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Go to Browse Books and click on any book to see its chapters
                  </p>
                  <Button onClick={() => setActiveTab("browse")}>
                    Browse Books
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Results</span>
                  {searchResults.length > 0 && (
                    <Badge variant="outline">
                      {searchResults.length} verses found
                    </Badge>
                  )}
                </CardTitle>
                {searchResults.length > 0 && (
                  <p className="text-gray-600">
                    Found {searchResults.length} verses containing "{searchTerm}
                    "
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className="text-sm">
                              {result.book} {result.chapter}:{result.verse}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyVerse({
                                    book: result.book,
                                    chapter: result.chapter,
                                    verse: result.verse,
                                    text: result.text,
                                  })
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  shareVerse({
                                    book: result.book,
                                    chapter: result.chapter,
                                    verse: result.verse,
                                    text: result.text,
                                  })
                                }
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p
                            className="text-gray-700 leading-relaxed"
                            style={{ fontSize: `${fontSize}px` }}
                            dangerouslySetInnerHTML={{
                              __html: result.highlight || result.text,
                            }}
                          />
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (result.bookId) {
                                  loadChapter(result.bookId, result.chapter);
                                }
                              }}
                            >
                              Read Chapter
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : searchTerm && !searchLoading ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try different search terms or check your spelling
                    </p>
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("love")}
                      >
                        Search "love"
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("peace")}
                      >
                        Search "peace"
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("hope")}
                      >
                        Search "hope"
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Search the Bible
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Enter a word or phrase to search through Scripture
                    </p>
                    <Input
                      placeholder="Try searching for 'love', 'peace', or 'salvation'..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md mx-auto"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chapter Reading Tab */}
          <TabsContent value="chapter">
            {selectedChapter ? (
              <Card
                className={readingMode === "focus" ? "max-w-4xl mx-auto" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {selectedChapter.book} Chapter {selectedChapter.chapter}
                    </span>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {selectedChapter.verses.length} verses
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateChapter("prev")}
                          disabled={
                            !selectedChapter || selectedChapter.chapter <= 1
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("browse")}
                        >
                          <Home className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateChapter("next")}
                          disabled={
                            !selectedChapter ||
                            !books.find(
                              (b) => b.name === selectedChapter.book,
                            ) ||
                            selectedChapter.chapter >=
                              (books.find(
                                (b) => b.name === selectedChapter.book,
                              )?.chapters || 0)
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="space-y-6"
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                    }}
                  >
                    {selectedChapter.verses.map((verse: BibleVerse) => (
                      <div
                        key={verse.id || `${verse.chapter}-${verse.verse}`}
                        className="flex group relative"
                      >
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4 flex-shrink-0">
                          {verse.verse}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed mb-2">
                            {verse.text}
                          </p>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleBookmark(
                                  verse.id ||
                                    `${verse.book}-${verse.chapter}-${verse.verse}`,
                                )
                              }
                              className={`text-xs ${
                                bookmarkVerses.includes(
                                  verse.id ||
                                    `${verse.book}-${verse.chapter}-${verse.verse}`,
                                )
                                  ? "text-yellow-600"
                                  : "text-gray-500"
                              }`}
                            >
                              <Star
                                className={`h-3 w-3 mr-1 ${
                                  bookmarkVerses.includes(
                                    verse.id ||
                                      `${verse.book}-${verse.chapter}-${verse.verse}`,
                                  )
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                              {bookmarkVerses.includes(
                                verse.id ||
                                  `${verse.book}-${verse.chapter}-${verse.verse}`,
                              )
                                ? "Bookmarked"
                                : "Bookmark"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyVerse(verse)}
                              className="text-xs text-gray-500"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareVerse(verse)}
                              className="text-xs text-gray-500"
                            >
                              <Share2 className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chapter Navigation Footer */}
                  <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => navigateChapter("prev")}
                      disabled={
                        !selectedChapter || selectedChapter.chapter <= 1
                      }
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Chapter
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {selectedChapter.book} Chapter {selectedChapter.chapter}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedChapter.verses.length} verses
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => navigateChapter("next")}
                      disabled={
                        !selectedChapter ||
                        !books.find((b) => b.name === selectedChapter.book) ||
                        selectedChapter.chapter >=
                          (books.find((b) => b.name === selectedChapter.book)
                            ?.chapters || 0)
                      }
                    >
                      Next Chapter
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a chapter to start reading
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose from the Old or New Testament books to begin
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => setActiveTab("browse")}>
                      Browse Books
                    </Button>
                    <Button variant="outline" onClick={handleRandomVerse}>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Random Verse
                    </Button>
                    {recentChapters.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const recent = recentChapters[0];
                          loadChapter(recent.bookId, recent.chapter);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Continue Reading
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CatholicBiblePage;
