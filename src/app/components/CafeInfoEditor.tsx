"use client";

import { useState } from "react";
import { Cafe, Affiliation } from "../types/cafe";
import { updateCafe } from "../back/update";

interface CafeInfoEditorProps {
    cafe: Cafe;
    onUpdate: (updatedCafe: Cafe) => void;
}

export default function CafeInfoEditor({ cafe, onUpdate }: CafeInfoEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(cafe.name);
    const [affiliation, setAffiliation] = useState<Affiliation>(cafe.affiliation);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            await updateCafe(cafe.slug, { name, affiliation });

            onUpdate({ ...cafe, name, affiliation });
            setIsEditing(false);
        } catch (err: any) {
            console.error('Error saving cafe info:', err);
            setError(err.message || 'Failed to save cafe information');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(cafe.name);
        setAffiliation(cafe.affiliation);
        setIsEditing(false);
        setError(null);
    };

    const updateAffiliation = (field: keyof Affiliation, value: string) => {
        setAffiliation({ ...affiliation, [field]: value });
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
                    Cafe Information
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-secondary"
                        style={{ fontSize: "0.875rem" }}
                    >
                        Edit Info
                    </button>
                )}
            </div>

            {isEditing ? (
                <div>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Cafe Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                placeholder="Enter cafe name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">University</label>
                            <input
                                type="text"
                                value={affiliation.university}
                                onChange={(e) => updateAffiliation('university', e.target.value)}
                                className="form-input"
                                placeholder="Enter university name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Faculty</label>
                            <input
                                type="text"
                                value={affiliation.faculty}
                                onChange={(e) => updateAffiliation('faculty', e.target.value)}
                                className="form-input"
                                placeholder="Enter faculty name"
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
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    <div style={{
                        padding: "1rem",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        background: "var(--muted)"
                    }}>
                        <div style={{ marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
                                Cafe Name
                            </div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
                                {cafe.name}
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr" }}>
                            <div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
                                    University
                                </div>
                                <div style={{ fontWeight: "500" }}>
                                    {cafe.affiliation.university}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
                                    Faculty
                                </div>
                                <div style={{ fontWeight: "500" }}>
                                    {cafe.affiliation.faculty}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
