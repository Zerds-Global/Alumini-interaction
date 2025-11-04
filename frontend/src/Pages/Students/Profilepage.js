import NavBar from "../../Components/Shared/Navbar";
import ProfileUpdate from "../../Components/Alumini/Profile";
import Sidebar from "../../Components/Alumini/Sidebar";
import StudentsProfile from "../../Components/Students/Profile";
import StudentSidebar from "../../Components/Students/Sidebar";

function Profilepage() {
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
          <StudentsProfile />
        </div>
      </div>
    </div>
  );
}

export default Profilepage;
