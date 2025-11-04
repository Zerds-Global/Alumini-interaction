import LiveUpdates from "../../Components/Alumini/LiveUpdates";
import NavBar from "../../Components/Shared/Navbar";
import Sidebar from "../../Components/Alumini/Sidebar";
import StudentSidebar from "../../Components/Students/Sidebar";
import StudentsLiveUpdates from "../../Components/Students/LiveUpdates";


function LiveUpdatesPage() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <StudentSidebar />

        {/* Page Content - 3x3 Cards */}
        <div className="flex-grow-1 p-3">
          <StudentsLiveUpdates />
        </div>
      </div>
    </div>
  );
}

export default LiveUpdatesPage;
