import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Camera,
  Cross,
  ChevronRight,
  Quote,
  Book,
  Star,
  Heart,
  Sun,
  Play,
  Search,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DailyQuote, Announcement, TripAlbum, BibleVerse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import bibleApiService from "../services/bibleApi";

const HomePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([]);
  const [recentTrips, setRecentTrips] = useState<TripAlbum[]>([]);
  const [verseOfDay, setVerseOfDay] = useState<BibleVerse | null>(null);
  const [todaysMystery, setTodaysMystery] = useState<string>("");
  const [rosaryInstructions, setRosaryInstructions] = useState<any>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch daily quote
  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const response = await fetch("/api/daily-quote");
        if (response.ok) {
          const quote = await response.json();
          setDailyQuote(quote);
        }
      } catch (error) {
        console.error("Error fetching daily quote:", error);
        // Fallback quote
        setDailyQuote({
          id: "fallback",
          verse:
            "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
          reference: "Jeremiah 29:11",
          date: new Date().toISOString().split("T")[0],
        });
      }
    };

    fetchDailyQuote();
  }, []);

  // Fetch recent announcements, trips, Bible and Rosary data
  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const [announcementsRes, tripsRes, bibleRes, rosaryRes] =
          await Promise.all([
            fetch("/api/announcements?limit=3"),
            fetch("/api/trips?limit=3"),
            fetch("/api/bible/verse-of-day"),
            fetch("/api/rosary/instructions"),
          ]);

        if (announcementsRes.ok) {
          const announcements = await announcementsRes.json();
          setRecentAnnouncements(announcements.results || []);
        }

        if (tripsRes.ok) {
          const trips = await tripsRes.json();
          setRecentTrips(trips.results || []);
        }

        // Try Bible API service first, then fallback to local API
        try {
          const verse = await bibleApiService.getVerseOfTheDay();
          setVerseOfDay(verseOfDay);
        } catch (error) {
          console.warn("Bible API service failed, trying local API");
          if (bibleRes.ok) {
            const bibleData = await bibleRes.json();
            setVerseOfDay(bibleData.data);
          } else {
            // Final fallback verse when both APIs fail
            setVerseOfDay({
              id: "fallback",
              text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
              book: "Jeremiah",
              chapter: 29,
              verse: 11,
            });
          }
        }

        if (rosaryRes.ok) {
          const rosaryData = await rosaryRes.json();
          setRosaryInstructions(rosaryData.data);

          // Get today's mystery
          const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });
          const mysterySchedule = rosaryData.data.mysterySchedule;
          setTodaysMystery(mysterySchedule[today] || "Joyful Mysteries");
        }
      } catch (error) {
        console.error("Error fetching recent data:", error);
      }
    };

    fetchRecentData();
  }, []);

  const getMysteryIcon = (mysteryType: string) => {
    if (mysteryType.toLowerCase().includes("joyful"))
      return <Star className="h-5 w-5 text-yellow-500" />;
    if (mysteryType.toLowerCase().includes("sorrowful"))
      return <Cross className="h-5 w-5 text-red-500" />;
    if (mysteryType.toLowerCase().includes("glorious"))
      return <Sun className="h-5 w-5 text-orange-500" />;
    if (mysteryType.toLowerCase().includes("luminous"))
      return <Heart className="h-5 w-5 text-blue-500" />;
    return <Book className="h-5 w-5 text-gray-500" />;
  };

  const getMysteryColor = (mysteryType: string) => {
    if (mysteryType.toLowerCase().includes("joyful"))
      return "bg-yellow-50 border-yellow-200";
    if (mysteryType.toLowerCase().includes("sorrowful"))
      return "bg-red-50 border-red-200";
    if (mysteryType.toLowerCase().includes("glorious"))
      return "bg-orange-50 border-orange-200";
    if (mysteryType.toLowerCase().includes("luminous"))
      return "bg-blue-50 border-blue-200";
    return "bg-gray-50 border-gray-200";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Cross className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome to St. Bakhita
              <span className="block text-yellow-300">Catholic Youths</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Nkoroi Parish - Growing together in faith, fellowship, and
              service to Christ
            </p>

            {/* Real-time Date and Time */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4 text-center">
                <Calendar className="h-6 w-6 text-yellow-300" />
                <div>
                  <p className="text-lg font-semibold">
                    {formatDate(currentDate)}
                  </p>
                  <p className="text-blue-200 flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(currentDate)}</span>
                  </p>
                </div>
              </div>
            </div>

            {user && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-blue-100">
                  Welcome back,{" "}
                  <span className="font-semibold text-white">
                    {user.username}
                  </span>
                  !
                </p>
                {isAdmin && (
                  <p className="text-yellow-300 text-sm mt-1">
                    Admin Dashboard Available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Daily Bible Quote Section */}
      {dailyQuote && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Daily Bible Verse
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <Quote className="h-12 w-12 text-blue-600 mx-auto opacity-50" />
                  <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed italic">
                    "{dailyQuote.verse}"
                  </blockquote>
                  <cite className="text-lg font-semibold text-blue-600">
                    — {dailyQuote.reference}
                  </cite>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Our Community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the various ways we come together to worship, learn, and
              grow in our Catholic faith
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sunday Readings */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Sunday Readings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access this week's liturgical readings and reflect on God's
                  word together.
                </p>
                <Link to="/readings">
                  <Button className="w-full group/btn">
                    View Readings
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Announcements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Stay updated with our latest meetings, events, and community
                  activities.
                </p>
                <Link to="/announcements">
                  <Button variant="outline" className="w-full group/btn">
                    View Announcements
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Photo Albums */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Camera className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Trip Albums</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Relive memories from our pilgrimages, retreats, and fellowship
                  trips.
                </p>
                <Link to="/trips">
                  <Button variant="outline" className="w-full group/btn">
                    View Albums
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Catholic Bible */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Book className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl">Catholic Bible</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Read Scripture, search verses, and deepen your understanding
                  of God's word.
                </p>
                {verseOfDay && (
                <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium mb-1 uppercase tracking-wide">
                    Verse of the Day
                  </p>
                  <p className="text-sm text-amber-800 italic mb-2">
                    "{verseOfDay.text}"
                  </p>
                  <p className="text-xs text-amber-600 text-right">
                    — {verseOfDay.book} {verseOfDay.chapter}:{verseOfDay.verse}
                  </p>
                </div>
              )}
                <Link to="/bible">
                  <Button variant="outline" className="w-full group/btn">
                    Explore Bible
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Holy Rosary */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-rose-100 p-3 rounded-lg group-hover:bg-rose-200 transition-colors">
                    <Cross className="h-6 w-6 text-rose-600" />
                  </div>
                  <CardTitle className="text-xl">Holy Rosary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Pray the mysteries of Christ's life through the intercession
                  of Our Lady.
                </p>
                {todaysMystery && (
                  <div
                    className={`p-3 rounded-lg mb-4 border ${getMysteryColor(todaysMystery)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700">
                        Today's Mystery
                      </p>
                      {getMysteryIcon(todaysMystery)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {todaysMystery}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                  </div>
                )}
                <Link to="/rosary">
                  <Button variant="outline" className="w-full group/btn">
                    Pray Rosary
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Catholic Bible & Rosary Featured Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-rose-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Spiritual Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deepen your faith through Scripture and prayer with Our Lady
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Bible Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Book className="h-6 w-6 mr-3 text-amber-600" />
                  Scripture Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verseOfDay ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-2">
                        Verse of the Day
                      </h4>
                      <blockquote className="text-amber-800 italic leading-relaxed mb-3">
                        "{verseOfDay.text}"
                      </blockquote>
                      <cite className="text-amber-700 font-medium">
                        — {verseOfDay.book} {verseOfDay.chapter}:
                        {verseOfDay.verse}
                      </cite>
                    </div>
                    <div className="flex space-x-3">
                      <Link to="/bible" className="flex-1">
                        <Button className="w-full">
                          <Search className="h-4 w-4 mr-2" />
                          Search Scripture
                        </Button>
                      </Link>
                      <Link to="/bible">
                        <Button variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Browse Books
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Book className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Explore the Catholic Bible offline
                    </p>
                    <Link to="/bible">
                      <Button>
                        Open Bible
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rosary Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Cross className="h-6 w-6 mr-3 text-rose-600" />
                  Prayer & Devotion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysMystery ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg border ${getMysteryColor(todaysMystery)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Today's Rosary
                        </h4>
                        {getMysteryIcon(todaysMystery)}
                      </div>
                      <p className="text-gray-800 font-medium mb-1">
                        {todaysMystery}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          Guided Prayer Available
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link to="/rosary" className="flex-1">
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Begin Prayer
                        </Button>
                      </Link>
                      <Link to="/rosary">
                        <Button variant="outline">
                          <Heart className="h-4 w-4 mr-2" />
                          All Mysteries
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Cross className="h-12 w-12 text-rose-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Pray the Holy Rosary with guided mysteries
                    </p>
                    <Link to="/rosary">
                      <Button>
                        Start Praying
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activity Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Announcements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Latest Updates
                </h3>
                <Link
                  to="/announcements"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              <div className="space-y-4">
                {recentAnnouncements.length > 0 ? (
                  recentAnnouncements.map((announcement) => (
                    <Card
                      key={announcement.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {announcement.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {announcement.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {new Date(announcement.date).toLocaleDateString()}
                          </span>
                          {announcement.venue && (
                            <span>📍 {announcement.venue}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No announcements yet. Check back soon!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Trip Albums */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Recent Albums
                </h3>
                <Link
                  to="/trips"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              <div className="space-y-4">
                {recentTrips.length > 0 ? (
                  recentTrips.map((trip) => (
                    <Card
                      key={trip.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {trip.cover_photo ? (
                            <img
                              src={trip.cover_photo}
                              alt={trip.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Camera className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {trip.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {trip.photo_count} photos
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(trip.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No trip albums yet. Stay tuned for our adventures!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
