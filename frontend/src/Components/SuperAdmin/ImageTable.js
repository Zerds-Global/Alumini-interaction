import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function SuperAdminImageTable() {
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Fetch from posts API with postType=photo to get engagement data
    fetch("https://render.com/docs/web-services#port-binding/api/posts?postType=photo", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        const photoPosts = Array.isArray(data) ? data : [];
        // Map post data directly - image is already in the post
        const mapped = photoPosts.map(post => ({
          _id: post._id,
          heading: post.heading || "N/A",
          description: post.description || "N/A",
          image: post.image || "", // Already in correct format from posts API
          likes: Array.isArray(post.likes) ? post.likes : [],
          comments: Array.isArray(post.comments) ? post.comments : [],
          shares: post.shares || 0,
          referenceId: post.referenceId,
          postedBy: post.postedBy,
          postedDate: post.createdAt,
          collegeId: post.collegeId
        }));
        setImages(mapped);
      })
      .catch((error) => console.error("Error fetching photo posts:", error));
  }, []);

  const filteredImages = images.filter((image) =>
    (image.heading || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this photo post?")) {
      const token = localStorage.getItem("token");
      fetch(`https://render.com/docs/web-services#port-binding/api/posts/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
        .then(() => {
          setImages(images.filter(img => img._id !== id));
          alert("Photo post deleted successfully");
        })
        .catch((error) => console.error("Error deleting photo:", error));
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
        Photo Posts - SuperAdmin View
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
            <th>Image</th>
            <th>Heading</th>
            <th>College</th>
            <th>Description</th>
            <th>👍 Likes</th>
            <th>💬 Comments</th>
            <th>📤 Shares</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredImages.length > 0 ? (
            filteredImages.map((image, index) => (
              <tr key={index}>
                <td className="text-center">
                  <img
                    src={image.image ? (image.image.startsWith('data:') ? image.image : (image.image.startsWith('/uploads/') ? `https://render.com/docs/web-services#port-binding${image.image}` : `data:image/png;base64,${image.image}`)) : "/placeholder.png"}
                    alt={image.heading || "photo"}
                    className="rounded shadow-sm"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                </td>
                <td className="text-center">{image.heading || "N/A"}</td>
                <td className="text-center">{image.collegeId?.name || 'N/A'}</td>
                <td className="text-center">{image.description || "N/A"}</td>
                <td className="text-center"><strong>{image.likes.length || 0}</strong></td>
                <td className="text-center"><strong>{image.comments.length || 0}</strong></td>
                <td className="text-center"><strong>{image.shares || 0}</strong></td>
                <td className="text-center">
                <Button
                    className="text-white"
                    style={{ backgroundColor: "#ff4d4d", borderColor: "#ff4d4d" }}
                    size="sm"
                    onClick={() => handleDelete(image._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-danger">
                No images found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default SuperAdminImageTable;
