import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/");
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ position: "fixed", top: "0", zIndex: "200", width: "100%" }}>
      <Navbar
        expand="lg"
        className="px-4 shadow-sm d-flex justify-content-between align-items-center"
        style={{
          height: "90px",
          background: "#008080", // Teal color
          color: "#fff",
        }}
      >
        {/* App Name or Logo */}
        <div
          className="text-white"
          style={{ fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px" }}
        >
          Alumni Management
        </div>


        {/* Logout Button */}
        <Button
          variant="link"
          onClick={handleLogout}
          className="text-white d-flex align-items-center"
          style={{ textDecoration: "none" }}
        >
          <FaSignOutAlt size={20} className="me-2" />
          <span style={{ fontSize: "1rem" }}>Logout</span>
        </Button>
      </Navbar>
    </div>
  );
}

export default NavBar;