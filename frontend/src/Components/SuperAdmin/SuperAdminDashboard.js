import React from "react";
import { Card, Button } from "react-bootstrap";
import {
  FaBriefcase,
  FaClipboardList,
  FaBell,
  FaUserGraduate,
  FaCommentDots,
  FaCamera,
  FaUsers,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function SuperAdminDashboard() {
  const navigate = useNavigate();

  // Sections for SuperAdmin Dashboard
  const sections = [
    {
      id: 1,
      icon: <FaUsers size={40} />,
      title: "Manage Admins",
      description: "Create and manage admin accounts for colleges.",
      buttonText: "Manage Admins",
      path: "/superadmin/admins",
    },
    {
      id: 2,
      icon: <FaClipboardList size={40} />,
      title: "Manage Batches",
      description: "Manage student batches and applications.",
      buttonText: "Manage Batches",
      path: "/superadmin/batch",
    },
    {
      id: 3,
      icon: <FaUsers size={40} />,
      title: "All Users",
      description: "View and manage all users across all roles.",
      buttonText: "View All Users",
      path: "/superadmin/all-users",
    },
    {
      id: 4,
      icon: <FaUserGraduate size={40} />,
      title: "Manage Students",
      description: "Oversee all student accounts.",
      buttonText: "Manage Students",
      path: "/superadmin/users",
    },
    {
      id: 5,
      icon: <FaBriefcase size={40} />,
      title: "Manage Jobs",
      description: "Oversee all job postings.",
      buttonText: "Manage Jobs",
      path: "/superadmin/job",
    },
    {
      id: 6,
      icon: <FaCamera size={40} />,
      title: "Photo Gallery",
      description: "Manage the photo gallery.",
      buttonText: "Manage Gallery",
      path: "/superadmin/photo",
    },
    {
      id: 7,
      icon: <FaBell size={40} />,
      title: "Updates",
      description: "Post and manage system-wide updates.",
      buttonText: "Manage Updates",
      path: "/superadmin/updates",
    },
    {
      id: 8,
      icon: <FaCommentDots size={40} />,
      title: "Feedback",
      description: "Review all feedback from users.",
      buttonText: "View Feedback",
      path: "/superadmin/feedback",
    },
    {
      id: 9,
      icon: <FaSignOutAlt size={40} />,
      title: "Logout",
      description: "Sign out from super admin panel.",
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
        Super Admin Dashboard
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

export default SuperAdminDashboard;
