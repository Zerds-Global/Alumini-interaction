import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Modal, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SuperAdminStudentList = () => {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        rollNumber: "",
        age: "",
        dob: "",
        address: "",
        phone: "",
        email: "",
        college: "",
        degree: "",
        batch: "",
        role: "student",
        department: "",
        workExperience: "",
        password: ""
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (batches.length > 0) {
            fetchStudents();
        }
    }, [batches]);

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/batches", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            setBatches(data.batches || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/users", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            let users = data.users || [];
            users = users.filter(u => u.role === 'student' || u.role === 'alumni');
            const currentDate = new Date();
            users = users.map(user => {
                const batch = batches.find(b => b.batchName === (user.profile ? user.profile.batch : ''));
                if (batch && new Date(batch.endDate) < currentDate && user.role === "student") {
                    updateRole(user._id, "alumni");
                    return { ...user, role: "alumni" };
                }
                return user;
            });
            setStudents(users);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const updateRole = async (id, role) => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://127.0.0.1:5000/api/users/${id}`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ role }),
            });
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const formatDob = (dob) => {
        if (!dob) return "";
        const [year, month, day] = dob.split('-');
        return `${day}${month}${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const url = editingStudent
                ? `http://127.0.0.1:5000/api/users/${editingStudent._id}`
                : "http://127.0.0.1:5000/api/users";
            const method = editingStudent ? "PUT" : "POST";

            let dataToSend = { ...formData };
            if (!editingStudent) {
                dataToSend.password = formatDob(formData.dob);
            } else {
                delete dataToSend.password;
            }

            const response = await fetch(url, {
                method,
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setShowModal(false);
                setEditingStudent(null);
                setFormData({
                    name: "",
                    rollNumber: "",
                    age: "",
                    dob: "",
                    address: "",
                    phone: "",
                    email: "",
                    college: "",
                    degree: "",
                    batch: "",
                    role: "student",
                    department: "",
                    workExperience: "",
                    password: ""
                });
                fetchStudents();
            } else {
                alert("Error saving student");
            }
        } catch (error) {
            console.error("Error saving student:", error);
        }
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name,
            rollNumber: student.profile ? student.profile.rollNumber : '',
            age: student.profile ? student.profile.age : '',
            dob: student.profile ? (student.profile.dob ? student.profile.dob.split('T')[0] : '') : '',
            address: student.profile ? student.profile.address : '',
            phone: student.profile ? student.profile.phone : '',
            email: student.email,
            college: student.profile ? student.profile.college : '',
            degree: student.profile ? student.profile.degree : '',
            batch: student.profile ? student.profile.batch : '',
            role: student.role,
            department: student.department,
            workExperience: student.profile ? student.profile.workExperience : '',
            password: ""
        });
        setEditingStudent(student);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://127.0.0.1:5000/api/users/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                if (response.ok) {
                    fetchStudents();
                } else {
                    alert("Error deleting student");
                }
            } catch (error) {
                console.error("Error deleting student:", error);
            }
        }
    };

    const handleAdd = () => {
        setFormData({
            name: "",
            rollNumber: "",
            age: "",
            dob: "",
            address: "",
            phone: "",
            email: "",
            college: "",
            degree: "",
            batch: "",
            role: "student",
            department: "",
            workExperience: "",
            password: ""
        });
        setEditingStudent(null);
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                Student/Alumni Management - SuperAdmin View
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: "400px", borderColor: "#008080" }}
                />
                <Button
                    style={{ backgroundColor: "#008080", borderColor: "#008080" }}
                    onClick={handleAdd}
                >
                    + Add User
                </Button>
            </div>
            <Table striped bordered hover responsive className="shadow-sm rounded">
                <thead
                    className="text-center"
                    style={{ backgroundColor: "#008080", color: "white" }}
                >
                    <tr>
                        <th>Name</th>
                        <th>Roll Number</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Batch</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <tr key={student._id}>
                                <td className="text-center">{student.name}</td>
                                <td className="text-center">{student.profile ? student.profile.rollNumber : ''}</td>
                                <td className="text-center">{student.email}</td>
                                <td className="text-center">{student.collegeId?.name || 'N/A'}</td>
                                <td className="text-center">{student.profile ? student.profile.batch : ''}</td>
                                <td className="text-center">{student.role}</td>
                                <td className="text-center">{student.department}</td>
                                <td className="text-center">
                                    <Button
                                        className="me-2 text-white"
                                        style={{
                                            backgroundColor: "#008080",
                                            borderColor: "#008080",
                                        }}
                                        size="sm"
                                        onClick={() => handleEdit(student)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className="text-white"
                                        style={{
                                            backgroundColor: "#ff4d4d",
                                            borderColor: "#ff4d4d",
                                        }}
                                        size="sm"
                                        onClick={() => handleDelete(student._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center text-danger">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingStudent ? "Edit User" : "Add User"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Roll Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Age</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Control
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current College Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="college"
                                        value={formData.college}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Degree</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Batch</Form.Label>
                            <Form.Control
                                as="select"
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Batch</option>
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch.batchName}>{batch.batchName}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Button
                            className="w-100"
                            style={{ backgroundColor: "#008080", borderColor: "#008080" }}
                            type="submit"
                        >
                            {editingStudent ? "Update" : "Add"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default SuperAdminStudentList;
