import NavBar from "../../Components/Shared/Navbar";
import SuperAdminSidebar from "../../Components/SuperAdmin/Sidebar";
import SuperAdminDashboard from "../../Components/SuperAdmin/SuperAdminDashboard";

function SuperAdminDashboardPage() {

  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <SuperAdminSidebar/>

        {/* Page Content - 3x3 Cards */}
        <div className="flex-grow-1 p-3">
          <SuperAdminDashboard/>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboardPage;
