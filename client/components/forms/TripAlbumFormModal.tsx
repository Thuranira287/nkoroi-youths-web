import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, X, Camera } from 'lucide-react';
import { CreateTripAlbumRequest, TripAlbum } from '@shared/api';

interface TripAlbumFormModalProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (TripAlbumFormModalProps) => void;
  title: string;
  initialData?: TripAlbum;
  album?: TripAlbum;
  onSuccess?: (album: TripAlbum) => void;
}

const TripAlbumFormModal: React.FC<TripAlbumFormModalProps> = ({
  trigger,
  album,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateTripAlbumRequest>({
    title: album?.title || '',
    description: album?.description || ''
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>(album?.cover_photo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, coverPhoto: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverPhoto: 'Image must be less than 5MB' }));
        return;
      }

      setCoverPhoto(file);
      setErrors(prev => ({ ...prev, coverPhoto: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoPreview(album?.cover_photo || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, we'll use JSON. In production, use FormData for file uploads
      const requestData = {
        ...formData,
        cover_photo: coverPhoto ? 'uploaded_file_url' : album?.cover_photo
      };

      const url = album 
        ? `/api/trips/${album.id}`
        : '/api/trips';
      
      const method = album ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result.data);
        setOpen(false);
        
        // Reset form if creating new
        if (!album) {
          setFormData({
            title: '',
            description: ''
          });
          setCoverPhoto(null);
          setCoverPhotoPreview('');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save trip album');
      }
    } catch (error) {
      setError('An error occurred while saving the trip album');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTripAlbumRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {album ? 'Edit Trip Album' : 'Create New Trip Album'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter album title (e.g., Subukia Shrine 2024)"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the trip or event"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description?.length || 0}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cover Photo (optional)</Label>
            
            {coverPhotoPreview ? (
              <div className="relative">
                <img
                  src={coverPhotoPreview}
                  alt="Cover preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeCoverPhoto}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload cover photo</p>
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {errors.coverPhoto && (
              <p className="text-sm text-red-600">{errors.coverPhoto}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {album ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TripAlbumFormModal;
