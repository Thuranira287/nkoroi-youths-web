import React, { useState, useRef } from "react";
import { Upload, X, File, Image, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
}

interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = false,
  maxFiles = 5,
  maxSize = 10,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Validate files
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxSize}MB`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (!multiple && validFiles.length > 1) {
      validFiles.splice(1);
    }

    if (validFiles.length > maxFiles) {
      validFiles.splice(maxFiles);
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
    }

    setSelectedFiles(validFiles);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (multiple) {
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
      } else {
        formData.append("file", selectedFiles[0]);
      }

      const endpoint = multiple ? "/api/upload/multiple" : "/api/upload/single";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        const files = multiple ? result.data : [result.data];

        setUploadedFiles(files);
        setSelectedFiles([]);

        toast({
          title: "Upload successful",
          description: `${files.length} file(s) uploaded successfully`,
        });

        if (onUploadComplete) {
          onUploadComplete(files);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Drop files here or click to upload
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {accept.includes("image") && "Images"}
                {accept.includes(".pdf") &&
                  (accept.includes("image") ? ", PDFs" : "PDFs")}
                {accept.includes(".doc") && ", Documents"} up to {maxSize}MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Selected Files</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                onClick={uploadFiles}
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} file(s)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Uploaded Files
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {file.mimetype.startsWith("image/") ? (
                      <Image className="h-8 w-8 text-green-500" />
                    ) : (
                      <File className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
