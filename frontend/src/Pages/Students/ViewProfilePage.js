import NavBar from "../../Components/Shared/Navbar";
import ViewProfile from "../../Components/Students/ViewProfile";
import StudentSidebar from "../../Components/Students/Sidebar";

function ViewProfilePage() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <StudentSidebar />

        {/* Page Content */}
        <div className="flex-grow-1 p-3">
          <ViewProfile />
        </div>
      </div>
    </div>
  );
}

export default ViewProfilePage;