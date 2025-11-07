"use client";

import Form from "../../components/Form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, getCurrentUser, saveTokens, saveUser } from "../../back/post";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the real login API
      const loginResponse = await login(username, password);

      // Save tokens
      saveTokens(loginResponse.access_token, loginResponse.refresh_token);

      // Fetch user data
      const userData = await getCurrentUser(loginResponse.access_token);

      // Save user data
      saveUser(userData);

      console.log("Login successful", { user: userData });

      // Check if user owns any cafes
      const ownedCafes = userData.cafes.filter(cafe => cafe.role === 'OWNER');

      if (ownedCafes.length === 0) {
        setError("You don't have permission to access this admin panel");
        return;
      }

      // Redirect to home page
      router.push("/pages/HomePage");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--primary) 0%, #8b4513 50%, var(--sidebar) 100%)",
      padding: "1rem"
    }}>
      <div className="card" style={{
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, var(--primary), #8b4513, var(--sidebar))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            CAFE
          </div>
          <h1 style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            color: "var(--foreground)"
          }}>
            Admin Panel
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Sign in to manage your cafe
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <Form
            title="Username"
            inputType="text"
            value={username}
            onChange={setUsername}
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />
          <Form
            title="Password"
            inputType="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "var(--destructive)",
            color: "white",
            borderRadius: "0.5rem",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          onKeyPress={handleKeyPress}
          className="btn btn-primary"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            fontWeight: "600"
          }}
        >
          {isLoading ? (
            "Signing in..."
          ) : (
            "Sign In"
          )}
        </button>


      </div>
    </div>
  );
}