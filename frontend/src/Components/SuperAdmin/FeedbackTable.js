import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function FeedbackTable() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://127.0.0.1:5000/api/feedback", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => response.json())
            .then((data) => setFeedbacks(data))
            .catch((error) => console.error("Error fetching feedbacks:", error));
    }, []);

    const filteredFeedbacks = feedbacks.filter((feedback) =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            const token = localStorage.getItem("token");
            fetch(`http://127.0.0.1:5000/api/feedback/${id}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(() => setFeedbacks(feedbacks.filter((feedback) => feedback.id !== id)))
                .then(() => window.location.reload())
                .catch((error) => console.error("Error deleting feedback:", error));
        }
    };

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
                SuperAdmin Feedback Table
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: "400px", borderColor: "#008080" }}
                />
            </div>
            <Table striped bordered hover responsive className="shadow-sm rounded">
                <thead
                    className="text-center"
                    style={{ backgroundColor: "#008080", color: "white" }}
                >
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Department</th>
                        <th>Message</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFeedbacks.length > 0 ? (
                        filteredFeedbacks.map((feedback, index) => (
                            <tr key={index}>
                                <td className="text-center">{feedback.name}</td>
                                <td className="text-center">{feedback.email}</td>
                                <td className="text-center">{feedback.collegeId?.name || 'N/A'}</td>
                                <td className="text-center">{feedback.department}</td>
                                <td className="text-center">{feedback.message}</td>
                                <td className="text-center">
                                    <Button
                                        className="text-white"
                                        style={{ backgroundColor: "#ff4d4d", borderColor: "#ff4d4d" }}
                                        size="sm"
                                        onClick={() => handleDelete(feedback._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-danger">
                                No feedbacks found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
}

export default FeedbackTable;
