import NavBar from "../../Components/Shared/Navbar";
import FeedbackTable from "../../Components/SuperAdmin/FeedbackTable";
import SuperAdminSidebar from "../../Components/SuperAdmin/Sidebar";
function SuperAdminFeedbackpage() {
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
          <FeedbackTable/>
        </div>
      </div>
    </div>
  );
}
export default SuperAdminFeedbackpage;
