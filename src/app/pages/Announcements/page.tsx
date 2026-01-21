"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { getUser, getAccessToken } from "../../back/post";
import {
    createAnnouncement,
    fetchAnnouncements
} from "../../back/announcements";
import { Announcement, AnnouncementItem } from "../../back/announcements.types";
import { sendNotification } from "../../back/notifications";

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
    const [cafeId, setCafeId] = useState<string>("");
    const [cafeSlug, setCafeSlug] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [formData, setFormData] = useState<Announcement>({
        "title" : "",
        "content" : "",
        "active_until" : new Date(),
        "tags" : []
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
                const cafeSlug = ownedCafes[0].slug;
                setCafeId(cafeId);
                setCafeSlug(cafeSlug);

                // Fetch announcements with cafe_id filter
                const announcementsData = await fetchAnnouncements(cafeId);
                if ('items' in announcementsData) {
                    setAnnouncements(announcementsData.items);
                } else {
                    setAnnouncements([]);
                }
            } catch (err: any) {
                console.error("Error loading page:", err);
                // If it's a 404 or empty result, set empty array instead of error
                if (err.message?.includes('404') || err.message?.includes('not found')) {
                    setAnnouncements([]);
                } else {
                    setError(err.message || "An error occurred");
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [router]);

    const handleOpenModal = (announcement?: AnnouncementItem) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                title: announcement.title,
                content: announcement.content,
                active_until: new Date(announcement.active_until),
                tags: announcement.tags,
            });
        } else {
            setEditingAnnouncement(null);
            setFormData({
                title: "",
                content: "",
                active_until: new Date(),
                tags: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAnnouncement(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingAnnouncement) {
                // TODO: Implement updateAnnouncement when available
                alert("Update functionality not yet implemented");
                // const updated = await updateAnnouncement(editingAnnouncement.id, formData);
                // setAnnouncements(announcements.map((ann) => (ann.id === updated.id ? updated : ann)));
            } else {
                const created = await createAnnouncement(formData, cafeSlug);
                if ('id' in created) {
                    // Refetch announcements to get the full data including id
                    const announcementsData = await fetchAnnouncements(cafeId);
                    if ('items' in announcementsData) {
                        setAnnouncements(announcementsData.items);
                    }

                    // Send notification for new announcement
                    try {
                        await sendNotification({
                            title: `Nouvelle annonce: ${created.title}`,
                            body: created.content || `Une nouvelle annonce a été publiée!`
                        });
                    } catch (notifErr) {
                        console.error('Failed to send notification:', notifErr);
                        // Don't fail the whole operation if notification fails
                    }
                }
            }
            handleCloseModal();
        } catch (err: any) {
            alert(err.message || "Failed to save announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (announcementId: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            // TODO: Implement deleteAnnouncement when available
            alert("Delete functionality not yet implemented");
            // await deleteAnnouncement(announcementId);
            // setAnnouncements(announcements.filter((ann) => ann.id !== announcementId));
        } catch (err: any) {
            alert(err.message || "Failed to delete announcement");
        }
    };

    const formatDate = (dateStr: string | Date) => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredAnnouncements = announcements.filter((announcement) =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Loading...</div>
                        <h2>Loading Announcements...</h2>
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
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Announcements</h1>
                    <p style={{ opacity: "0.9" }}>Manage your cafe announcements</p>
                </div>

                {/* Search and Add Button */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        + Add Announcement
                    </button>
                </div>

                {/* Announcements Grid */}
                <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
                    {filteredAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="cafe-card">
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{announcement.title}</h3>
                            <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                                {announcement.content}
                            </p>
                            <div style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
                                <div style={{ marginBottom: "0.25rem" }}>
                                    <strong>Active Until:</strong> {formatDate(announcement.active_until)}
                                </div>
                                <div style={{ marginBottom: "0.25rem" }}>
                                    <strong>Created:</strong> {formatDate(announcement.created_at)}
                                </div>
                                {announcement.tags && announcement.tags.length > 0 && (
                                    <div style={{ marginBottom: "0.25rem" }}>
                                        <strong>Tags:</strong> {announcement.tags.join(", ")}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleOpenModal(announcement)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(announcement.id)} className="btn btn-destructive" style={{ flex: 1 }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAnnouncements.length === 0 && (
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "var(--muted-foreground)" }}>No announcements found. Click "Add Announcement" to create one.</p>
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
                                {editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Content *</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="form-textarea"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Active Until *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.active_until ? new Date(formData.active_until).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => {
                                            setFormData({ 
                                                ...formData, 
                                                active_until: e.target.value ? new Date(e.target.value) : new Date() 
                                            });
                                        }}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags.join(", ")}
                                        onChange={(e) => {
                                            const tags = e.target.value
                                                .split(",")
                                                .map(tag => tag.trim())
                                                .filter(tag => tag.length > 0);
                                            setFormData({ ...formData, tags });
                                        }}
                                        className="form-input"
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                                    <button type="submit" className="btn btn-success" disabled={isSubmitting} style={{ flex: 1 }}>
                                        {isSubmitting ? "Saving..." : editingAnnouncement ? "Update Announcement" : "Create Announcement"}
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