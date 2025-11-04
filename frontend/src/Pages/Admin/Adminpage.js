import NavBar from "../../Components/Shared/Navbar";
import Admin from "../../Components/Admin/AdminDashboard";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
function Adminpage() {
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
          <Admin/>
        </div>
      </div>
    </div>
  );
}
export default Adminpage;
