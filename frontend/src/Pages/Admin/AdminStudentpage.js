import AdminSidebar from "../../Components/Admin/AdminSidebar";
import NavBar from "../../Components/Shared/Navbar";
import StudentTable from "../../Components/Admin/StudentTable";
function AdminStudentpage() {
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
          <StudentTable/>
        </div>
      </div>
    </div>
  );
}
export default AdminStudentpage;
