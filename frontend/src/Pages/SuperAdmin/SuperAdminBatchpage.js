import NavBar from "../../Components/Shared/Navbar";
import BatchTable from "../../Components/SuperAdmin/BatchTable";
import SuperAdminSidebar from "../../Components/SuperAdmin/Sidebar";
function SuperAdminBatchpage() {
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
          <BatchTable/>
        </div>
      </div>
    </div>
  );
}
export default SuperAdminBatchpage;
