import React from "react";
import { Link } from "react-router-dom";
import { Nav } from "react-bootstrap";
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiBell,
  FiLogOut,
} from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";


function StudentSidebar() {

  // Mock user data (replace with actual user data)
  const user = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
  };
  if(!user.name && !user.email){
    window.location.href = "/";
  }


  // Get the first letter of the name for the avatar
  const avatarLetter = user.name.charAt(0).toUpperCase();

  return (
    <div
      className="d-flex flex-column vh-100"
      id="sidebar"
      style={{
        width: "250px",
        transition: "width 0.3s ease-in-out",
        backgroundColor: "#fff",
        color: "#333",
        borderRight: "1px solid #eee",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        left: "0",
        zIndex: "20",
        borderRadius: "0 20px 20px 0", // Rounded edges on the right
      }}
    >
      {/* Profile Card */}
      <div
        className="text-center p-4"
        style={{
          borderBottom: "1px solid #eee",
          backgroundColor: "#f9f9f9",
          borderRadius: "0 20px 0 0", // Rounded top-right corner
          marginTop:"100px"
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#008080", // Teal color
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "0 auto 10px auto",
          }}
        >
          {avatarLetter}
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "10px" }}>
          {user.name}
        </div>
        <div style={{ fontSize: "0.9rem", color: "#666" }}>{user.email}</div>
      </div>

      {/* Sidebar Navigation */}
      <Nav className="flex-column p-3 mt-3">
        {[
          { to: "/student/dash", icon: <FiHome />, label: "Dashboard" },
          { to: "/student/apply-job", icon: <FiBriefcase />, label: "Apply Job" },
          { to: "/student/photo-gallery", icon: <FiUsers />, label: "Photos" },
          { to: "/student/live-updates", icon: <FiBell />, label: "Updates" },
          { to: "/student/feedback", icon: <FiUsers />, label: "Feedback" },
        ].map((item, index) => (
          <Nav.Item key={index} style={{ padding: "8px 0" }}>
            <Link
              to={item.to}
              className="nav-link d-flex align-items-center mb-3"
              style={{
                color: "#333",
                fontSize: "1.1rem",
                borderRadius: "10px",
                padding: "10px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f0f0f0";
                e.target.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateX(0)";
              }}
            >
              {item.icon}{" "}
              <span id="navtext" className="ms-3">
                {item.label}
              </span>
            </Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
}

export default StudentSidebar;