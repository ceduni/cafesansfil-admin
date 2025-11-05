"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>("");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const startPosition = window.pageYOffset;
      const targetPosition = element.offsetTop - 20; // 20px offset from top
      const distance = targetPosition - startPosition;
      const duration = 500; // 0.5 seconds
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smooth animation (ease-in-out)
        const easeInOut = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOut);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const handleMenuClick = (item: any) => {
    if (item.path) {
      router.push(item.path);
    } else if (item.sectionId) {
      scrollToSection(item.sectionId);
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: "D", path: "/pages/HomePage" },
    { name: "Description", icon: "T", sectionId: "description" },
    { name: "Images", icon: "I", sectionId: "images" },
    { name: "Opening Hours", icon: "H", sectionId: "opening-hours" },
    { name: "Payment Methods", icon: "P", sectionId: "payment-methods" },
    { name: "Location", icon: "L", sectionId: "location" },
    { name: "Contact", icon: "C", sectionId: "contact" },
    { name: "Social Media", icon: "S", sectionId: "social-media" },
    { name: "Owner", icon: "O", sectionId: "owner" },
    { name: "Staff", icon: "S", sectionId: "staff" }
  ];

  // Track active section on scroll
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let sections: HTMLElement[] = [];

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      sections = menuItems
        .filter(item => item.sectionId)
        .map(item => document.getElementById(item.sectionId!))
        .filter(Boolean) as HTMLElement[];

      if (sections.length === 0) return;

      const observerOptions = {
        root: null,
        rootMargin: '-120px 0px -60% 0px', // Trigger when section is near top
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // Find the section with the highest intersection ratio
        let activeId: string | null = null;
        let maxRatio = 0;

        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeId = (entry.target as HTMLElement).id;
          }
        });

        if (activeId) {
          setActiveSection(activeId);
        }
      };

      observer = new IntersectionObserver(observerCallback, observerOptions);

      sections.forEach(section => {
        if (section) {
          observer!.observe(section);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        sections.forEach(section => {
          if (section) {
            observer!.unobserve(section);
          }
        });
      }
    };
  }, []);

  return (
    <div className="sidebar" style={{ 
      position: "sticky", 
      top: "0", 
      height: "100vh", 
      overflowY: "auto" 
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "bold", 
          color: "var(--sidebar-foreground)",
          marginBottom: "0.5rem"
        }}>
          Admin Panel
        </h1>
        <p style={{ 
          fontSize: "0.875rem", 
          color: "var(--muted-foreground)" 
        }}>
          Cafe Management System
        </p>
      </div>

      <nav>
        {menuItems.map((item) => {
          const isActive = item.sectionId === activeSection;
          return (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item)}
              className="nav-item"
              style={{ 
                width: "100%", 
                textAlign: "left",
                background: isActive ? "var(--primary)" : "none",
                color: isActive ? "var(--primary-foreground)" : "var(--sidebar-foreground)",
                border: "none",
                cursor: "pointer",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
                transition: "all 0.2s ease",
                fontWeight: isActive ? "600" : "400",
                borderLeft: isActive ? "3px solid var(--primary-foreground)" : "3px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "none";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem", fontSize: "1.25rem" }}>
                {item.icon}
              </span>
              {item.name}
            </button>
          );
        })}
      </nav>

      <div style={{ 
        marginTop: "auto", 
        paddingTop: "2rem",
        borderTop: "1px solid var(--border)"
      }}>
        {/* Theme Toggle */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "0.75rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "0.5rem",
          marginBottom: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", marginRight: "0.5rem" }}>
              {isDarkMode ? "🌙" : "☀️"}
            </span>
            <span style={{ fontSize: "0.875rem" }}>
              {isDarkMode ? "Dark" : "Light"} Mode
            </span>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: "40px",
              height: "20px",
              borderRadius: "10px",
              background: isDarkMode ? "var(--primary)" : "var(--muted-foreground)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.3s ease"
            }}
          >
            <div style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: "2px",
              left: isDarkMode ? "22px" : "2px",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }} />
          </button>
        </div>

        {/* System Status */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          padding: "0.75rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "0.5rem"
        }}>
          <div style={{ 
            width: "8px", 
            height: "8px", 
            borderRadius: "50%", 
            background: "var(--success)",
            marginRight: "0.5rem"
          }}></div>
          <span style={{ fontSize: "0.875rem" }}>System Online</span>
        </div>
      </div>
    </div>
  );
}
