import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  Calendar,
  User,
  Plus,
  Edit2,
  Trash2,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SundayReading, PaginatedResponse } from "@shared/api";
import { useToast } from "@/components/ui/use-toast";

const SundayReadingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<SundayReading[]>([]);
  const [currentReading, setCurrentReading] = useState<SundayReading | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReading, setSelectedReading] = useState<SundayReading | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchReadings();
    fetchCurrentReading();
  }, []);

  const fetchReadings = async () => {
    try {
      const response = await fetch("/api/readings?limit=20");
      if (response.ok) {
        const data: PaginatedResponse<SundayReading> = await response.json();
        setReadings(data.results);
      }
    } catch (error) {
      console.error("Error fetching readings:", error);
      toast({
        title: "Error",
        description: "Failed to load Sunday readings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentReading = async () => {
    try {
      const response = await fetch("/api/readings/current");
      if (response.ok) {
        const data = await response.json();
        setCurrentReading(data.data);
      }
    } catch (error) {
      console.error("Error fetching current reading:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredReadings = readings.filter(
    (reading) =>
      reading.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.reading_text?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Sunday readings...</p>
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
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sunday Readings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the weekly liturgical readings and deepen your understanding
            of God's word
          </p>
        </div>

        {/* Current Week's Reading */}
        {currentReading && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    This Week's Reading
                  </CardTitle>
                  <div className="flex items-center text-blue-100">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(currentReading.sunday_date)}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Current
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">
                {currentReading.title}
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white/90 leading-relaxed line-clamp-4">
                  {currentReading.reading_text}
                </p>
                {currentReading.reading_text &&
                  currentReading.reading_text.length > 200 && (
                    <Button
                      variant="outline"
                      className="mt-4 border-white/30 text-white hover:bg-white/10"
                      onClick={() => setSelectedReading(currentReading)}
                    >
                      Read Full Text
                    </Button>
                  )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center text-blue-100 text-sm">
                  <User className="h-4 w-4 mr-1" />
                  <span>Uploaded by {currentReading.uploaded_by}</span>
                </div>
                {currentReading.pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search readings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {isAdmin && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
          )}
        </div>

        {/* Readings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReadings.map((reading) => (
            <Card
              key={reading.id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {reading.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(reading.sunday_date)}</span>
                    </div>
                  </div>
                  {reading.id === currentReading?.id && (
                    <Badge variant="default" className="ml-2">
                      Current
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {reading.reading_text}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>{reading.uploaded_by}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReading(reading)}
                    >
                      Read More
                    </Button>

                    {isAdmin && (
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReadings.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? "No readings found" : "No Sunday readings yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for the latest Sunday readings"}
            </p>
            {isAdmin && !searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Reading
              </Button>
            )}
          </div>
        )}

        {/* Reading Detail Modal */}
        {selectedReading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {selectedReading.title}
                    </CardTitle>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(selectedReading.sunday_date)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedReading(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedReading.reading_text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>Uploaded by {selectedReading.uploaded_by}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(
                        selectedReading.created_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedReading.pdf_url && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SundayReadingsPage;
