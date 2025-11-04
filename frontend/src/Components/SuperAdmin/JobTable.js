import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SuperAdminJobTable = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch jobs from API
    useEffect(() => {
        const token = localStorage.getItem("token");
        // Fetch from posts API with postType=job to get engagement data
        fetch("http://127.0.0.1:5000/api/posts?postType=job", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const jobPosts = Array.isArray(data) ? data : [];
                // Also fetch original job data to get title, description, etc.
                return fetch("http://127.0.0.1:5000/api/jobs", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                    .then((res) => res.json())
                    .then((jobsData) => {
                        const jobsMap = {};
                        (Array.isArray(jobsData) ? jobsData : []).forEach(job => {
                            jobsMap[job._id] = job;
                        });
                        // Merge job details with post engagement data
                        const merged = jobPosts.map(post => ({
                            ...jobsMap[post.referenceId],
                            ...post,
                            _id: post._id // Keep post ID for deletion
                        }));
                        setJobs(merged);
                    });
            })
            .catch((error) => console.error("Error fetching job posts:", error));
    }, []);

    // Handle delete job
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this job post?")) {
            const token = localStorage.getItem("token");
            fetch(`http://127.0.0.1:5000/api/posts/${id}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(() => {
                    setJobs(jobs.filter(job => job._id !== id));
                    alert("Job post deleted successfully");
                })
                .catch((error) => console.error("Error deleting job:", error));
        }
    };

    // Filter jobs based on search term
    const filteredJobs = jobs.filter((job) =>
        (job.title || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                Job Posts - SuperAdmin View
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search by title..."
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
                        <th>Job ID</th>
                        <th>Title</th>
                        <th>College</th>
                        <th>Description</th>
                        <th>Eligibility</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>👍 Likes</th>
                        <th>💬 Comments</th>
                        <th>📤 Shares</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                            <tr key={index}>
                                <td style={{maxWidth:"250px"}} className="text-center">{job._id}</td>
                                <td className="text-center">{job.title || "N/A"}</td>
                                <td className="text-center">{job.collegeId?.name || 'N/A'}</td>
                                <td style={{maxWidth:"300px"}} className="text-center">{job.description || "N/A"}</td>
                                <td style={{maxWidth:"300px"}} className="text-center">{job.eligibility || "N/A"}</td>
                                <td className="text-center">{job.location || "N/A"}</td>
                                <td className="text-center">{job.type || "N/A"}</td>
                                <td className="text-center"><strong>{Array.isArray(job.likes) ? job.likes.length : 0}</strong></td>
                                <td className="text-center"><strong>{Array.isArray(job.comments) ? job.comments.length : 0}</strong></td>
                                <td className="text-center"><strong>{job.shares || 0}</strong></td>
                                <td className="text-center">
                                    <Button
                                        className="text-white"
                                        style={{
                                            backgroundColor: "#ff4d4d",
                                            borderColor: "#ff4d4d",
                                        }}
                                        size="sm"
                                        onClick={() => handleDelete(job._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="11" className="text-center text-danger">
                                No jobs found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default SuperAdminJobTable;
