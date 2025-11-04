import AdminSidebar from "../../Components/Admin/AdminSidebar";
import NavBar from "../../Components/Shared/Navbar";
import UpdatesTable from "../../Components/Admin/UpdatesTable";
function AdminUpdatespage() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Page Content - 3x3 Cards */}
        <div className="flex-grow-1 p-3">
          <UpdatesTable/>
        </div>
      </div>
    </div>
  );
}
export default AdminUpdatespage;
