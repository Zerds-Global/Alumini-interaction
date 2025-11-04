import AdminSidebar from "../../Components/Admin/AdminSidebar";
import ImageTable from "../../Components/Admin/ImageTable";
import NavBar from "../../Components/Shared/Navbar";
function AdminPhotopage() {
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
          <ImageTable/>
        </div>
      </div>
    </div>
  );
}
export default AdminPhotopage;
