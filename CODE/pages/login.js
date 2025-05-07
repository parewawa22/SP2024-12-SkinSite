import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../styles/log-in.module.css";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const role = typeof window !== "undefined" ? localStorage.getItem("user_role") : null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
        // Clear previous user data first
        localStorage.clear();

        const response = await fetch("/api/api_login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store new user data
            localStorage.setItem("user_acc_id", data.acc_id);
            localStorage.setItem("user_name", data.accName);
            localStorage.setItem("user_role", data.accRoles);
            localStorage.setItem("last_login", new Date().toISOString());

            // Debug log
            console.log('Stored new user data:', {
                acc_id: data.acc_id,
                name: data.accName,
                role: data.accRoles
            });

            // Redirect based on role
            router.push(data.accRoles === "Admin" ? "/admin/adminAccount" : "/account");
        } else {
            setErrorMessage(data.message || "Invalid email or password!");
        }
    } catch (error) {
        console.error("Login error:", error);
        setErrorMessage("Something went wrong. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <a href="/">
            <Image src="/image/logoname.png" alt="SkinSite Logo" width={250} height={60} />
          </a>
        </div>

        <h2 className={styles.welcome}>Welcome back</h2>
        <p className={styles.subtext}>It's good to see you again! Sign in below</p>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <form className={styles.form} onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <a href="/signup" className={styles.signupLink}>Sign up</a>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

