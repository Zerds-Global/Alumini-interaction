import React, { useState, useEffect } from "react";
import { Container, Card, Alert } from "react-bootstrap";
import { FaUser, FaEnvelope, FaBuilding, FaFileAlt } from "react-icons/fa";
import { useParams } from "react-router-dom";
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
  }
`;

function ViewProfile() {
    const { userId } = useParams();
    const [userData, setUserData] = useState(null);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(
                    `https://render.com/docs/web-services#port-binding/api/users/${userId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                const data = await response.json();

                if (response.ok) {
                    setUserData(data);
                } else {
                    setStatus({ type: "error", message: "Failed to fetch user data." });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setStatus({
                    type: "error",
                    message: "Something went wrong. Try again later.",
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    if (loading) {
        return (
            <Container
                style={{
                    marginLeft: "350px",
                    marginRight: "auto",
                    maxWidth: "1100px",
                    marginTop: "80px",
                    textAlign: "center"
                }}
            >
                Loading profile...
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container
                style={{
                    marginLeft: "350px",
                    marginRight: "auto",
                    maxWidth: "1100px",
                    marginTop: "80px"
                }}
            >
                <Alert variant="danger">User not found.</Alert>
            </Container>
        );
    }

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
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
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
                        <div>
                            <h2 style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                color: "#1a1a1a",
                                marginBottom: "8px"
                            }}>
                                {userData.name || "User Name"}
                            </h2>
                            <p style={{
                                fontSize: "18px",
                                color: "#666",
                                marginBottom: "12px"
                            }}>
                                {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Role"}
                            </p>
                            <p style={{
                                fontSize: "15px",
                                color: "#888",
                                marginBottom: "20px"
                            }}>
                                <FaEnvelope style={{ marginRight: "8px", color: "#008080" }} />
                                {userData.email || "email@example.com"}
                            </p>
                            <p style={{
                                fontSize: "15px",
                                color: "#666",
                                marginBottom: "12px"
                            }}>
                                <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                {userData.department || "Department"}
                            </p>
                            {userData.collegeId && (
                                <p style={{
                                    fontSize: "15px",
                                    color: "#666",
                                    marginBottom: "12px"
                                }}>
                                    <FaBuilding style={{ marginRight: "8px", color: "#008080" }} />
                                    College: {userData.collegeId.name || "College"}
                                </p>
                            )}
                            {userData.profile && (
                                <div style={{
                                    backgroundColor: "#f8f9fa",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    marginTop: "15px"
                                }}>
                                    <strong style={{ color: "#333" }}>Profile Details:</strong>
                                    <br />
                                    <span style={{ color: "#666" }}>
                                        Roll Number: {userData.profile.rollNumber || "N/A"}<br />
                                        Age: {userData.profile.age || "N/A"}<br />
                                        Degree: {userData.profile.degree || "N/A"}<br />
                                        Batch: {userData.profile.batch || "N/A"}
                                    </span>
                                </div>
                            )}

                            {/* Alumni Work Experience Section */}
                            {userData.role === "alumni" && userData.profile && (
                                <div style={{
                                    backgroundColor: "#f0f8f8",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    marginTop: "20px",
                                    borderLeft: "4px solid #008080"
                                }}>
                                    <h3 style={{ 
                                        fontSize: "18px", 
                                        color: "#008080", 
                                        marginBottom: "15px",
                                        fontWeight: "600"
                                    }}>
                                        <FaBuilding style={{ marginRight: "8px" }} />
                                        Professional Experience
                                    </h3>
                                    
                                    {userData.profile.currentJobTitle ? (
                                        <div>
                                            <p style={{ marginBottom: "8px", color: "#333" }}>
                                                <strong>Current Position:</strong> {userData.profile.currentJobTitle}
                                            </p>
                                            <p style={{ marginBottom: "8px", color: "#333" }}>
                                                <strong>Company:</strong> {userData.profile.currentCompany || "N/A"}
                                            </p>
                                            {userData.profile.yearsOfExperience && (
                                                <p style={{ marginBottom: "8px", color: "#333" }}>
                                                    <strong>Years of Experience:</strong> {userData.profile.yearsOfExperience}
                                                </p>
                                            )}
                                            {userData.profile.jobDescription && (
                                                <div style={{ marginTop: "12px" }}>
                                                    <strong style={{ color: "#333" }}>Role Description:</strong>
                                                    <p style={{ 
                                                        color: "#555", 
                                                        marginTop: "8px",
                                                        lineHeight: "1.5"
                                                    }}>
                                                        {userData.profile.jobDescription}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ color: "#666" }}>No work experience information available</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}

export default ViewProfile;
