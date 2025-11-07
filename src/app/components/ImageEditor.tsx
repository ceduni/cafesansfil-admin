"use client";

import { useState } from "react";
import { Cafe } from "../types/cafe";
import { updateCafe, uploadImage } from "../back/update";

interface ImageEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function ImageEditor({ cafe, onUpdate }: ImageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState<string[]>(cafe.photo_urls || []);
  const [bannerUrl, setBannerUrl] = useState<string>(cafe.banner_url || "");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAddImage = () => {
    if (newImageUrl.trim() && images.length < 5) {
      const updatedImages = [...images, newImageUrl.trim()];
      setImages(updatedImages);
      setNewImageUrl("");
      onUpdate({ ...cafe, photo_urls: updatedImages });
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUpdate({ ...cafe, photo_urls: updatedImages });
  };

  const handleBannerUpdate = (url: string) => {
    setBannerUrl(url);
    onUpdate({ ...cafe, banner_url: url });
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      setUploadError(null);

      await updateCafe(cafe.slug, {
        photo_urls: images,
        banner_url: bannerUrl
      });

      onUpdate({ ...cafe, photo_urls: images, banner_url: bannerUrl });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving images:', error);
      setUploadError(error.message || 'Failed to save images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'banner' | 'gallery') => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const url = await uploadImage(file);

      if (type === 'banner') {
        setBannerUrl(url);
      } else {
        if (images.length < 5) {
          setImages([...images, url]);
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImages(cafe.photo_urls || []);
    setBannerUrl(cafe.banner_url || "");
    setIsEditing(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Café Images
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Images
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          {/* Banner Image Section */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
              Banner Image
            </h4>

            <div className="form-group">
              <label className="form-label">Upload Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'banner');
                }}
                className="form-input"
                disabled={isUploading}
              />
            </div>


            {bannerUrl && (
              <div style={{ marginTop: "1rem" }}>
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    border: "2px solid var(--border)"
                  }}
                />
              </div>
            )}
          </div>



          {uploadError && (
            <div style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              background: "var(--destructive)",
              color: "white",
              borderRadius: "0.5rem",
              fontSize: "0.875rem"
            }}>
              {uploadError}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleSave} className="btn btn-success" disabled={isUploading}>
              {isUploading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={handleCancel} className="btn btn-secondary" disabled={isUploading}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Banner Image Display */}
          {bannerUrl && (
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
                Banner Image
              </h4>
              <img
                src={bannerUrl}
                alt="Café banner"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "0.5rem",
                  border: "2px solid var(--border)"
                }}
              />
            </div>
          )}


        </div>
      )}
    </div>
  );
}
