"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { getUser, getAccessToken } from "../../back/post";
import { MenuItem } from "../../types/cafe";
import {
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    fetchCategories,
    CreateMenuItemPayload,
} from "../../back/menuItems";
import { uploadImage } from "../../back/update";

export default function MenuItemsPage() {
    const router = useRouter();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [cafeSlug, setCafeSlug] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [formData, setFormData] = useState<CreateMenuItemPayload>({
        category_ids: [],
        name: "",
        description: null,
        tags: [],
        image_url: null,
        price: 0,
        in_stock: true,
        options: [],
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
                setCafeSlug(slug);

                // Fetch items and categories
                const [itemsData, categoriesData] = await Promise.all([
                    fetchMenuItems(slug),
                    fetchCategories(slug),
                ]);

                setItems(itemsData.items);
                setCategories(categoriesData.items || []);
            } catch (err: any) {
                console.error("Error loading page:", err);
                setError(err.message || "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [router]);

    const handleOpenModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                category_ids: item.category_ids,
                name: item.name,
                description: item.description,
                tags: item.tags,
                image_url: item.image_url,
                price: item.price,
                in_stock: item.in_stock,
                options: item.options,
            });
        } else {
            setEditingItem(null);
            setFormData({
                category_ids: [],
                name: "",
                description: null,
                tags: [],
                image_url: null,
                price: 0,
                in_stock: true,
                options: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingItem) {
                const updated = await updateMenuItem(cafeSlug, editingItem.id, formData);
                setItems(items.map((item) => (item.id === updated.id ? updated : item)));
            } else {
                const created = await createMenuItem(cafeSlug, formData);
                setItems([created, ...items]);
            }
            handleCloseModal();
        } catch (err: any) {
            alert(err.message || "Failed to save item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            await deleteMenuItem(cafeSlug, itemId);
            setItems(items.filter((item) => item.id !== itemId));
        } catch (err: any) {
            alert(err.message || "Failed to delete item");
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

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options!, { type: "", value: "", fee: 0 }],
        });
    };

    const updateOption = (index: number, field: string, value: any) => {
        const newOptions = [...formData.options!];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setFormData({ ...formData, options: newOptions });
    };

    const removeOption = (index: number) => {
        setFormData({
            ...formData,
            options: formData.options!.filter((_, i) => i !== index),
        });
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Loading...</div>
                        <h2>Loading Menu Items...</h2>
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
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Menu Items</h1>
                    <p style={{ opacity: "0.9" }}>Manage your cafe menu items</p>
                </div>

                {/* Search and Add Button */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        + Add Item
                    </button>
                </div>

                {/* Items Grid */}
                <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                    {filteredItems.map((item) => (
                        <div key={item.id} className="cafe-card">
                            {item.image_url && (
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "0.5rem",
                                        marginBottom: "1rem",
                                    }}
                                />
                            )}
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{item.name}</h3>
                            {item.description && (
                                <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                                    {item.description}
                                </p>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                                    ${item.price}
                                </span>
                                <span className={item.in_stock ? "status-online" : "status-offline"}>
                                    {item.in_stock ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                            {item.options && item.options.length > 0 && (
                                <div style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
                                    <strong>Options:</strong> {item.options.length}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleOpenModal(item)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-destructive" style={{ flex: 1 }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "var(--muted-foreground)" }}>No items found. Click "Add Item" to create one.</p>
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
                                {editingItem ? "Edit Item" : "Add New Item"}
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
                                    <label className="form-label">Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Categories</label>
                                    <select
                                        multiple
                                        value={formData.category_ids}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                category_ids: Array.from(e.target.selectedOptions, (option) => option.value),
                                            })
                                        }
                                        className="form-input"
                                        style={{ height: "100px" }}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
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

                                <div className="form-group">
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.in_stock}
                                            onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                        />
                                        In Stock
                                    </label>
                                </div>

                                {/* Options */}
                                <div className="form-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                        <label className="form-label">Options</label>
                                        <button type="button" onClick={addOption} className="btn btn-secondary" style={{ fontSize: "0.875rem" }}>
                                            + Add Option
                                        </button>
                                    </div>
                                    {formData.options!.map((option, index) => (
                                        <div key={index} style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr 1fr auto", marginBottom: "0.5rem" }}>
                                            <input
                                                type="text"
                                                placeholder="Type"
                                                value={option.type}
                                                onChange={(e) => updateOption(index, "type", e.target.value)}
                                                className="form-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={option.value}
                                                onChange={(e) => updateOption(index, "value", e.target.value)}
                                                className="form-input"
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Fee"
                                                value={option.fee}
                                                onChange={(e) => updateOption(index, "fee", parseFloat(e.target.value))}
                                                className="form-input"
                                            />
                                            <button type="button" onClick={() => removeOption(index)} className="btn btn-destructive">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                                    <button type="submit" className="btn btn-success" disabled={isSubmitting} style={{ flex: 1 }}>
                                        {isSubmitting ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
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
