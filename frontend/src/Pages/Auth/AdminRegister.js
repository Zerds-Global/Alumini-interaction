import React, { useState } from "react";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    resume: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("department", formData.department);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("resume", "admin");
    formDataToSend.append("role", "admin");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/users", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setErrorMessage(result.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "#008080" }}
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
            Admin Register
          </h3>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              style={buttonStyle}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "REGISTER"}
            </Button>
          </Form>

          <p className="text-center mt-3" style={{ color: "#ffffff" }}>
            Already have an account?{" "}
            <span
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#ffffff",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

const inputStyle = {
  borderRadius: "30px",
  padding: "12px",
  background: "rgba(255, 255, 255, 0.3)",
  border: "none",
  color: "#fff",
};

const buttonStyle = {
  background: "#ffffff",
  border: "none",
  borderRadius: "30px",
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#008080",
  transition: "all 0.3s ease",
};

export default AdminRegister;
