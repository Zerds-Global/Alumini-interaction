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
  FaSignOutAlt,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  // Sections for Placement Home
  const sections = [

    {
      id: 2,
      icon: <FaClipboardList size={40} />,
      title: "Manage Batch",
      description: "Manage the students batch.",
      buttonText: "Manage Batch",
      path: "/admin/batch",
    },
    {
      id: 3,
      icon: <FaUserGraduate size={40} />,
      title: "Students Management",
      description: "Manage Students accounts.",
      buttonText: "Manage Students",
      path: "/admin/users",
    },
    {
      id: 7,
      icon: <FaCommentDots size={40} />,
      title: "Feedback",
      description: "Review and respond to feedback from users.",
      buttonText: "Manage Feedback",
      path: "/admin/feedback",
    },
    {
      id: 4,
      icon: <FaBell size={40} />,
      title: "Updates",
      description: "Post and manage updates and notifications.",
      buttonText: "Manage Updates",
      path: "/admin/updates",
    },
    {
      id: 1,
      icon: <FaBriefcase size={40} />,
      title: "Manage Jobs",
      description: "Oversee job postings.",
      buttonText: "Manage Jobs",
      path: "/admin/job",
    },
    {
      id: 6,
      icon: <FaCamera size={40} />,
      title: "Photo Gallery",
      description: "Manage the photo gallery and upload new images.",
      buttonText: "Manage Gallery",
      path: "/admin/photo",
    },

  ];

  return (
    <div className="mt-4" style={{ marginLeft: "280px", maxWidth: "80%" }} id="main">
      <h2 className="text-center mb-4" style={{ color: "#4B0082", fontWeight: "bold" }}>
        Admin Dashboard
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
              onClick={() => navigate(section.path)}
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

export default Admin;