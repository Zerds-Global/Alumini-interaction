import NavBar from "../../Components/Shared/Navbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import BatchTable from "../../Components/Admin/BatchTable";
function AdminBatchpage() {
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
          <BatchTable/>
        </div>
      </div>
    </div>
  );
}
export default AdminBatchpage;
