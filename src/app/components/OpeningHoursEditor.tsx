"use client";

import { useState } from "react";
import { Cafe, OpeningHours, OpeningHoursBlock } from "../types/cafe";

interface OpeningHoursEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

const DAYS = [
  { key: "MONDAY", label: "Monday", short: "Mon" },
  { key: "TUESDAY", label: "Tuesday", short: "Tue" },
  { key: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { key: "THURSDAY", label: "Thursday", short: "Thu" },
  { key: "FRIDAY", label: "Friday", short: "Fri" },
  { key: "SATURDAY", label: "Saturday", short: "Sat" },
  { key: "SUNDAY", label: "Sunday", short: "Sun" }
];

export default function OpeningHoursEditor({ cafe, onUpdate }: OpeningHoursEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(cafe.opening_hours || []);

  const getDayHours = (day: string): OpeningHoursBlock[] => {
    const dayData = openingHours.find(h => h.day === day);
    return dayData?.blocks || [];
  };

  const updateDayHours = (day: string, blocks: OpeningHoursBlock[]) => {
    const updated = openingHours.filter(h => h.day !== day);
    if (blocks.length > 0) {
      updated.push({ day, blocks });
    }
    setOpeningHours(updated);
  };

  const addTimeBlock = (day: string) => {
    const currentBlocks = getDayHours(day);
    const newBlocks = [...currentBlocks, { start: "09:00", end: "17:00" }];
    updateDayHours(day, newBlocks);
  };

  const updateTimeBlock = (day: string, blockIndex: number, field: 'start' | 'end', value: string) => {
    const currentBlocks = getDayHours(day);
    const updatedBlocks = [...currentBlocks];
    updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], [field]: value };
    updateDayHours(day, updatedBlocks);
  };

  const removeTimeBlock = (day: string, blockIndex: number) => {
    const currentBlocks = getDayHours(day);
    const updatedBlocks = currentBlocks.filter((_, index) => index !== blockIndex);
    updateDayHours(day, updatedBlocks);
  };

  const handleSave = () => {
    onUpdate({ ...cafe, opening_hours: openingHours });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setOpeningHours(cafe.opening_hours || []);
    setIsEditing(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Opening Hours
        </h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Hours
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ display: "grid", gap: "1rem" }}>
            {DAYS.map(day => {
              const dayHours = getDayHours(day.key);
              return (
                <div key={day.key} style={{ 
                  padding: "1rem", 
                  border: "1px solid var(--border)", 
                  borderRadius: "0.5rem",
                  background: "var(--muted)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontWeight: "600", color: "var(--foreground)" }}>{day.label}</h4>
                    <button 
                      onClick={() => addTimeBlock(day.key)}
                      className="btn btn-primary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    >
                      Add Time
                    </button>
                  </div>
                  
                  {dayHours.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {dayHours.map((block, blockIndex) => (
                        <div key={blockIndex} style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "0.5rem",
                          padding: "0.5rem",
                          background: "var(--card)",
                          borderRadius: "0.25rem"
                        }}>
                          <input
                            type="time"
                            value={block.start}
                            onChange={(e) => updateTimeBlock(day.key, blockIndex, 'start', e.target.value)}
                            className="form-input"
                            style={{ width: "auto", minWidth: "100px" }}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={block.end}
                            onChange={(e) => updateTimeBlock(day.key, blockIndex, 'end', e.target.value)}
                            className="form-input"
                            style={{ width: "auto", minWidth: "100px" }}
                          />
                          <button
                            onClick={() => removeTimeBlock(day.key, blockIndex)}
                            className="btn btn-destructive"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      color: "var(--muted-foreground)", 
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "1rem"
                    }}>
                      Closed
                    </div>
                  )}
                </div>
              );
            })}
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
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {DAYS.map(day => {
            const dayHours = getDayHours(day.key);
            return (
              <div key={day.key} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                background: "var(--muted)"
              }}>
                <span style={{ fontWeight: "500", minWidth: "100px" }}>{day.label}</span>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {dayHours.length > 0 ? (
                    dayHours.map((block, index) => (
                      <span key={index} style={{ 
                        background: "var(--primary)", 
                        color: "white", 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "0.25rem",
                        fontSize: "0.875rem"
                      }}>
                        {block.start} - {block.end}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
                      Closed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
