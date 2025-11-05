import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminTable = () => {
    const [admins, setAdmins] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    
    const initialFormState = {
        collegeName: "",
        collegeAddress: "",
        collegeCity: "",
        collegeState: "",
        collegePincode: "",
        collegePhone: "",
        collegeEmail: "",
        collegeWebsite: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
    };
    
    const [formData, setFormData] = useState(initialFormState);

    // Fetch colleges and admins from API
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://render.com/docs/web-services#port-binding/api/colleges", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setColleges(Array.isArray(data.colleges) ? data.colleges : []);
            })
            .catch((error) => console.error("Error fetching colleges:", error));
    }, []);

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle add college with admin
    const handleAddAdmin = async (e) => {
        e.preventDefault();

        if (!formData.collegeName || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
            alert("Please fill in all required fields (College name, Admin name, Admin email, Admin password)");
            return;
        }

        const collegeData = {
            collegeName: formData.collegeName,
            address: formData.collegeAddress,
            city: formData.collegeCity,
            state: formData.collegeState,
            pincode: formData.collegePincode,
            phone: formData.collegePhone,
            email: formData.collegeEmail,
            website: formData.collegeWebsite,
            adminName: formData.adminName,
            adminEmail: formData.adminEmail,
            adminPassword: formData.adminPassword,
        };

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://render.com/docs/web-services#port-binding/api/colleges", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(collegeData),
            });

            if (response.ok) {
                alert("College and Admin created successfully!");
                setFormData(initialFormState);
                setShowModal(false);
                // Refresh the list
                window.location.reload();
            } else {
                const error = await response.json();
                alert("Error: " + (error.message || "Failed to create college"));
            }
        } catch (error) {
            console.error("Error creating college:", error);
            alert("Something went wrong");
        }
    };

    // Handle delete college and admin
    const handleDelete = (collegeId, adminId) => {
        if (window.confirm("Are you sure you want to delete this college and its admin? This action cannot be undone.")) {
            const token = localStorage.getItem("token");
            fetch(`https://render.com/docs/web-services#port-binding/api/colleges/${collegeId}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(() => {
                    setColleges(colleges.filter(college => college._id !== collegeId));
                    alert("College and admin deleted successfully");
                })
                .catch((error) => console.error("Error deleting college:", error));
        }
    };

    // Filter colleges based on search term
    const filteredColleges = colleges.filter((college) =>
        (college.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (college.adminId?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container
            id="main"
            style={{
                marginLeft: "300px",
                marginRight: "auto",
                maxWidth: "1150px",
                marginTop: "100px",
            }}
        >
            <h2
                className="text-center mb-4"
                style={{ color: "#008080", fontWeight: "bold" }}
            >
                Manage Colleges & Admins - SuperAdmin View
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by college name or admin email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: "400px", borderColor: "#008080" }}
                />
                <Button
                    style={{
                        backgroundColor: "#008080",
                        borderColor: "#008080",
                    }}
                    onClick={() => {
                        setFormData(initialFormState);
                        setShowModal(true);
                    }}
                >
                    + Add College & Admin
                </Button>
            </div>

            {/* Add College & Admin Modal */}
            <Modal 
                show={showModal} 
                onHide={() => {
                    setShowModal(false);
                    setFormData(initialFormState);
                }} 
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Create New College & Admin Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddAdmin} autoComplete="off">
                        <h5 style={{ color: "#008080", marginBottom: "15px" }}>College Details</h5>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>College Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="collegeName"
                                placeholder="Enter college name"
                                value={formData.collegeName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="collegeAddress"
                                placeholder="Enter college address"
                                value={formData.collegeAddress}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="collegeCity"
                                        placeholder="Enter city"
                                        value={formData.collegeCity}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="collegeState"
                                        placeholder="Enter state"
                                        value={formData.collegeState}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Pincode</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="collegePincode"
                                        placeholder="Enter pincode"
                                        value={formData.collegePincode}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="collegePhone"
                                        placeholder="Enter phone number"
                                        value={formData.collegePhone}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>College Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="collegeEmail"
                                placeholder="Enter college email"
                                value={formData.collegeEmail}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </Form.Group>
                    </div>
                    <div className="col-md-6">
                        <Form.Group className="mb-3">
                            <Form.Label>Website</Form.Label>
                            <Form.Control
                                type="text"
                                name="collegeWebsite"
                                placeholder="Enter website URL"
                                value={formData.collegeWebsite}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </div>
                </div>                        <hr style={{ color: "#008080" }} />

                        <h5 style={{ color: "#008080", marginBottom: "15px" }}>Admin Account Details</h5>

                        <Form.Group className="mb-3">
                            <Form.Label>Admin Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="adminName"
                                placeholder="Enter admin name"
                                value={formData.adminName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Admin Email *</Form.Label>
                            <Form.Control
                                type="email"
                                name="adminEmail"
                                placeholder="Enter admin email"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Admin Password *</Form.Label>
                            <Form.Control
                                type="password"
                                name="adminPassword"
                                placeholder="Enter admin password"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </Form.Group>

                        <Button
                            variant="success"
                            type="submit"
                            className="w-100"
                        >
                            Create College & Admin
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className="shadow-sm rounded">
                <thead
                    className="text-center"
                    style={{ backgroundColor: "#008080", color: "white" }}
                >
                    <tr>
                        <th>College Name</th>
                        <th>Admin Name</th>
                        <th>Admin Email</th>
                        <th>City</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredColleges.length > 0 ? (
                        filteredColleges.map((college, index) => (
                            <tr key={index}>
                                <td className="text-center">{college.name || "N/A"}</td>
                                <td className="text-center">{college.adminId?.name || "N/A"}</td>
                                <td className="text-center">{college.adminId?.email || "N/A"}</td>
                                <td className="text-center">{college.city || "N/A"}</td>
                                <td className="text-center">{college.phone || "N/A"}</td>
                                <td className="text-center">
                                    <Button
                                        className="text-white"
                                        style={{
                                            backgroundColor: "#ff4d4d",
                                            borderColor: "#ff4d4d",
                                        }}
                                        size="sm"
                                        onClick={() => handleDelete(college._id, college.adminId?._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-danger">
                                No colleges found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminTable;
