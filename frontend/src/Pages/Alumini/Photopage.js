import Photo from "../../Components/Alumini/Photo";
import NavBar from "../../Components/Shared/Navbar";
import Sidebar from "../../Components/Alumini/Sidebar";
function Photopage() {
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
          <Photo/>
        </div>
      </div>
    </div>
  );
}
export default Photopage;
