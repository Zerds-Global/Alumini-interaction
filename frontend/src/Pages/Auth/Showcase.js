import React from "react";
import NavBar from "../../Components/Shared/Navbar";

function showcase() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Page Content */}
        <div className="flex-grow-1 p-3">
          <div className="text-center">
            <h1>Welcome to Placement Management System</h1>
            <p>Your gateway to career opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default showcase;
