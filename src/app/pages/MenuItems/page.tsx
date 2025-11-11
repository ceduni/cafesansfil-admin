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
    createCategory,
    updateCategory,
    deleteCategory,
    toggleItemHighlight,
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
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

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

    // New category creation state
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    // Category management state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });

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
                // API returns array directly: [{ id, name, description }]
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setCategoryError('Name is required');
            return;
        }

        try {
            setIsCreatingCategory(true);
            setCategoryError(null);
            const created = await createCategory(cafeSlug, { name: newCategoryName.trim(), description: newCategoryDescription || undefined });
            // Append to list and select it
            setCategories((prev) => [created, ...prev]);
            setFormData({ ...formData, category_ids: [...(formData.category_ids || []), created.id] });
            setNewCategoryName('');
            setNewCategoryDescription('');
        } catch (err: any) {
            console.error('Create category failed', err);
            setCategoryError(err.message || 'Failed to create category');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleToggleHighlight = async (itemId: string) => {
        try {
            const updatedItem = await toggleItemHighlight(cafeSlug, itemId);
            setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
        } catch (err: any) {
            alert(err.message || "Failed to toggle highlight");
        }
    };

    const handleOpenCategoryModal = (category?: any) => {
        if (category) {
            setEditingCategory(category);
            setCategoryFormData({ name: category.name, description: category.description || "" });
        } else {
            setEditingCategory({});  // Empty object to indicate new category mode
            setCategoryFormData({ name: "", description: "" });
        }
        setIsCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryFormData({ name: "", description: "" });
        setCategoryError(null);
    };

    const handleSaveCategory = async () => {
        if (!categoryFormData.name.trim()) {
            setCategoryError('Name is required');
            return;
        }

        try {
            setIsCreatingCategory(true);
            setCategoryError(null);

            // Build payload with only non-empty fields
            const payload: { name: string; description?: string } = {
                name: categoryFormData.name.trim()
            };

            if (categoryFormData.description.trim()) {
                payload.description = categoryFormData.description.trim();
            }

            if (editingCategory) {
                const updated = await updateCategory(cafeSlug, editingCategory.id, payload);
                setCategories(categories.map((cat) => (cat.id === updated.id ? updated : cat)));
            } else {
                const created = await createCategory(cafeSlug, payload);
                setCategories([created, ...categories]);
            }
            handleCloseCategoryModal();
        } catch (err: any) {
            console.error('Save category failed', err);
            setCategoryError(err.message || 'Failed to save category');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            await deleteCategory(cafeSlug, categoryId);
            setCategories(categories.filter((cat) => cat.id !== categoryId));
        } catch (err: any) {
            alert(err.message || "Failed to delete category");
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
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategoryFilter ? (item.category_ids || []).includes(selectedCategoryFilter) : true)
    );

    const highlightedItems = filteredItems.filter((item) => item.is_highlighted);
    const regularItems = filteredItems.filter((item) => !item.is_highlighted);

    const renderItemCard = (item: MenuItem) => (
        <div key={item.id} className="cafe-card" style={{ position: 'relative', border: item.is_highlighted ? '2px solid gold' : undefined }}>

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
            {item.category_ids && item.category_ids.length > 0 && (
                <div style={{ marginBottom: "0.5rem", display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.category_ids.map((cid) => {
                        const cat = categories.find((c) => c.id === cid);
                        if (!cat) return null;
                        return (
                            <span key={cid} style={{
                                background: 'var(--muted)',
                                color: 'var(--foreground)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.85rem'
                            }}>{cat.name}</span>
                        );
                    })}
                </div>
            )}
            {item.description && (
                <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                    {item.description}
                </p>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : Number(item.price).toFixed(2)}
                </span>
                <span className={item.in_stock ? "status-online" : "status-offline"}>
                    {item.in_stock ? "En stock" : "En rupture"}
                </span>
            </div>
            {item.options && item.options.length > 0 && (
                <div style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
                    <strong>Options:</strong> {item.options.length}
                </div>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <button
                    onClick={() => handleToggleHighlight(item.id)}
                    className={`btn ${item.is_highlighted ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    title={item.is_highlighted ? "Remove highlight" : "Highlight item"}
                >
                    {item.is_highlighted ? "Retirer des articles en vedette" : "Ajouter aux articles en vedette"}
                </button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleOpenModal(item)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="btn btn-destructive" style={{ flex: 1 }}>
                    Delete
                </button>
            </div>
        </div>
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
                    <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary">
                        Manage Categories
                    </button>
                </div>

                {/* Category quick filters */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        className={`btn ${selectedCategoryFilter === null ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedCategoryFilter(null)}
                        style={{ padding: '0.4rem 0.6rem' }}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`btn ${selectedCategoryFilter === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedCategoryFilter((prev) => (prev === cat.id ? null : cat.id))}
                            style={{ padding: '0.4rem 0.6rem' }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Highlighted Items Section */}
                {highlightedItems.length > 0 && (
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            Articles en vedette
                        </h2>
                        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                            {highlightedItems.map((item) => renderItemCard(item))}
                        </div>
                    </div>
                )}

                {/* Regular Items Section */}
                <div>
                    {highlightedItems.length > 0 && (
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            Tous les articles
                        </h2>
                    )}
                    <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                        {regularItems.map((item) => renderItemCard(item))}
                    </div>
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
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                                        {categories.length === 0 ? (
                                            <div style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>No categories available. Create one below.</div>
                                        ) : (
                                            categories.map((cat) => (
                                                <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.category_ids.includes(cat.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    category_ids: [...formData.category_ids, cat.id],
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    category_ids: formData.category_ids.filter((id) => id !== cat.id),
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <span>{cat.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Create category inline */}
                                <div className="form-group" style={{ marginTop: "0.5rem" }}>
                                    <label className="form-label">Create New Category</label>
                                    <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr auto" }}>
                                        <input
                                            type="text"
                                            placeholder="Category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="form-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Short description (optional)"
                                            value={newCategoryDescription}
                                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                                            className="form-input"
                                        />
                                        <button type="button" onClick={handleCreateCategory} className="btn btn-primary" disabled={isCreatingCategory}>
                                            {isCreatingCategory ? "Creating..." : "Create"}
                                        </button>
                                    </div>
                                    {categoryError && (
                                        <div style={{ color: "var(--destructive)", marginTop: "0.5rem" }}>{categoryError}</div>
                                    )}
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
                                        En stock
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

                {/* Category Management Modal */}
                {isCategoryModalOpen && !editingCategory && (
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
                        onClick={handleCloseCategoryModal}
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                                    Manage Categories
                                </h2>
                                <button onClick={() => handleOpenCategoryModal()} className="btn btn-primary">
                                    + Add Category
                                </button>
                            </div>

                            {categories.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
                                    <p>No categories yet. Create one to get started!</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "1rem",
                                                border: "1px solid var(--border)",
                                                borderRadius: "0.5rem",
                                                background: "var(--muted)"
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{cat.name}</div>
                                                {cat.description && (
                                                    <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                                        {cat.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => handleOpenCategoryModal(cat)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: "0.5rem 0.75rem" }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="btn btn-destructive"
                                                    style={{ padding: "0.5rem 0.75rem" }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: "1.5rem" }}>
                                <button onClick={handleCloseCategoryModal} className="btn btn-secondary" style={{ width: "100%" }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Form Modal (Add/Edit) */}
                {editingCategory !== null && (
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
                            zIndex: 1001,
                            padding: "1rem",
                        }}
                        onClick={handleCloseCategoryModal}
                    >
                        <div
                            className="card"
                            style={{
                                maxWidth: "500px",
                                width: "100%",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
                                {editingCategory.id ? "Edit Category" : "Add New Category"}
                            </h2>

                            <div className="form-group">
                                <label className="form-label">Category Name *</label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    className="form-input"
                                    placeholder="Enter category name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description (optional)</label>
                                <textarea
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Enter category description"
                                />
                            </div>

                            {categoryError && (
                                <div style={{ color: "var(--destructive)", marginBottom: "1rem" }}>{categoryError}</div>
                            )}

                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                                <button onClick={handleSaveCategory} className="btn btn-success" disabled={isCreatingCategory} style={{ flex: 1 }}>
                                    {isCreatingCategory ? "Saving..." : editingCategory.id ? "Update Category" : "Create Category"}
                                </button>
                                <button onClick={handleCloseCategoryModal} className="btn btn-secondary" disabled={isCreatingCategory} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
