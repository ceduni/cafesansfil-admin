"use client";

import Form from "../../components/Form";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (username === "admin" && password === "admin") {
        console.log("Login successful", { username, password });
        router.push("/pages/HomePage");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
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

        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          background: "var(--muted)", 
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          color: "var(--muted-foreground)"
        }}>
          <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Demo Credentials:</div>
          <div>Username: <code style={{ background: "var(--accent)", padding: "0.125rem 0.25rem", borderRadius: "0.25rem" }}>admin</code></div>
          <div>Password: <code style={{ background: "var(--accent)", padding: "0.125rem 0.25rem", borderRadius: "0.25rem" }}>admin</code></div>
        </div>
      </div>
    </div>
  );
}