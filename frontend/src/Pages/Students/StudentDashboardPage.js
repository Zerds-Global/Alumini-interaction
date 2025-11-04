import Sidebar from "../../Components/Alumini/Sidebar";
import NavBar from "../../Components/Shared/Navbar";
import StudentDashboard from "../../Components/Students/StudentDashboard";

function StudentDashboardPage() {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content - 3x3 Cards */}
        <div className="flex-grow-1 p-3">
          <StudentDashboard/>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
