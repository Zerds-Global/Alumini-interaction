import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";
import { FaUser, FaEnvelope, FaBuilding, FaLock, FaFileAlt, FaEdit, FaCamera } from "react-icons/fa";
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

function StudentsProfile() {
    const userId = localStorage.getItem("id"); // Get user ID from localStorage
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        department: "",
        role: "",
        collegeId: null,
        profile: {},
        resume: null
    });

    const [status, setStatus] = useState({ type: "", message: "" });

    useEffect(() => {
        // Fetch user data on component mount
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
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
                    setUserData({
                        name: data.name || "",
                        email: data.email || "",
                        department: data.department || "",
                        role: data.role || "",
                        collegeId: data.collegeId || null,
                        profile: data.profile || {},
                        resume: data.resume || null
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

        if (userId) {
            fetchUserData();
        }
    }, [userId]);



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
                                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                                </div>
                        </div>

                        {/* Profile Info Display */}
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
                                {userData.name}
                            </h2>
                            <p style={{
                                fontSize: "16px",
                                marginBottom: "16px"
                            }}>
                                {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : ""}
                            </p>

                            <p style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
                                <FaEnvelope style={{ marginRight: "8px", color: "#008080" }} />
                                {userData.email}
                            </p>

                            <p style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
                                <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                {userData.department}
                            </p>

                            <p style={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
                                <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                College: {userData.collegeId?.name || ""}
                            </p>

                            <div style={{ marginBottom: "24px" }}>
                                <p style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    marginBottom: "16px"
                                }}>
                                    Profile Details:
                                </p>
                                <p style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                                    <FaUser style={{ marginRight: "8px", color: "#008080" }} />
                                    Roll Number: {userData.profile?.rollNumber || ""}
                                </p>
                                <p style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                                    <FaUser style={{ marginRight: "8px", color: "#008080" }} />
                                    Age: {userData.profile?.age || ""}
                                </p>
                                <p style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                                    <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                    Degree: {userData.profile?.degree || ""}
                                </p>
                                <p style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                                    <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                    Batch: {userData.profile?.batch || ""}
                                </p>
                            </div>

                            <div style={{ marginTop: "24px" }}>
                                <p style={{ display: "flex", alignItems: "center" }}>
                                    <FaFileAlt style={{ marginRight: "8px", color: "#008080" }} />
                                    Resume: {userData.resume ? userData.resume.name : "No resume uploaded"}
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>


            </Container>
        </>
    );
}

export default StudentsProfile;
