import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Announcement, PaginatedResponse } from "@shared/api";
import { useToast } from "@/components/ui/use-toast";
import AnnouncementFormModal from "../components/forms/AnnouncementFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AnnouncementsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(
        `/api/announcements?limit=${itemsPerPage}&offset=${offset}`,
      );
      if (response.ok) {
        const data: PaginatedResponse<Announcement> = await response.json();
        setAnnouncements(data.results);
        setTotalCount(data.count);
      } else {
        toast({
          title: "Error",
          description: "Failed to load announcements",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const newAnnouncement = await response.json();
        setAnnouncements([newAnnouncement.data, ...announcements]);
        setShowCreateForm(false);
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const handleEditAnnouncement = async (announcementData: any) => {
    if (!selectedAnnouncement) return;

    try {
      const response = await fetch(
        `/api/announcements/${selectedAnnouncement.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(announcementData),
        },
      );

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        setAnnouncements(
          announcements.map((a) =>
            a.id === selectedAnnouncement.id ? updatedAnnouncement.data : a,
          ),
        );
        setShowEditForm(false);
        setSelectedAnnouncement(null);
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== announcementId));
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
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

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      announcement.venue?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && announcements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
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
            <div className="bg-green-600 p-4 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Announcements
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest meetings, events, and community
            activities
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {totalCount} total announcements
            </Badge>
          </div>

          {isAdmin && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          )}
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                isUpcoming(announcement.date) ? "ring-2 ring-green-200" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {announcement.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(announcement.date)}</span>
                    </div>
                    {announcement.time && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTime(announcement.time)}</span>
                      </div>
                    )}
                    {announcement.venue && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">
                          {announcement.venue}
                        </span>
                      </div>
                    )}
                  </div>
                  {isUpcoming(announcement.date) && (
                    <Badge variant="default" className="ml-2">
                      Upcoming
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {announcement.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>By {announcement.created_by}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setShowEditForm(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Announcement
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this announcement?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteAnnouncement(announcement.id)
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? "No announcements found" : "No announcements yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for the latest community updates"}
            </p>
            {isAdmin && !searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Announcement
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <AnnouncementFormModal
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateAnnouncement}
            title="Create New Announcement"
          />
        )}

        {/* Edit Form Modal */}
        {showEditForm && selectedAnnouncement && (
          <AnnouncementFormModal
            isOpen={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              setSelectedAnnouncement(null);
            }}
            onSubmit={handleEditAnnouncement}
            title="Edit Announcement"
            initialData={selectedAnnouncement}
          />
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
