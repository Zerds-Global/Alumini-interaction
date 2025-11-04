import NavBar from "../../Components/Shared/Navbar";
import FeedbackTable from "../../Components/Admin/FeedbackTable";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
function AdminFeedback() {
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
          <FeedbackTable/>
        </div>
      </div>
    </div>
  );
}
export default AdminFeedback;
