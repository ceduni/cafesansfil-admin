"use client";

import { useState } from "react";

interface EditDescriptionProps {
    description: string;
    setDescription: (value: string) => void;
}

export default function EditDescription({ description, setDescription }: EditDescriptionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempDescription, setTempDescription] = useState(description);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setDescription(tempDescription);
            setSaveStatus('success');
            setIsEditing(false);
            
            // Reset success status after 3 seconds
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempDescription(description);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setTempDescription(description);
        setIsEditing(true);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Cafe Description</h3>
                {!isEditing && (
                    <button 
                        onClick={handleEdit}
                        className="btn btn-secondary"
                        style={{ fontSize: "0.875rem" }}
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea 
                            className="form-textarea"
                            value={tempDescription} 
                            onChange={(e) => setTempDescription(e.target.value)}
                            placeholder="Enter cafe description..."
                            rows={4}
                        />
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                        <button 
                            onClick={handleSave}
                            className="btn btn-success"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <button 
                            onClick={handleCancel}
                            className="btn btn-secondary"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                    </div>

                    {saveStatus === 'success' && (
                        <div style={{ 
                            marginTop: "1rem", 
                            padding: "0.75rem", 
                            background: "var(--success)", 
                            color: "white", 
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem"
                        }}>
                            Description saved successfully!
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div style={{ 
                            marginTop: "1rem", 
                            padding: "0.75rem", 
                            background: "var(--destructive)", 
                            color: "white", 
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem"
                        }}>
                            Failed to save description. Please try again.
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div style={{ 
                        padding: "1rem", 
                        background: "var(--muted)", 
                        borderRadius: "0.5rem", 
                        border: "1px solid var(--border)",
                        minHeight: "100px",
                        whiteSpace: "pre-wrap"
                    }}>
                        {description || "No description available. Click Edit to add one."}
                    </div>
                </div>
            )}
        </div>
    );
}