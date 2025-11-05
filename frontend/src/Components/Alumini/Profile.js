import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";
import { FaUser, FaEnvelope, FaBuilding, FaFileAlt, FaEdit, FaCamera } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

// Add custom styles
const customStyles = `
  .profile-card {
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
  }
  
  .profile-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .profile-header {
    background: linear-gradient(135deg, #008080 0%, #006666 100%);
    height: 120px;
    border-radius: 16px 16px 0 0;
  }
  
  .profile-avatar {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 5px solid white;
    background: linear-gradient(135deg, #008080 0%, #006666 100%);
    margin-top: -70px;
    position: relative;
    cursor: pointer;
  }
  
  .profile-avatar:hover .camera-overlay {
    opacity: 1;
  }
  
  .camera-overlay {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .form-control:focus {
    border-color: #008080;
    box-shadow: 0 0 0 0.2rem rgba(0, 128, 128, 0.25);
  }
`;

function ProfileUpdate() {
    const userId = localStorage.getItem("id"); // Get user ID from localStorage
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        password: "",
        resume: null,
        role: "user",
        currentJobTitle: "",
        currentCompany: "",
        yearsOfExperience: "",
        jobDescription: "",
    });

    const [status, setStatus] = useState({ type: "", message: "" });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Fetch user data on component mount
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("id");
                const response = await fetch(
                    `http://127.0.0.1:5000/api/users/${userId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                const data = await response.json();

                if (response.ok) {
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        department: data.department || "",
                        password: "",
                        resume: null,
                        role: data.role || "user",
                        collegeId: data.collegeId || null,
                        profile: data.profile || {},
                        currentJobTitle: data.profile?.currentJobTitle || "",
                        currentCompany: data.profile?.currentCompany || "",
                        yearsOfExperience: data.profile?.yearsOfExperience || "",
                        jobDescription: data.profile?.jobDescription || "",
                    });
                } else {
                    setStatus({ type: "error", message: "Failed to fetch user data." });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setStatus({
                    type: "error",
                    message: "Something went wrong. Try again later.",
                });
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            // Update alumni work experience using PUT /api/users/:id/profile
            const profileResponse = await fetch(
                `https://render.com/docs/web-services#port-binding/api/users/${userId}/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        currentJobTitle: formData.currentJobTitle,
                        currentCompany: formData.currentCompany,
                        yearsOfExperience: formData.yearsOfExperience,
                        jobDescription: formData.jobDescription,
                    }),
                }
            );

            if (profileResponse.ok) {
                setStatus({
                    type: "success",
                    message: "Work experience updated successfully!",
                });
                setIsEditing(false); // Close the edit form after successful update
            } else {
                const errorData = await profileResponse.json();
                setStatus({
                    type: "error",
                    message: errorData.message || "Failed to update work experience.",
                });
            }
        } catch (error) {
            console.error("Error updating work experience:", error);
            setStatus({
                type: "error",
                message: "Something went wrong. Please try again later.",
            });
        }
    };

    return (
        <>
            <style>{customStyles}</style>
            <Container
                id="main"
                style={{
                    marginLeft: "350px",
                    marginRight: "auto",
                    maxWidth: "1100px",
                    marginTop: "80px",
                    paddingBottom: "80px"
                }}
            >
                {status.message && (
                    <Alert
                        variant={status.type === "success" ? "success" : "danger"}
                        className="text-center"
                        style={{
                            maxWidth: "900px",
                            margin: "0 auto 20px",
                            borderRadius: "12px",
                            fontSize: "15px"
                        }}
                    >
                        {status.message}
                    </Alert>
                )}

                {/* Profile Header Card */}
                <Card className="profile-card" style={{
                    borderRadius: "16px",
                    marginBottom: "25px",
                    maxWidth: "900px",
                    margin: "0 auto 25px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}>
                    {/* Cover Image */}
                    <div className="profile-header"></div>

                    <Card.Body style={{ padding: "0 30px 30px" }}>
                        {/* Profile Avatar */}
                        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "20px" }}>
                            <div className="profile-avatar" style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "48px",
                                fontWeight: "bold"
                            }}>
                                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                                <div className="camera-overlay">
                                    <FaCamera style={{ color: "#008080", fontSize: "18px" }} />
                                </div>
                            </div>
                            <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setIsEditing(!isEditing)}
                                    style={{
                                        border: "2px solid #008080",
                                        color: "#008080",
                                        fontWeight: "600",
                                        borderRadius: "20px",
                                        padding: "8px 20px",
                                        fontSize: "14px"
                                    }}
                                >
                                    <FaEdit style={{ marginRight: "8px" }} />
                                    {isEditing ? "Cancel Edit" : "Edit Profile"}
                                </Button>
                            </div>
                        </div>

                        {/* Profile Info Display */}
                        {!isEditing && (
                            <div style={{
                                color: "#333",
                                fontSize: "16px",
                                lineHeight: "1.8",
                                padding: "20px",
                                backgroundColor: "#fff",
                                borderRadius: "8px"
                            }}>
                                <h2 style={{
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "#1a1a1a",
                                    marginBottom: "16px"
                                }}>
                                    {formData.name}
                                </h2>
                                <p style={{
                                    fontSize: "16px",
                                    marginBottom: "16px"
                                }}>
                                    {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : ""}
                                </p>

                                <p style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
                                    <FaEnvelope style={{ marginRight: "8px", color: "#008080" }} />
                                    {formData.email}
                                </p>

                                <p style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
                                    <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                    {formData.department}
                                </p>

                                <p style={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
                                    <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                    College: {formData.collegeId?.name || ""}
                                </p>

                                <div style={{ marginBottom: "24px" }}>
                                    <p style={{
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        marginBottom: "16px"
                                    }}>
                                        Profile Details:
                                    </p>
                                    <p style={{ marginBottom: "8px" }}>
                                        Roll Number: {formData.profile?.rollNumber || ""}
                                    </p>
                                    <p style={{ marginBottom: "8px" }}>
                                        Age: {formData.profile?.age || ""}
                                    </p>
                                    <p style={{ marginBottom: "8px" }}>
                                        Degree: {formData.profile?.degree || ""}
                                    </p>
                                    <p style={{ marginBottom: "8px" }}>
                                        Batch: {formData.profile?.batch || ""}
                                    </p>
                                </div>


                                {/* Professional Experience Section */}
                                {(formData.currentJobTitle || formData.currentCompany) && (
                                    <div style={{
                                        backgroundColor: "#f0f8f8",
                                        padding: "15px",
                                        borderRadius: "10px",
                                        marginBottom: "15px",
                                        borderLeft: "4px solid #008080"
                                    }}>
                                        <strong style={{ color: "#008080", fontSize: "16px" }}>Professional Experience</strong>
                                        <div style={{ marginTop: "10px", color: "#333" }}>
                                            {formData.currentJobTitle && (
                                                <p style={{ marginBottom: "5px" }}>
                                                    <strong>Job Title:</strong> {formData.currentJobTitle}
                                                </p>
                                            )}
                                            {formData.currentCompany && (
                                                <p style={{ marginBottom: "5px" }}>
                                                    <strong>Company:</strong> {formData.currentCompany}
                                                </p>
                                            )}
                                            {formData.yearsOfExperience && (
                                                <p style={{ marginBottom: "5px" }}>
                                                    <strong>Experience:</strong> {formData.yearsOfExperience} years
                                                </p>
                                            )}
                                            {formData.jobDescription && (
                                                <p style={{ marginTop: "10px", marginBottom: "0" }}>
                                                    <strong>Description:</strong> {formData.jobDescription}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Resume Section */}
                                <div style={{
                                    backgroundColor: "#f8f9fa",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    marginTop: "15px"
                                }}>
                                    <strong style={{ color: "#333" }}>Resume: </strong>
                                    <span style={{ color: "#666" }}>
                                        {formData.resume ? formData.resume.name : "No resume uploaded"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Edit Form Card */}
                {isEditing && (
                    <Card className="profile-card" style={{
                        borderRadius: "16px",
                        maxWidth: "900px",
                        margin: "0 auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                    }}>
                        <Card.Body style={{ padding: "30px" }}>
                            <h3 style={{
                                fontSize: "24px",
                                fontWeight: "700",
                                color: "#1a1a1a",
                                marginBottom: "25px"
                            }}>
                                Edit Profile Information
                            </h3>

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                                <FaUser style={{ marginRight: "8px", color: "#008080" }} />
                                                Full Name
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                disabled
                                                style={{
                                                    fontSize: "15px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #e0e0e0",
                                                    backgroundColor: "#f5f5f5"
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                                <FaEnvelope style={{ marginRight: "8px", color: "#008080" }} />
                                                Email Address
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                style={{
                                                    fontSize: "15px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #e0e0e0",
                                                    backgroundColor: "#f5f5f5"
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                                <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                                Department
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                disabled
                                                style={{
                                                    fontSize: "15px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #e0e0e0",
                                                    backgroundColor: "#f5f5f5"
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>

                                </Row>

                                <h4 style={{
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    color: "#1a1a1a",
                                    marginBottom: "15px",
                                    marginTop: "25px",
                                    paddingTop: "20px",
                                    borderTop: "2px solid #e0e0e0"
                                }}>
                                    <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                    Professional Experience (Alumni Only)
                                </h4>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                                Current Job Title
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="currentJobTitle"
                                                value={formData.currentJobTitle}
                                                onChange={handleChange}
                                                placeholder="e.g., Software Engineer"
                                                style={{
                                                    fontSize: "15px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #e0e0e0"
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                                Current Company
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="currentCompany"
                                                value={formData.currentCompany}
                                                onChange={handleChange}
                                                placeholder="e.g., Tech Corp"
                                                style={{
                                                    fontSize: "15px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #e0e0e0"
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                                Years of Experience
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="yearsOfExperience"
                                                value={formData.yearsOfExperience}
                                                onChange={handleChange}
                                                placeholder="e.g., 3"
                                                min="0"
                                                max="70"
                                                style={{
                                                    fontSize: "15px",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #e0e0e0"
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                        Job Description / Role Summary
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe your current role, responsibilities, and achievements..."
                                        style={{
                                            fontSize: "15px",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "2px solid #e0e0e0"
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                                        <FaFileAlt style={{ marginRight: "8px", color: "#008080" }} />
                                        Resume (PDF only)
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="resume"
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                        style={{
                                            fontSize: "15px",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "2px solid #e0e0e0"
                                        }}
                                    />
                                    <Form.Text className="text-muted">
                                        Upload your latest resume in PDF format
                                    </Form.Text>
                                </Form.Group>

                                <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        style={{
                                            fontSize: "16px",
                                            padding: "12px 30px",
                                            flex: 1,
                                            background: "linear-gradient(135deg, #008080 0%, #006666 100%)",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontWeight: "600",
                                            boxShadow: "0 4px 12px rgba(0,128,128,0.3)",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,128,128,0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,128,128,0.3)";
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setIsEditing(false)}
                                        style={{
                                            fontSize: "16px",
                                            padding: "12px 30px",
                                            borderRadius: "8px",
                                            fontWeight: "600",
                                            border: "2px solid #ddd"
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </>
    );
}

export default ProfileUpdate;
