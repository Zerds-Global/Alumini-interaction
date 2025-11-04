import Photo from "../../Components/Alumini/Photo";
import NavBar from "../../Components/Shared/Navbar";
import Sidebar from "../../Components/Alumini/Sidebar";
import StudentSidebar from "../../Components/Students/Sidebar";
import StudentsPhotoPost from "../../Components/Students/Photo";
function Photopage() {
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
          <StudentsPhotoPost/>
        </div>
      </div>
    </div>
  );
}
export default Photopage;
