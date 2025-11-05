import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const UpdatesTable = () => {
    const [updates, setUpdates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch updates from API
    useEffect(() => {
        const token = localStorage.getItem("token");
        // Fetch from posts API with postType=update to get engagement data
        fetch("https://alumini-interaction.onrender.com/api/posts?postType=update", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const updatePosts = Array.isArray(data) ? data : [];
                // Also fetch original update data to get heading, description
                return fetch("https://alumini-interaction.onrender.com/api/updates", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                    .then((res) => res.json())
                    .then((updateData) => {
                        const updateMap = {};
                        (Array.isArray(updateData) ? updateData : []).forEach(update => {
                            updateMap[update._id] = update;
                        });
                        // Merge update details with post engagement data
                        const merged = updatePosts.map(post => ({
                            ...updateMap[post.referenceId],
                            ...post,
                            _id: post._id // Keep post ID for deletion
                        }));
                        setUpdates(merged);
                    });
            })
            .catch((error) => console.error("Error fetching update posts:", error));
    }, []);

    // Handle delete update
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this update post?")) {
            const token = localStorage.getItem("token");
            fetch(`https://alumini-interaction.onrender.com/api/posts/${id}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(() => {
                    setUpdates(updates.filter(update => update._id !== id));
                    alert("Update post deleted successfully");
                })
                .catch((error) => console.error("Error deleting update:", error));
        }
    };

    // Filter updates based on search term
    const filteredUpdates = updates.filter((update) =>
        (update.heading || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                Live Updates Posts - Admin View
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by heading..."
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
                        <th>Heading</th>
                        <th>Description</th>
                        <th>👍 Likes</th>
                        <th>💬 Comments</th>
                        <th>📤 Shares</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUpdates.length > 0 ? (
                        filteredUpdates.map((update, index) => (
                            <tr key={index}>
                                <td className="text-center">{update.heading || "N/A"}</td>
                                <td style={{maxWidth:"300px"}} className="text-center">{update.description || "N/A"}</td>
                                <td className="text-center"><strong>{Array.isArray(update.likes) ? update.likes.length : 0}</strong></td>
                                <td className="text-center"><strong>{Array.isArray(update.comments) ? update.comments.length : 0}</strong></td>
                                <td className="text-center"><strong>{update.shares || 0}</strong></td>
                                <td className="text-center">
                                    <Button
                                        className="text-white"
                                        style={{
                                            backgroundColor: "#ff4d4d",
                                            borderColor: "#ff4d4d",
                                        }}
                                        size="sm"
                                        onClick={() => handleDelete(update._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-danger">
                                No updates found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default UpdatesTable;
