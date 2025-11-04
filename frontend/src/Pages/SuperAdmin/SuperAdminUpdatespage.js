import NavBar from "../../Components/Shared/Navbar";
import SuperAdminSidebar from "../../Components/SuperAdmin/Sidebar";
import UpdatesTable from "../../Components/SuperAdmin/UpdatesTable";
function SuperAdminUpdatespage() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <SuperAdminSidebar />

        {/* Page Content */}
        <div className="flex-grow-1 p-3">
          <UpdatesTable/>
        </div>
      </div>
    </div>
  );
}
export default SuperAdminUpdatespage;
