import NavBar from "../../Components/Shared/Navbar";
import ProfileUpdate from "../../Components/Alumini/Profile";
import Sidebar from "../../Components/Alumini/Sidebar";

function Profilepage() {
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
          <ProfileUpdate />
        </div>
      </div>
    </div>
  );
}

export default Profilepage;
