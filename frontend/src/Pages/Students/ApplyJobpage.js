import Job from "../../Components/Alumini/ApplyJob";
import NavBar from "../../Components/Shared/Navbar";
import StudentsJobPosts from "../../Components/Students/ApplyJob";
import StudentSidebar from "../../Components/Students/Sidebar";
function Jobpage() {
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
          <StudentsJobPosts/>
        </div>
      </div>
    </div>
  );
}
export default Jobpage;
