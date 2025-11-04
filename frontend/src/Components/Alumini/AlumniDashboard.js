import React from "react";
import { Card, Button } from "react-bootstrap";
import {
  FaBriefcase,
  FaClipboardList,
  FaChartLine,
  FaBell,
  FaUserGraduate,
  FaCommentDots,
  FaCamera,
  FaBook,
  FaDownload,
  FaSignOutAlt,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function PlacementHome() {
  const navigate = useNavigate();
  const resume = localStorage.getItem("resume");

  // Sections for Alumni Dashboard
  const sections = [
    {
      id: 1,
      icon: <FaBriefcase size={40} />,
      title: "Manage Job",
      description: "Browse and apply for the latest job openings tailored for you.",
      buttonText: "Manage",
      path: "/alumini/apply-job",
    },
    {
      id: 2,
      icon: <FaBell size={40} />,
      title: "Live Updates",
      description: "Stay updated with the latest announcements and notifications.",
      buttonText: "Manage",
      path: "/alumini/live-updates",
    },
    {
      id: 3,
      icon: <FaCamera size={40} />,
      title: "Photo Gallery",
      description: "Explore our photo gallery showcasing various events and moments.",
      buttonText: "Manage",
      path: "/alumini/photo-gallery",
    },
    {
      id: 4,
      icon: <FaBook size={40} />,
      title: "Update Profile",
      description: "Keep your profile up-to-date with the latest information.",
      buttonText: "Update Now",
      path: "/alumini/update-profile",
    },
    {
      id: 5,
      icon: <FaCommentDots size={40} />,
      title: "Feedback",
      description: "Share your feedback to help us improve our services.",
      buttonText: "Give Feedback",
      path: "/alumini/feedback",
    },
    {
      id: 6,
      icon: <FaSignOutAlt size={40} />,
      title: "Logout",
      description: "Sign out from your account.",
      buttonText: "Logout",
      path: "/login",
      isLogout: true,
    },
  ];

  return (
    <div
      className="mt-4"
      style={{ marginLeft: "280px", maxWidth: "80%" }}
      id="main"
    >
      <h2
        className="text-center mb-4"
        style={{ color: "#4B0082", fontWeight: "bold" }}
      >
        Alumni Dashboard
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
        }}
      >
        {sections.map((section) => (
          <Card
            key={section.id}
            style={{
              borderRadius: "15px",
              textAlign: "center",
              padding: "25px",
              minHeight: "250px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Card.Body>
              <div style={{ color: "#008080", marginBottom: "20px" }}>
                {section.icon}
              </div>
              <Card.Title style={{ fontSize: "22px", fontWeight: "bold" }}>
                {section.title}
              </Card.Title>
              <Card.Text style={{ fontSize: "16px", color: "#333", margin: "15px 0" }}>
                {section.description}
              </Card.Text>
            </Card.Body>
            <Button
              variant="primary"
              onClick={() => {
                if (section.isLogout) {
                  localStorage.clear();
                }
                navigate(section.path);
              }}
              style={{
                backgroundColor: "#008080",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              {section.buttonText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PlacementHome;
