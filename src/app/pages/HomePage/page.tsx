"use client";

import fetchCafe from "@/app/back/fetch";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getAccessToken } from "../../back/post";
import EditDescription from "../../components/EditDescription";
import Sidebar from "../../components/Sidebar";
import ImageEditor from "../../components/ImageEditor";
import OpeningHoursEditor from "../../components/OpeningHoursEditor";
import PaymentMethodsEditor from "../../components/PaymentMethodsEditor";
import LocationEditor from "../../components/LocationEditor";
import ContactEditor from "../../components/ContactEditor";
import SocialMediaEditor from "../../components/SocialMediaEditor";
import OwnerEditor from "../../components/OwnerEditor";
import StaffEditor from "../../components/StaffEditor";
import { Cafe } from "../../types/cafe";

export default function HomePage() {
    const router = useRouter();
    const [cafe, setCafe] = useState<Cafe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializePage = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Check if user is authenticated
                const accessToken = getAccessToken();
                if (!accessToken) {
                    router.push("/pages/Login");
                    return;
                }

                // Get user data
                const user = getUser();
                if (!user) {
                    router.push("/pages/Login");
                    return;
                }

                // Get the first owned cafe
                const ownedCafes = user.cafes.filter(cafe => cafe.role === 'OWNER');
                if (ownedCafes.length === 0) {
                    setError("You don't own any cafes");
                    return;
                }

                // Fetch the first owned cafe's details
                const cafeSlug = ownedCafes[0].slug;
                const cafeData = await fetchCafe(cafeSlug);

                if (cafeData) {
                    setCafe(cafeData);
                } else {
                    setError("Failed to load cafe data");
                }
            } catch (err: any) {
                console.error("Error loading page:", err);
                setError(err.message || "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();
    }, [router]);

    const handleDescriptionUpdate = (newDescription: string) => {
        if (cafe) {
            setCafe({ ...cafe, description: newDescription });
        }
    };

    if (isLoading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Loading...</div>
                        <h2>Loading Cafe Data...</h2>
                        <p style={{ color: "var(--muted-foreground)" }}>Please wait while we fetch the latest information.</p>
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
                        <p style={{ color: "var(--muted-foreground)" }}>Please try again or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!cafe) {
        return null;
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
                <div className="cafe-header">
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                        Cafe Dashboard
                    </h1>
                    <p style={{ opacity: "0.9" }}>
                        Manage your cafe information and settings
                    </p>
                </div>

                <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    {/* Cafe Overview Card */}
                    <div className="cafe-card">
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
                            Cafe Overview
                        </h3>
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>
                                {cafe?.name}
                            </div>
                            <div style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                {cafe?.affiliation?.university} • {cafe?.affiliation?.faculty}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Status</div>
                                <div className={cafe?.is_open ? "status-online" : "status-offline"}>
                                    {cafe?.is_open ? "Open" : "Closed"}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Location</div>
                                <div>{cafe?.location?.pavillon}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="cafe-card">
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "var(--primary)" }}>
                            Quick Stats
                        </h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>Staff Members</span>
                                <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                                    {((cafe?.staff?.admins?.length || 0) + (cafe?.staff?.volunteers?.length || 0)) || 0}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>Menu Items</span>
                                <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                                    {cafe?.menu?.categories?.reduce((total: number, cat: any) => total + cat.items.length, 0) || 0}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>Payment Methods</span>
                                <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                                    {cafe?.payment_details?.length || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Editor */}
                <div id="description" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <EditDescription
                        description={cafe?.description || ""}
                        setDescription={handleDescriptionUpdate}
                        cafeSlug={cafe.slug}
                    />
                </div>

                {/* Image Editor */}
                <div id="images" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <ImageEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Opening Hours Editor */}
                <div id="opening-hours" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <OpeningHoursEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Payment Methods Editor */}
                <div id="payment-methods" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <PaymentMethodsEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Location Editor */}
                <div id="location" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <LocationEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Contact Editor */}
                <div id="contact" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <ContactEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Social Media Editor */}
                <div id="social-media" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <SocialMediaEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Owner Editor */}
                <div id="owner" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <OwnerEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>

                {/* Staff Editor */}
                <div id="staff" className="cafe-card" style={{ marginTop: "1.5rem" }}>
                    <StaffEditor
                        cafe={cafe}
                        onUpdate={setCafe}
                    />
                </div>
            </div>
        </div>
    );
}