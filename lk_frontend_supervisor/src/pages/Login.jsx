import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../styles/Auth.css";
import { jwtDecode } from "jwt-decode"; // Added for token decoding

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login/", formData);
      console.log("Login response:", response.data);

      if (!response.data.access) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      // Store the token
      const token = response.data.access;
      localStorage.setItem("token", token);

      // Get user data from response
      const userData = response.data.user;
      console.log("User data from response:", userData);

      if (!userData || userData.role !== "SUPERVISOR") {
        console.error("Invalid role:", userData?.role);
        setError("Access denied. Supervisor credentials required.");
        localStorage.removeItem("token");
        return;
      }

      // Store user data
      const userToStore = {
        id: userData.id,
        email: response.data.email,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      console.log("Stored user data:", userToStore);

      // Dispatch auth change event
      window.dispatchEvent(new Event("authChange"));

      // Navigate to dashboard
      console.log(
        "Successfully logged in as supervisor, navigating to dashboard"
      );
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Supervisor Login</h1>
          <p>Access your supervisor dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ paddingRight: "40px" }} // space for the icon
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "35px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#003f6b",
                fontSize: "16px",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
