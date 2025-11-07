"use client";

import { useState } from "react";
import { Cafe, Staff, StaffMember } from "../types/cafe";
import { updateCafe } from "../back/update";

interface StaffEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

export default function StaffEditor({ cafe, onUpdate }: StaffEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [staff, setStaff] = useState<Staff>(cafe.staff);
  const [newMember, setNewMember] = useState<Partial<StaffMember>>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    photo_url: ""
  });
  const [memberType, setMemberType] = useState<'admins' | 'volunteers'>('volunteers');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Flatten staff object to array for API
      const staffArray = [...staff.admins, ...staff.volunteers];

      await updateCafe(cafe.slug, { staff: staffArray });

      onUpdate({ ...cafe, staff });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving staff:', err);
      setError(err.message || 'Failed to save staff information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setStaff(cafe.staff);
    setIsEditing(false);
    setError(null);
  };

  const addMember = () => {
    if (newMember.first_name && newMember.last_name && newMember.email) {
      const member: StaffMember = {
        id: `temp_${Date.now()}`,
        first_name: newMember.first_name,
        last_name: newMember.last_name,
        username: newMember.username || `${newMember.first_name.toLowerCase()}.${newMember.last_name.toLowerCase()}`,
        email: newMember.email,
        photo_url: newMember.photo_url || "",
        diet_profile: null
      };

      setStaff({
        ...staff,
        [memberType]: [...staff[memberType], member]
      });

      setNewMember({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        photo_url: ""
      });
    }
  };

  const removeMember = (type: 'admins' | 'volunteers', index: number) => {
    setStaff({
      ...staff,
      [type]: staff[type].filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Staff Management
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Staff
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          {/* Add New Member */}
          <div style={{
            padding: "1rem",
            border: "2px dashed var(--border)",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
            background: "var(--muted)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
              Add New Staff Member
            </h4>

            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div className="form-group">
                <label className="form-label">Member Type</label>
                <select
                  value={memberType}
                  onChange={(e) => setMemberType(e.target.value as 'admins' | 'volunteers')}
                  className="form-input"
                >
                  <option value="volunteers">Volunteer</option>
                  <option value="admins">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={newMember.first_name}
                  onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                  className="form-input"
                  placeholder="First name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={newMember.last_name}
                  onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                  className="form-input"
                  placeholder="Last name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="form-input"
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={newMember.username}
                  onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                  className="form-input"
                  placeholder="username"
                />
              </div>
            </div>

            <button
              onClick={addMember}
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              disabled={!newMember.first_name || !newMember.last_name || !newMember.email}
            >
              Add Member
            </button>
          </div>

          {/* Staff Lists */}
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))" }}>
            {/* Admins */}
            <div>
              <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
                Admins ({staff.admins.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {staff.admins.map((member, index) => (
                  <div key={member.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    background: "var(--muted)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {member.photo_url && (
                        <img
                          src={member.photo_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover"
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {member.first_name} {member.last_name}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember('admins', index)}
                      className="btn btn-destructive"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteers */}
            <div>
              <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
                Volunteers ({staff.volunteers.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {staff.volunteers.map((member, index) => (
                  <div key={member.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    background: "var(--muted)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {member.photo_url && (
                        <img
                          src={member.photo_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover"
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {member.first_name} {member.last_name}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember('volunteers', index)}
                      className="btn btn-destructive"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
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

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button onClick={handleSave} className="btn btn-success" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={handleCancel} className="btn btn-secondary" disabled={isSaving}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))" }}>
          {/* Admins */}
          <div>
            <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
              Admins ({staff.admins.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {staff.admins.map((member, index) => (
                <div key={member.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  background: "var(--muted)"
                }}>
                  {member.photo_url && (
                    <img
                      src={member.photo_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {member.first_name} {member.last_name}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                      {member.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteers */}
          <div>
            <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
              Volunteers ({staff.volunteers.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {staff.volunteers.map((member, index) => (
                <div key={member.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  background: "var(--muted)"
                }}>
                  {member.photo_url && (
                    <img
                      src={member.photo_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {member.first_name} {member.last_name}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                      {member.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
