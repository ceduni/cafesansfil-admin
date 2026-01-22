"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { getUser, getAccessToken } from "../../back/post";
import {
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    Announcement,
    CreateAnnouncementPayload,
} from "../../back/announcements";
import { sendNotification } from "../../back/notifications";

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [cafeSlug, setCafeSlug] = useState<string>("");
    const [cafeId, setCafeId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [tagInput, setTagInput] = useState("");

    // Form state
    const [formData, setFormData] = useState<CreateAnnouncementPayload>({
        title: "",
        content: "",
        active_until: "",
        tags: [],
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

                const slug = ownedCafes[0].slug;
                const id = ownedCafes[0].id;
                setCafeSlug(slug);
                setCafeId(id);

                // Fetch announcements
                const announcementsData = await fetchAnnouncements(id);
                setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
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

    const handleOpenModal = (announcement?: Announcement) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                title: announcement.title,
                content: announcement.content,
                active_until: announcement.active_until,
                tags: announcement.tags,
            });
            setTagInput(announcement.tags.join(", "));
        } else {
            setEditingAnnouncement(null);
            // Set default active_until to current time
            const now = new Date();
            setFormData({
                title: "",
                content: "",
                active_until: now.toISOString(),
                tags: [],
            });
            setTagInput("");
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAnnouncement(null);
        setTagInput("");
    };

    const handleTagInputChange = (value: string) => {
        setTagInput(value);
        // Parse comma-separated tags
        const tags = value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        setFormData({ ...formData, tags });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingAnnouncement) {
                const updated = await updateAnnouncement(cafeSlug, editingAnnouncement.id, formData);
                setAnnouncements(announcements.map((ann) => (ann.id === updated.id ? updated : ann)));

                // Send notification for edited announcement
                try {
                    await sendNotification({
                        title: `Annonce modifiée: ${updated.title}`,
                        body: updated.content.substring(0, 100) + (updated.content.length > 100 ? "..." : "")
                    });
                } catch (notifErr) {
                    console.error('Failed to send notification:', notifErr);
                }
            } else {
                const created = await createAnnouncement(cafeSlug, formData);
                setAnnouncements([created, ...announcements]);

                // Send notification for new announcement
                try {
                    await sendNotification({
                        title: `Nouvelle annonce: ${created.title}`,
                        body: created.content.substring(0, 100) + (created.content.length > 100 ? "..." : "")
                    });
                } catch (notifErr) {
                    console.error('Failed to send notification:', notifErr);
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
            await deleteAnnouncement(cafeSlug, announcementId);
            setAnnouncements(announcements.filter((ann) => ann.id !== announcementId));
        } catch (err: any) {
            alert(err.message || "Failed to delete announcement");
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

                {/* Announcements List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {filteredAnnouncements.map((announcement) => {
                        return (
                            <div
                                key={announcement.id}
                                className="cafe-card"
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>
                                                {announcement.title}
                                            </h3>
                                        </div>
                                        <p style={{ color: "var(--muted-foreground)", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                                            {announcement.content}
                                        </p>
                                        {announcement.tags.length > 0 && (
                                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                                                {announcement.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            padding: "0.25rem 0.5rem",
                                                            background: "var(--accent)",
                                                            borderRadius: "0.25rem"
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                            <div>Created: {formatDate(announcement.created_at)}</div>
                                            <div>Active until: {formatDate(announcement.active_until)}</div>
                                            {announcement.author && (
                                                <div>By: {announcement.author.first_name} {announcement.author.last_name}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            onClick={() => handleOpenModal(announcement)}
                                            className="btn btn-secondary"
                                            style={{ minWidth: "80px" }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="btn btn-destructive"
                                            style={{ minWidth: "80px" }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredAnnouncements.length === 0 && (
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "var(--muted-foreground)" }}>
                            No announcements found. Click "Add Announcement" to create one.
                        </p>
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
                                        type="date"
                                        value={formData.active_until ? formData.active_until.split('T')[0] : ""}
                                        onChange={(e) => {
                                            const currentTime = formData.active_until ? formData.active_until.split('T')[1] : "23:59:00.000Z";
                                            setFormData({ ...formData, active_until: e.target.value ? `${e.target.value}T${currentTime}` : "" });
                                        }}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Active Until Time *</label>
                                    <input
                                        type="time"
                                        value={formData.active_until ? formData.active_until.split('T')[1]?.slice(0, 5) || "23:59" : "23:59"}
                                        onChange={(e) => {
                                            const currentDate = formData.active_until ? formData.active_until.split('T')[0] : new Date().toISOString().split('T')[0];
                                            setFormData({ ...formData, active_until: `${currentDate}T${e.target.value}:00.000Z` });
                                        }}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => handleTagInputChange(e.target.value)}
                                        className="form-input"
                                        placeholder="e.g., urgent, event, promotion"
                                    />
                                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
                                        Separate tags with commas
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={isSubmitting}
                                        style={{ flex: 1 }}
                                    >
                                        {isSubmitting ? "Saving..." : editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn btn-secondary"
                                        disabled={isSubmitting}
                                        style={{ flex: 1 }}
                                    >
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
