import NavBar from "../../Components/Shared/Navbar";
import Sidebar from "../../Components/Alumini/Sidebar";
import PlacementHome from "../../Components/Alumini/AlumniDashboard";

function Home() {
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
          <PlacementHome />
        </div>
      </div>
    </div>
  );
}

export default Home;
