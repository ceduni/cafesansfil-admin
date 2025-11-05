"use client";

import { useState } from "react";
import { Cafe, Contact } from "../types/cafe";

interface ContactEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function ContactEditor({ cafe, onUpdate }: ContactEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState<Contact>(cafe.contact);

  const handleSave = () => {
    onUpdate({ ...cafe, contact });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContact(cafe.contact);
    setIsEditing(false);
  };

  const updateContact = (field: keyof Contact, value: string) => {
    setContact({ ...contact, [field]: value });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Contact Information
        </h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Contact
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                className="form-input"
                placeholder="cafe@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={contact.phone_number}
                onChange={(e) => updateContact('phone_number', e.target.value)}
                className="form-input"
                placeholder="(514)-998-9008"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Website</label>
              <input
                type="url"
                value={contact.website}
                onChange={(e) => updateContact('website', e.target.value)}
                className="form-input"
                placeholder="https://www.example.com"
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
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Email</h4>
            <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
              <a href={`mailto:${contact.email}`} style={{ color: "var(--primary)", textDecoration: "none" }}>
                {contact.email}
              </a>
            </p>
          </div>

          <div style={{ 
            padding: "1rem", 
            border: "1px solid var(--border)", 
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Phone</h4>
            <p style={{ margin: "0.25rem 0" }}>
              <a href={`tel:${contact.phone_number}`} style={{ color: "var(--primary)", textDecoration: "none" }}>
                {contact.phone_number}
              </a>
            </p>
          </div>

          <div style={{ 
            padding: "1rem", 
            border: "1px solid var(--border)", 
            borderRadius: "0.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--primary)" }}>Website</h4>
            <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
              <a 
                href={contact.website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "var(--primary)", textDecoration: "none" }}
              >
                {contact.website}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
