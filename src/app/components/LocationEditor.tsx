"use client";

import { useState } from "react";
import { Cafe, Location } from "../types/cafe";
import { updateCafe } from "../back/update";

interface LocationEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function LocationEditor({ cafe, onUpdate }: LocationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState<Location>(cafe.location);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateCafe(cafe.slug, { location });

      onUpdate({ ...cafe, location });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving location:', err);
      setError(err.message || 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocation(cafe.location);
    setIsEditing(false);
    setError(null);
  };

  const updateLocation = (field: keyof Location, value: any) => {
    setLocation({ ...location, [field]: value });
  };

  const updateGeometry = (field: 'type' | 'coordinates', value: any) => {
    setLocation({
      ...location,
      geometry: {
        ...location.geometry,
        [field]: value
      }
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Location Information
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Location
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div className="form-group">
              <label className="form-label">Pavillon</label>
              <input
                type="text"
                value={location.pavillon}
                onChange={(e) => updateLocation('pavillon', e.target.value)}
                className="form-input"
                placeholder="Pavillon name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Local</label>
              <input
                type="text"
                value={location.local}
                onChange={(e) => updateLocation('local', e.target.value)}
                className="form-input"
                placeholder="Local number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Floor</label>
              <input
                type="text"
                value={location.floor}
                onChange={(e) => updateLocation('floor', e.target.value)}
                className="form-input"
                placeholder="Floor description"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Geometry Type</label>
              <select
                value={location.geometry.type}
                onChange={(e) => updateGeometry('type', e.target.value)}
                className="form-input"
              >
                <option value="Point">Point</option>
                <option value="Polygon">Polygon</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                value={location.geometry.coordinates[0]}
                onChange={(e) => {
                  const newCoords = [...location.geometry.coordinates];
                  newCoords[0] = parseFloat(e.target.value);
                  updateGeometry('coordinates', newCoords);
                }}
                className="form-input"
                placeholder="-73.61698298364878"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                value={location.geometry.coordinates[1]}
                onChange={(e) => {
                  const newCoords = [...location.geometry.coordinates];
                  newCoords[1] = parseFloat(e.target.value);
                  updateGeometry('coordinates', newCoords);
                }}
                className="form-input"
                placeholder="45.49864611249791"
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
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <div style={{
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Building</h4>
            <p style={{ margin: "0.25rem 0" }}><strong>Pavillon:</strong> {location.pavillon}</p>
            <p style={{ margin: "0.25rem 0" }}><strong>Local:</strong> {location.local}</p>
            <p style={{ margin: "0.25rem 0" }}><strong>Floor:</strong> {location.floor}</p>
          </div>

          <div style={{
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Coordinates</h4>
            <p style={{ margin: "0.25rem 0" }}><strong>Type:</strong> {location.geometry.type}</p>
            <p style={{ margin: "0.25rem 0" }}><strong>Longitude:</strong> {location.geometry.coordinates[0]}</p>
            <p style={{ margin: "0.25rem 0" }}><strong>Latitude:</strong> {location.geometry.coordinates[1]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
