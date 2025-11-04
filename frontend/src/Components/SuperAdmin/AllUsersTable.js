import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Badge, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const AllUsersTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:5000/api/users", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, userName) => {
        if (window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
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
                    fetchAllUsers();
                    alert("User deleted successfully");
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Error deleting user");
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Network error. Please try again.");
            }
        }
    };

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'superadmin': return 'danger';
            case 'admin': return 'primary';
            case 'alumni': return 'success';
            case 'student': return 'info';
            default: return 'secondary';
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleStats = {
        all: users.length,
        superadmin: users.filter(u => u.role === 'superadmin').length,
        admin: users.filter(u => u.role === 'admin').length,
        alumni: users.filter(u => u.role === 'alumni').length,
        student: users.filter(u => u.role === 'student').length,
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading users...</p>
            </Container>
        );
    }

    return (
        <Container
            id="main"
            style={{
                marginLeft: "300px",
                marginRight: "auto",
                maxWidth: "1200px",
                marginTop: "100px",
            }}
        >
            <h2
                className="text-center mb-4"
                style={{ color: "#008080", fontWeight: "bold" }}
            >
                All Users Management - SuperAdmin
            </h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-md-2">
                    <div className="card text-center" style={{ backgroundColor: "#f0f0f0" }}>
                        <div className="card-body">
                            <h5 className="card-title">All Users</h5>
                            <h2 className="text-primary">{roleStats.all}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card text-center" style={{ backgroundColor: "#ffe6e6" }}>
                        <div className="card-body">
                            <h6 className="card-title">SuperAdmins</h6>
                            <h3 className="text-danger">{roleStats.superadmin}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card text-center" style={{ backgroundColor: "#e6f2ff" }}>
                        <div className="card-body">
                            <h6 className="card-title">Admins</h6>
                            <h3 className="text-primary">{roleStats.admin}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card text-center" style={{ backgroundColor: "#e6ffe6" }}>
                        <div className="card-body">
                            <h6 className="card-title">Alumni</h6>
                            <h3 className="text-success">{roleStats.alumni}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card text-center" style={{ backgroundColor: "#e6f7ff" }}>
                        <div className="card-body">
                            <h6 className="card-title">Students</h6>
                            <h3 className="text-info">{roleStats.student}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by name, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: "400px", borderColor: "#008080" }}
                />
                <div className="d-flex gap-2">
                    <Form.Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ maxWidth: "200px", borderColor: "#008080" }}
                    >
                        <option value="all">All Roles ({roleStats.all})</option>
                        <option value="superadmin">SuperAdmin ({roleStats.superadmin})</option>
                        <option value="admin">Admin ({roleStats.admin})</option>
                        <option value="alumni">Alumni ({roleStats.alumni})</option>
                        <option value="student">Student ({roleStats.student})</option>
                    </Form.Select>
                    <Button
                        style={{ backgroundColor: "#008080", borderColor: "#008080" }}
                        onClick={fetchAllUsers}
                    >
                        🔄 Refresh
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <Table striped bordered hover responsive className="shadow-sm rounded">
                <thead
                    className="text-center"
                    style={{ backgroundColor: "#008080", color: "white" }}
                >
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>College</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <tr key={user._id}>
                                <td className="text-center">{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className="text-center">
                                    <Badge bg={getRoleBadgeColor(user.role)}>
                                        {user.role.toUpperCase()}
                                    </Badge>
                                </td>
                                <td>{user.department}</td>
                                <td className="text-center">
                                    {user.collegeId ? (
                                        typeof user.collegeId === 'object' 
                                            ? user.collegeId.name 
                                            : 'Assigned'
                                    ) : (
                                        <span className="text-muted">Not assigned</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="text-center">
                                    {user.role !== 'superadmin' && (
                                        <Button
                                            className="text-white"
                                            style={{
                                                backgroundColor: "#ff4d4d",
                                                borderColor: "#ff4d4d",
                                            }}
                                            size="sm"
                                            onClick={() => handleDelete(user._id, user.name)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                    {user.role === 'superadmin' && (
                                        <Badge bg="secondary">Protected</Badge>
                                    )}
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

            {/* Summary Footer */}
            <div className="alert alert-info mt-3" role="alert">
                <strong>Showing:</strong> {filteredUsers.length} of {users.length} total users
            </div>
        </Container>
    );
};

export default AllUsersTable;
