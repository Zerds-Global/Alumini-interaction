import NavBar from "../../Components/Shared/Navbar";
import SuperAdminSidebar from "../../Components/SuperAdmin/Sidebar";
import StudentTable from "../../Components/SuperAdmin/StudentTable";
function SuperAdminStudentpage() {
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
          <StudentTable/>
        </div>
      </div>
    </div>
  );
}
export default SuperAdminStudentpage;
