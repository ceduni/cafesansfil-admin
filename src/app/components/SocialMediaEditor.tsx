"use client";

import { useState } from "react";
import { Cafe, SocialMedia } from "../types/cafe";

interface SocialMediaEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function SocialMediaEditor({ cafe, onUpdate }: SocialMediaEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>(cafe.social_media);

  const handleSave = () => {
    onUpdate({ ...cafe, social_media: socialMedia });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSocialMedia(cafe.social_media);
    setIsEditing(false);
  };

  const updateSocialMedia = (field: keyof SocialMedia, value: string) => {
    setSocialMedia({ ...socialMedia, [field]: value || null });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Social Media
        </h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Social Media
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div className="form-group">
              <label className="form-label">Facebook URL</label>
              <input
                type="url"
                value={socialMedia.facebook || ""}
                onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                className="form-input"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram URL</label>
              <input
                type="url"
                value={socialMedia.instagram || ""}
                onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                className="form-input"
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label className="form-label">X (Twitter) URL</label>
              <input
                type="url"
                value={socialMedia.x || ""}
                onChange={(e) => updateSocialMedia('x', e.target.value)}
                className="form-input"
                placeholder="https://x.com/yourpage"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button onClick={handleSave} className="btn btn-success">
              Save Changes
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <div style={{ 
            padding: "1rem", 
            border: "1px solid var(--border)", 
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Facebook</h4>
            {socialMedia.facebook ? (
              <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
                <a 
                  href={socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)", textDecoration: "none" }}
                >
                  {socialMedia.facebook}
                </a>
              </p>
            ) : (
              <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Not configured</p>
            )}
          </div>

          <div style={{ 
            padding: "1rem", 
            border: "1px solid var(--border)", 
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Instagram</h4>
            {socialMedia.instagram ? (
              <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
                <a 
                  href={socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)", textDecoration: "none" }}
                >
                  {socialMedia.instagram}
                </a>
              </p>
            ) : (
              <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Not configured</p>
            )}
          </div>

          <div style={{ 
            padding: "1rem", 
            border: "1px solid var(--border)", 
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>X (Twitter)</h4>
            {socialMedia.x ? (
              <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
                <a 
                  href={socialMedia.x} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)", textDecoration: "none" }}
                >
                  {socialMedia.x}
                </a>
              </p>
            ) : (
              <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Not configured</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
