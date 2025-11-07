"use client";

import { useState } from "react";
import { Cafe, Owner } from "../types/cafe";
import { updateCafe } from "../back/update";

interface OwnerEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function OwnerEditor({ cafe, onUpdate }: OwnerEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [owner, setOwner] = useState<Owner>(cafe.owner);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateCafe(cafe.slug, { owner });

      onUpdate({ ...cafe, owner });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving owner:', err);
      setError(err.message || 'Failed to save owner information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOwner(cafe.owner);
    setIsEditing(false);
    setError(null);
  };

  const updateOwner = (field: keyof Owner, value: string) => {
    setOwner({ ...owner, [field]: value });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Owner Information
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Owner
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={owner.first_name}
                onChange={(e) => updateOwner('first_name', e.target.value)}
                className="form-input"
                placeholder="First name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={owner.last_name}
                onChange={(e) => updateOwner('last_name', e.target.value)}
                className="form-input"
                placeholder="Last name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={owner.username}
                onChange={(e) => updateOwner('username', e.target.value)}
                className="form-input"
                placeholder="Username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={owner.email}
                onChange={(e) => updateOwner('email', e.target.value)}
                className="form-input"
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Photo URL</label>
              <input
                type="url"
                value={owner.photo_url}
                onChange={(e) => updateOwner('photo_url', e.target.value)}
                className="form-input"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: "0.75rem",
              marginTop: "1rem",
              backgroundColor: "var(--destructive-bg)",
              color: "var(--destructive-text)",
              border: "1px solid var(--destructive)",
              borderRadius: "0.375rem"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button onClick={handleSave} className="btn btn-success" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={handleCancel} className="btn btn-secondary" disabled={isSaving}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              {owner.photo_url && (
                <img
                  src={owner.photo_url}
                  alt="Owner photo"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--border)"
                  }}
                />
              )}
              <div>
                <h4 style={{ fontWeight: "600", marginBottom: "0.25rem", color: "var(--primary)" }}>
                  {owner.first_name} {owner.last_name}
                </h4>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                  @{owner.username}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Email:</strong>
                <a href={`mailto:${owner.email}`} style={{ color: "var(--primary)", textDecoration: "none", marginLeft: "0.5rem" }}>
                  {owner.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
