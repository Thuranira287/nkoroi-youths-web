import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Plus,
  Users,
  FileText,
  Camera,
  Quote,
  Calendar,
  Edit2,
  Trash2,
  Upload,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import AnnouncementFormModal from '../components/forms/AnnouncementFormModal';
import TripAlbumFormModal from '../components/forms/TripAlbumFormModal';
import {
  Announcement,
  TripAlbum,
  DailyQuote,
  SundayReading,
  User,
  PaginatedResponse
} from '@shared/api';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnnouncements: 0,
    totalAlbums: 0,
    totalReadings: 0,
    recentActivity: []
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [albums, setAlbums] = useState<TripAlbum[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [announcementsRes, albumsRes] = await Promise.all([
        fetch('/api/announcements?limit=10'),
        fetch('/api/trips?limit=10')
      ]);

      if (announcementsRes.ok) {
        const announcementsData: PaginatedResponse<Announcement> = await announcementsRes.json();
        setAnnouncements(announcementsData.results);
        setStats(prev => ({ ...prev, totalAnnouncements: announcementsData.count }));
      }

      if (albumsRes.ok) {
        const albumsData: PaginatedResponse<TripAlbum> = await albumsRes.json();
        setAlbums(albumsData.results);
        setStats(prev => ({ ...prev, totalAlbums: albumsData.count }));
      }

      // Mock user stats for demo
      setStats(prev => ({ 
        ...prev, 
        totalUsers: 15, 
        totalReadings: 8,
        recentActivity: [
          'New user registered: john@example.com',
          'Announcement created: Youth Mass',
          'Photo album updated: Subukia Pilgrimage',
          'Daily quote updated'
        ]
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAnnouncementSuccess = (announcement: Announcement) => {
    const existingIndex = announcements.findIndex(a => a.id === announcement.id);
    if (existingIndex >= 0) {
      // Update existing
      setAnnouncements(prev =>
        prev.map((a, index) => index === existingIndex ? announcement : a)
      );
      toast({
        title: "Success",
        description: "Announcement updated successfully!",
      });
    } else {
      // Add new
      setAnnouncements(prev => [announcement, ...prev]);
      setStats(prev => ({ ...prev, totalAnnouncements: prev.totalAnnouncements + 1 }));
      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });
    }
  };

  const handleAlbumSuccess = (album: TripAlbum) => {
    const existingIndex = albums.findIndex(a => a.id === album.id);
    if (existingIndex >= 0) {
      // Update existing
      setAlbums(prev =>
        prev.map((a, index) => index === existingIndex ? album : a)
      );
      toast({
        title: "Success",
        description: "Trip album updated successfully!",
      });
    } else {
      // Add new
      setAlbums(prev => [album, ...prev]);
      setStats(prev => ({ ...prev, totalAlbums: prev.totalAlbums + 1 }));
      toast({
        title: "Success",
        description: "Trip album created successfully!",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        setStats(prev => ({ ...prev, totalAnnouncements: prev.totalAnnouncements - 1 }));
        toast({
          title: "Success",
          description: "Announcement deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete announcement",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setAlbums(prev => prev.filter(a => a.id !== id));
        setStats(prev => ({ ...prev, totalAlbums: prev.totalAlbums - 1 }));
        toast({
          title: "Success",
          description: "Trip album deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete trip album",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.username}. Manage St. Bhakita Catholic Youths content.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Announcements</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Photo Albums</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAlbums}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Quote className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sunday Readings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReadings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="albums">Trip Albums</TabsTrigger>
            <TabsTrigger value="readings">Sunday Readings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Announcements</CardTitle>
                <AnnouncementFormModal
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  }
                  onSuccess={handleAnnouncementSuccess}
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div key={announcement.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.description}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(announcement.date)}
                            </span>
                            {announcement.time && (
                              <span>🕒 {announcement.time}</span>
                            )}
                            {announcement.venue && (
                              <span>📍 {announcement.venue}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AnnouncementFormModal
                            trigger={
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            }
                            announcement={announcement}
                            onSuccess={handleAnnouncementSuccess}
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={deleteLoading === announcement.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{announcement.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
                      <p className="text-gray-600 mb-4">Create your first announcement to get started</p>
                      <AnnouncementFormModal
                        trigger={
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Announcement
                          </Button>
                        }
                        onSuccess={handleAnnouncementSuccess}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trip Albums Tab */}
          <TabsContent value="albums">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Trip Albums</CardTitle>
                <TripAlbumFormModal
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Album
                    </Button>
                  }
                  onSuccess={handleAlbumSuccess}
                />
              </CardHeader>
              <CardContent>
                {albums.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {albums.map((album) => (
                      <Card key={album.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {album.cover_photo ? (
                              <img
                                src={album.cover_photo}
                                alt={album.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Camera className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{album.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{album.description || 'No description'}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{album.photo_count} photos</Badge>
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm" title="Upload photos">
                                <Upload className="h-3 w-3" />
                              </Button>
                              <TripAlbumFormModal
                                trigger={
                                  <Button variant="outline" size="sm" title="Edit album">
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                }
                                album={album}
                                onSuccess={handleAlbumSuccess}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" title="Delete album" disabled={deleteLoading === album.id}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Trip Album</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{album.title}"? This will also delete all photos in this album. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAlbum(album.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trip albums yet</h3>
                    <p className="text-gray-600 mb-4">Create your first trip album to start sharing memories</p>
                    <TripAlbumFormModal
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Album
                        </Button>
                      }
                      onSuccess={handleAlbumSuccess}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sunday Readings Tab */}
          <TabsContent value="readings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Sunday Readings</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Reading
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No readings uploaded yet</h3>
                  <p className="text-gray-600 mb-4">Start by uploading your first Sunday reading</p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User management coming soon</h3>
                  <p className="text-gray-600">View and manage registered users</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
