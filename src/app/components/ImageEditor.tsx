"use client";

import { useState } from "react";
import { Cafe } from "../types/cafe";

interface ImageEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function ImageEditor({ cafe, onUpdate }: ImageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState<string[]>(cafe.photo_urls || []);
  const [bannerUrl, setBannerUrl] = useState<string>(cafe.banner_url || "");
  const [newImageUrl, setNewImageUrl] = useState("");

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

  const handleSave = () => {
    onUpdate({ ...cafe, photo_urls: images, banner_url: bannerUrl });
    setIsEditing(false);
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
          Café Images ({images.length}/5)
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
              <label className="form-label">Banner Image URL</label>
              <input
                className="form-input"
                type="url"
                value={bannerUrl}
                onChange={(e) => handleBannerUpdate(e.target.value)}
                placeholder="https://example.com/banner.jpg"
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

          {/* Gallery Images Section */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
              Gallery Images ({images.length}/5)
            </h4>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "1rem" }}>
              {images.map((url, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img 
                    src={url} 
                    alt={`Café image ${index + 1}`}
                    style={{ 
                      width: "100%", 
                      height: "150px", 
                      objectFit: "cover", 
                      borderRadius: "0.5rem",
                      border: "2px solid var(--border)"
                    }}
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="btn btn-destructive"
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      padding: "0.25rem",
                      fontSize: "0.75rem"
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {images.length < 5 && (
              <div style={{ marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Add New Gallery Image URL</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="form-input"
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      style={{ flex: 1 }}
                    />
                    <button 
                      onClick={handleAddImage}
                      className="btn btn-primary"
                      disabled={!newImageUrl.trim() || images.length >= 5}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleSave} className="btn btn-success">
              Save Changes
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
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

          {/* Gallery Images Display */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
              Gallery Images ({images.length}/5)
            </h4>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {images.length > 0 ? (
                images.map((url, index) => (
                  <img 
                    key={index}
                    src={url} 
                    alt={`Café image ${index + 1}`}
                    style={{ 
                      width: "100%", 
                      height: "150px", 
                      objectFit: "cover", 
                      borderRadius: "0.5rem",
                      border: "2px solid var(--border)"
                    }}
                  />
                ))
              ) : (
                <div style={{ 
                  padding: "2rem", 
                  textAlign: "center", 
                  color: "var(--muted-foreground)",
                  border: "2px dashed var(--border)",
                  borderRadius: "0.5rem",
                  gridColumn: "1 / -1"
                }}>
                  No gallery images available. Click Edit to add some.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
