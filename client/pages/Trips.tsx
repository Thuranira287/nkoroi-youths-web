import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Camera,
  Calendar,
  User,
  Plus,
  Edit2,
  Trash2,
  Search,
  Image,
  Upload,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TripAlbum, Photo, PaginatedResponse } from "@shared/api";
import { useToast } from "@/components/ui/use-toast";
import TripAlbumFormModal from "../components/forms/TripAlbumFormModal";
//import FileUpload from '../../../../merisho-hub/client/components/FileUpload';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TripsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [tripAlbums, setTripAlbums] = useState<TripAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<TripAlbum | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchTripAlbums();
  }, [currentPage]);

  const fetchTripAlbums = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(
        `/api/trips?limit=${itemsPerPage}&offset=${offset}`,
      );
      if (response.ok) {
        const data: PaginatedResponse<TripAlbum> = await response.json();
        setTripAlbums(data.results);
        setTotalCount(data.count);
      } else {
        toast({
          title: "Error",
          description: "Failed to load trip albums",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching trip albums:", error);
      toast({
        title: "Error",
        description: "Failed to load trip albums",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      setPhotosLoading(true);
      const response = await fetch(`/api/trips/${albumId}/photos`);
      if (response.ok) {
        const data = await response.json();
        setAlbumPhotos(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load album photos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching album photos:", error);
      toast({
        title: "Error",
        description: "Failed to load album photos",
        variant: "destructive",
      });
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleCreateAlbum = async (albumData: any) => {
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(albumData),
      });

      if (response.ok) {
        const newAlbum = await response.json();
        setTripAlbums([newAlbum.data, ...tripAlbums]);
        setShowCreateForm(false);
        toast({
          title: "Success",
          description: "Trip album created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create trip album",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating trip album:", error);
      toast({
        title: "Error",
        description: "Failed to create trip album",
        variant: "destructive",
      });
    }
  };

  const handleEditAlbum = async (albumData: any) => {
    if (!selectedAlbum) return;

    try {
      const response = await fetch(`/api/trips/${selectedAlbum.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(albumData),
      });

      if (response.ok) {
        const updatedAlbum = await response.json();
        setTripAlbums(
          tripAlbums.map((album) =>
            album.id === selectedAlbum.id ? updatedAlbum.data : album,
          ),
        );
        setShowEditForm(false);
        setSelectedAlbum(null);
        toast({
          title: "Success",
          description: "Trip album updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update trip album",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating trip album:", error);
      toast({
        title: "Error",
        description: "Failed to update trip album",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const response = await fetch(`/api/trips/${albumId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTripAlbums(tripAlbums.filter((album) => album.id !== albumId));
        toast({
          title: "Success",
          description: "Trip album deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete trip album",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting trip album:", error);
      toast({
        title: "Error",
        description: "Failed to delete trip album",
        variant: "destructive",
      });
    }
  };

  const handleViewAlbum = (album: TripAlbum) => {
    setSelectedAlbum(album);
    fetchAlbumPhotos(album.id);
    setShowPhotoGallery(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredAlbums = tripAlbums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && tripAlbums.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip albums...</p>
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
            <div className="bg-purple-600 p-4 rounded-full">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trip Albums & Photo Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Relive memories from our pilgrimages, retreats, and fellowship trips
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search albums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {totalCount} total albums
            </Badge>
          </div>

          {isAdmin && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          )}
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAlbums.map((album) => (
            <Card
              key={album.id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative">
                {album.cover_photo ? (
                  <img
                    src={album.cover_photo}
                    alt={album.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-white opacity-60" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/20 text-white">
                    {album.photo_count || 0} photos
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  {album.title}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(album.created_at)}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {album.description && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                    {album.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>Created by {album.created_by}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAlbum(album)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>

                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAlbum(album);
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
                              <AlertDialogTitle>Delete Album</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this album? This
                                will also delete all photos in the album. This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAlbum(album.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAlbums.length === 0 && !loading && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? "No albums found" : "No trip albums yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start documenting your spiritual journeys and community events"}
            </p>
            {isAdmin && !searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Album
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

        {/* Photo Gallery Modal */}
        <Dialog open={showPhotoGallery} onOpenChange={setShowPhotoGallery}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                {selectedAlbum?.title}
              </DialogTitle>
            </DialogHeader>

            {photosLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading photos...</span>
              </div>
            ) : albumPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {albumPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Album photo"}
                      className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No photos in this album yet</p>
                {isAdmin && (
                  <Button className="mt-4" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Form Modal */}
        {showCreateForm && (
          <TripAlbumFormModal
            trigger={<Button>Create New Album</Button>}
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateAlbum}
            title="Create New Album"
          />
        )}

        {/* Edit Form Modal */}
        {showEditForm && selectedAlbum && (
          <TripAlbumFormModal
            trigger={<Button>Create New Album</Button>}
            isOpen={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              setSelectedAlbum(null);
            }}
            onSubmit={handleEditAlbum}
            title="Edit Album"
            initialData={selectedAlbum}
          />
        )}
      </div>
    </div>
  );
};

export default TripsPage;
