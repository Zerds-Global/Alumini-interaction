import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function FeedbackForm() {
  const username = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const department = localStorage.getItem("department");

  const [formData, setFormData] = useState({
    name: username || "",
    email: email || "",
    department: department || "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://render.com/docs/web-services#port-binding/api/feedback", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: "Feedback submitted successfully!" });
        setFormData({ name: "", email: "", department: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to submit feedback!" });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus({ type: "error", message: "Something went wrong. Please try again later." });
    }
  };

  return (
    <Container
      id="main"
      style={{
        marginLeft: "300px",
        marginRight: "auto",
        maxWidth: "1100px",
        marginTop: "100px",
      }}
    >
      <h2 className="text-center mb-4" style={{ color: "#008080", fontWeight: "bold", fontSize: "32px" }}>
        Feedback Form
      </h2>

      {/* Display success or error messages */}
      {status.message && (
        <Alert variant={status.type === "success" ? "success" : "danger"} className="text-center">
          {status.message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: "18px", fontWeight: "bold" }}>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            readOnly
            style={{ fontSize: "18px", padding: "10px" }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: "18px", fontWeight: "bold" }}>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly
            style={{ fontSize: "18px", padding: "10px" }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: "18px", fontWeight: "bold" }}>Department</Form.Label>
          <Form.Control
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            readOnly
            style={{ fontSize: "18px", padding: "10px" }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: "18px", fontWeight: "bold" }}>Message</Form.Label>
          <Form.Control
            as="textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            style={{ fontSize: "18px", padding: "10px" }}
          />
        </Form.Group>

        <div className="text-center">
          <Button
            type="submit"
            variant="primary"
            style={{ fontSize: "18px", padding: "10px 20px", width: "100%", backgroundColor: "#008080" }}
          >
            Submit Feedback
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default FeedbackForm;
