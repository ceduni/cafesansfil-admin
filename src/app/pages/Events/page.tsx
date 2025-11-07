"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { getUser, getAccessToken } from "../../back/post";
import {
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    Event,
    CreateEventPayload,
} from "../../back/events";
import { uploadImage } from "../../back/update";
import { sendNotification } from "../../back/notifications";

export default function EventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [cafeId, setCafeId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [formData, setFormData] = useState<CreateEventPayload>({
        name: "",
        description: null,
        image_url: null,
        start_date: "",
        end_date: "",
        location: null,
        ticket: null,
        max_support: 3,
        cafe_ids: [],
    });

    useEffect(() => {
        const initializePage = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const accessToken = getAccessToken();
                if (!accessToken) {
                    router.push("/pages/Login");
                    return;
                }

                const user = getUser();
                if (!user) {
                    router.push("/pages/Login");
                    return;
                }

                const ownedCafes = user.cafes.filter((cafe) => cafe.role === "OWNER");
                if (ownedCafes.length === 0) {
                    setError("You don't own any cafes");
                    return;
                }

                const cafeId = ownedCafes[0].id;
                setCafeId(cafeId);

                // Fetch events
                const eventsData = await fetchEvents();
                setEvents(Array.isArray(eventsData) ? eventsData : []);
            } catch (err: any) {
                console.error("Error loading page:", err);
                // If it's a 404 or empty result, set empty array instead of error
                if (err.message?.includes('404') || err.message?.includes('not found')) {
                    setEvents([]);
                } else {
                    setError(err.message || "An error occurred");
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [router]);

    const handleOpenModal = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                name: event.name,
                description: event.description,
                image_url: event.image_url,
                start_date: event.start_date,
                end_date: event.end_date,
                location: event.location,
                ticket: event.ticket,
                max_support: event.max_support,
                cafe_ids: event.cafe_ids,
            });
        } else {
            setEditingEvent(null);
            setFormData({
                name: "",
                description: null,
                image_url: null,
                start_date: "",
                end_date: "",
                location: null,
                ticket: null,
                max_support: 3,
                cafe_ids: cafeId ? [cafeId] : [],
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare payload with default values
            const payload = {
                ...formData,
                max_support: 3,
                ticket: {
                    ticket_url: "https://example.com/",
                    ticket_price: 0
                }
            };

            if (editingEvent) {
                const updated = await updateEvent(editingEvent.id, payload);
                setEvents(events.map((evt) => (evt.id === updated.id ? updated : evt)));

                // Send notification for edited event based on what changed
                try {
                    const changes: string[] = [];

                    if (editingEvent.name !== payload.name) {
                        changes.push(`Le nom a été changé à "${payload.name}"`);
                    }
                    if (editingEvent.description !== payload.description) {
                        changes.push("La description a été mise à jour");
                    }
                    if (editingEvent.start_date !== payload.start_date) {
                        changes.push(`La date de début a changé: ${formatDate(payload.start_date)}`);
                    }
                    if (editingEvent.end_date !== payload.end_date) {
                        changes.push(`La date de fin a changé: ${formatDate(payload.end_date)}`);
                    }
                    if (editingEvent.location !== payload.location) {
                        changes.push(`Le lieu a changé: ${payload.location || "Non spécifié"}`);
                    }
                    if (editingEvent.image_url !== payload.image_url) {
                        changes.push("L'image a été mise à jour");
                    }

                    if (changes.length > 0) {
                        await sendNotification({
                            title: `Événement modifié: ${updated.name}`,
                            body: changes.join(". ")
                        });
                    }
                } catch (notifErr) {
                    console.error('Failed to send notification:', notifErr);
                    // Don't fail the whole operation if notification fails
                }
            } else {
                const created = await createEvent(payload);
                setEvents([created, ...events]);

                // Send notification for new event
                try {
                    await sendNotification({
                        title: `Nouvel événement: ${created.name}`,
                        body: created.description || `Il y a un nouvel événement le ${formatDate(created.start_date)}!`
                    });
                } catch (notifErr) {
                    console.error('Failed to send notification:', notifErr);
                    // Don't fail the whole operation if notification fails
                }
            }
            handleCloseModal();
        } catch (err: any) {
            alert(err.message || "Failed to save event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await deleteEvent(eventId);
            setEvents(events.filter((evt) => evt.id !== eventId));
        } catch (err: any) {
            alert(err.message || "Failed to delete event");
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            setIsSubmitting(true);
            const url = await uploadImage(file);
            setFormData({ ...formData, image_url: url });
        } catch (err: any) {
            alert(err.message || "Failed to upload image");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Loading...</div>
                        <h2>Loading Events...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--destructive)" }}>Error</div>
                        <h2>{error}</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
                <div className="cafe-header">
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Events</h1>
                    <p style={{ opacity: "0.9" }}>Manage your cafe events</p>
                </div>

                {/* Search and Add Button */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        + Add Event
                    </button>
                </div>

                {/* Events Grid */}
                <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="cafe-card">
                            {event.image_url && (
                                <img
                                    src={event.image_url}
                                    alt={event.name}
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "0.5rem",
                                        marginBottom: "1rem",
                                    }}
                                />
                            )}
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{event.name}</h3>
                            {event.description && (
                                <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                                    {event.description}
                                </p>
                            )}
                            <div style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
                                <div style={{ marginBottom: "0.25rem" }}>
                                    <strong>Start:</strong> {formatDate(event.start_date)}
                                </div>
                                <div style={{ marginBottom: "0.25rem" }}>
                                    <strong>End:</strong> {formatDate(event.end_date)}
                                </div>
                                {event.location && (
                                    <div style={{ marginBottom: "0.25rem" }}>
                                        <strong>Location:</strong> {event.location}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleOpenModal(event)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(event.id)} className="btn btn-destructive" style={{ flex: 1 }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "var(--muted-foreground)" }}>No events found. Click "Add Event" to create one.</p>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                            padding: "1rem",
                        }}
                        onClick={handleCloseModal}
                    >
                        <div
                            className="card"
                            style={{
                                maxWidth: "600px",
                                width: "100%",
                                maxHeight: "90vh",
                                overflowY: "auto",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
                                {editingEvent ? "Edit Event" : "Add New Event"}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                                        className="form-textarea"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">End Date *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                        }}
                                        className="form-input"
                                        disabled={isSubmitting}
                                    />
                                    {formData.image_url && (
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            style={{ width: "100%", height: "150px", objectFit: "cover", marginTop: "0.5rem", borderRadius: "0.5rem" }}
                                        />
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                                    <button type="submit" className="btn btn-success" disabled={isSubmitting} style={{ flex: 1 }}>
                                        {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={isSubmitting} style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
