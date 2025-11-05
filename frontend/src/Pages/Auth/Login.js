import React, { useState } from "react";
import { Form, Button, Card, FormCheck } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://render.com/docs/web-services#port-binding/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token (required for protected routes and API calls)
        localStorage.setItem("token", data.token);
        
        // Store user object (required for ProtectedRoute)
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Store individual fields for backward compatibility
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("resume", data.user.resume);
        localStorage.setItem("id", data.user._id);
        localStorage.setItem("department", data.user.department);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("college", data.user.college || "");
        
        // Store profile data if available
        if (data.user.profile) {
          localStorage.setItem("profile", JSON.stringify(data.user.profile));
        }

        const role = data.user.role;
        if (role === "admin") {
          navigate("/admin/dash"); // Redirect to admin dashboard
        } else if (role === "superadmin") {
          navigate("/superadmin/dash"); // Redirect to superadmin dashboard
        } else if (role === "student") {
          navigate("/student/dash"); // Redirect to student dashboard
        } else if (role === "user" || role === "alumni") {
          navigate("/alumini/dash"); // Redirect to alumni dashboard
        } else {
          setError(data.message || "Invalid email or password.");
        }
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "#008080",
      }}
    >
      <Card
        style={{
          width: "600px",
          padding: "40px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          border: "none",
        }}
      >
        <Card.Body>
          <h3
            className="text-center mb-4"
            style={{ color: "#ffffff", fontWeight: "bold" }}
          >
            Login
          </h3>

          <Form onSubmit={handleSubmit}>
            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "30px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.3)",
                  border: "none",
                  color: "#fff",
                }}
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "30px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.3)",
                  border: "none",
                  color: "#fff",
                }}
              />
            </Form.Group>
            {/* Display Error Message */}
            {error && (
              <div
                className="text-center"
                style={{
                  color: "red",
                }}
              >
                {error}
              </div>
            )}

            {/* Remember Me */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <FormCheck
                type="checkbox"
                label="Remember Me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ color: "#ffffff" }}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{
                background: "#ffffff",
                border: "none",
                borderRadius: "30px",
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#008080",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </Button>
          </Form>

          {/* Register Link */}
          <p className="text-center mt-3" style={{ color: "#ffffff" }}>
            Don't have an account?{" "}
            <span
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#ffffff",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
