"use client";

import styles from './login.module.css'
import Image from "next/image";
import Form from "../../components/Form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, getCurrentUser, saveTokens, saveUser } from "../../back/post";


type Translations = Record<string, Record<string, string>>;

const trans: Translations = {
  "en": {
    "sign_in": "Sign in to manage your cafe",
    "username.placeholder": "Enter your username",
    "password.placeholder": "Enter your password",
  },
  "fr": {
    "sign_in": "Connectez-vous pour gérer votre café",
    "username.placeholder": "Entrez votre nom d'utilisateur",
    "password.placeholder": "Entrez votre mot de passe",
  }
}

type Lang = keyof typeof trans;
type TranslationKey<L extends Lang> = keyof typeof trans[L];

const lang: Lang = "fr";

const t = (k: string) => trans[lang]?.[k] ?? k;

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
    <div className={styles["login-container"]}>
      <div className={`card ${styles["login-card"]}`}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className={styles["login-card__logo"]}>
            <Image src="/logo.png" alt="Café sans-fil logo" width={100} height={100} />
          </div>

          <h1 className={styles["login-card__title"]}>
            Admin Panel
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            {t("sign_in")}
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <Form title="Username" inputType="text" value={username} onChange={setUsername} placeholder={t("username.placeholder")} required disabled={isLoading} />
          <Form title="Password" inputType="password" value={password} onChange={setPassword} placeholder={t("password.placeholder")} required disabled={isLoading} />
        </div>

        {error && (
          <div className={styles["login-card__error"]}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} onKeyUp={handleKeyPress} className={`btn btn-primary ${styles["login-card__login-button"]}`} disabled={isLoading}>
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