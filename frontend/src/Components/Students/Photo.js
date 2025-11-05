 import React, { useEffect, useState } from "react";
import { Container, Card, Button, Modal, Form } from "react-bootstrap";
import { FaThumbsUp, FaComment, FaShare, FaCamera, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Add custom styles
const customStyles = `
  .photo-card {
    transition: all 0.3s ease;
  }
  
  .photo-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,128,128,0.15) !important;
  }
  
  .photo-image {
    transition: all 0.3s ease;
  }
  
  .photo-card:hover .photo-image {
    opacity: 0.95;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #008080;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #006666;
  }
`;

function StudentsPhotoPost() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [photoFormData, setPhotoFormData] = useState({
    heading: "",
    description: "",
    image: null
  });
  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPhotoForComment, setSelectedPhotoForComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Add function to handle profile click
  const handleProfileClick = (userId) => {
    navigate(`/student/view-profile/${userId}`);
  };

  useEffect(() => {
    // Load photo posts dynamically from backend
    const token = localStorage.getItem("token");
    fetch("https://alumini-interaction.onrender.com/api/posts?postType=photo&populate=postedBy", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        const posts = (Array.isArray(data) ? data : []).map((p) => ({
          id: p._id,
          heading: p.heading,
          description: p.description,
          image: p.image ? (p.image.startsWith('/uploads/') ? `https://alumini-interaction.onrender.com${p.image}` : p.image) : "",
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          likedBy: Array.isArray(p.likes) ? p.likes : [],
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          shares: p.shares || 0,
          views: 0,
          postedBy: p.postedBy || 'User',
          postedById: p.postedById || null,
          postedDate: new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          commentsList: Array.isArray(p.comments) ? p.comments.map((c, idx) => ({ id: idx + 1, author: c.userId?.name || c.userId || 'User', text: c.text, timestamp: new Date(c.createdAt).toLocaleString() })) : [],
        }));
        setPhotos(posts);
      })
      .catch((error) => console.error("Error fetching photo posts:", error));
  }, []);

  const handleLike = async (photoId) => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('name') || 'guest';
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://alumini-interaction.onrender.com/api/posts/${photoId}/like`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setPhotos(photos.map(p => p.id === photoId ? { ...p, likes: data.likes } : p));
    } catch (e) { console.error(e); }
  };

  const handleComment = (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    setSelectedPhotoForComment(photo);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCommentText("");
    setSelectedPhotoForComment(null);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPhotoForComment) return;
    const userId = localStorage.getItem('id') || localStorage.getItem('userId');
    const userName = localStorage.getItem('name') || 'User';
    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://alumini-interaction.onrender.com/api/posts/${selectedPhotoForComment.id}/comment`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId, text: commentText })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert('Error: ' + (errorData.error || 'Failed to add comment'));
        return;
      }
      
      const comments = await res.json();
      
      // Update the photos list with new comments
      const updatedPhotos = photos.map(photo => {
        if (photo.id === selectedPhotoForComment.id) {
          return {
            ...photo,
            comments: comments.length,
            commentsList: comments.map((c, idx) => ({
              id: idx + 1,
                author: (typeof c.userId === 'object' && c.userId?.name) ? c.userId.name : (typeof c.userId === 'string' ? 'User' : 'User'),
              text: c.text,
              timestamp: new Date(c.createdAt).toLocaleString()
            }))
          };
        }
        return photo;
      });
      
      setPhotos(updatedPhotos);
      
      // Update the selected photo for immediate display in modal
      setSelectedPhotoForComment(prev => ({
        ...prev,
        comments: comments.length,
        commentsList: comments.map((c, idx) => ({
          id: idx + 1,
          author: (typeof c.userId === 'object' && c.userId?.name) ? c.userId.name : (typeof c.userId === 'string' ? 'User' : 'User'),
          text: c.text,
          timestamp: new Date(c.createdAt).toLocaleString()
        }))
      }));
      
      setCommentText('');
      alert('Comment posted successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to add comment');
    }
  };

  const handleShare = async (photoId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://alumini-interaction.onrender.com/api/posts/${photoId}/share`, { 
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      setPhotos(photos.map(p => p.id === photoId ? { ...p, shares: data.shares } : p));
      alert('Photo shared!');
    } catch (e) { console.error(e); }
  };

  // Posting functionality removed for students: Add button and upload modal disabled.

  return (
    <>
      <style>{customStyles}</style>
      <Container
        id="main"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          marginLeft: "350px",
          marginRight: "auto",
          maxWidth: "1100px",
          marginTop: "150px",
          paddingBottom: "80px"
        }}
      >
        <div style={{
          width: "100%",
          maxWidth: "1000px",
          marginBottom: "40px"
        }}>
          <h2
            className="text-center mb-4"
            style={{ 
              color: "#008080", 
              fontWeight: "700",
              fontSize: "36px",
              marginBottom: "20px"
            }}
          >
            Photo Gallery
          </h2>
          <p style={{ 
            textAlign: "center", 
            color: "#666", 
            fontSize: "16px",
            marginBottom: "30px"
          }}>
            Memories from our placement events and celebrations
          </p>
        </div>

        {/* Photos Feed */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "25px", 
          width: "100%", 
          alignItems: "center" 
        }}>
          {photos.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              color: "#888", 
              marginTop: "60px",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "1000px"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📷</div>
              <h4 style={{ color: "#666", marginBottom: "10px" }}>No photos available</h4>
              <p style={{ fontSize: "14px", color: "#999" }}>Check back later for new memories</p>
            </div>
          ) : (
            photos.map((photo) => (
              <Card
                key={photo.id}
                className="photo-card"
                style={{ 
                  borderRadius: "16px", 
                  padding: "0", 
                  width: "1000px", 
                  maxWidth: "100%",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  overflow: "hidden"
                }}
              >
                <Card.Body style={{ padding: "25px" }}>
                  {/* Post Header */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                      <div style={{ 
                        width: "56px", 
                        height: "56px", 
                        borderRadius: "50%", 
                        background: "linear-gradient(135deg, #008080 0%, #006666 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "24px",
                        marginRight: "15px",
                        boxShadow: "0 2px 8px rgba(0,128,128,0.3)"
                      }}>
                        <FaCamera />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div 
                          style={{ 
                            fontWeight: "600", 
                            fontSize: "16px", 
                            color: "#333",
                            cursor: photo.postedById ? "pointer" : "default",
                            textDecoration: "none"
                          }}
                          onClick={() => {
                            if (photo.postedById) {
                              const userId = typeof photo.postedById === 'object' ? photo.postedById._id : photo.postedById;
                              if (userId) {
                                handleProfileClick(userId);
                              }
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (photo.postedById) {
                              e.currentTarget.style.color = "#008080";
                              e.currentTarget.style.textDecoration = "underline";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (photo.postedById) {
                              e.currentTarget.style.color = "#333";
                              e.currentTarget.style.textDecoration = "none";
                            }
                          }}
                        >
                          {photo.postedBy || "Placement Team"}
                        </div>
                        <div style={{ fontSize: "13px", color: "#999" }}>
                          {photo.postedDate || "Recent"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Heading */}
                  {photo.heading && (
                    <div style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "15px"
                    }}>
                      {photo.heading}
                    </div>
                  )}
                </Card.Body>

                {/* Photo Image - Full Width, No Padding */}
                <div style={{ 
                  width: "100%",
                  backgroundColor: "#f5f5f5",
                  position: "relative"
                }}>
                  <img
                    className="photo-image"
                    src={photo.image}
                    alt={photo.heading}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "500px",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                </div>

                <Card.Body style={{ padding: "8px 25px 20px 25px" }}>

                  {/* Post Description */}
                  {photo.description && (
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#666", 
                      lineHeight: "1.6",
                      marginBottom: "15px"
                    }}>
                      {photo.description}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    fontSize: "13px", 
                    color: "#666",
                    paddingBottom: "12px"
                  }}>
                    <span style={{ fontWeight: "500", color: "#008080", cursor: "pointer" }}>
                      {photo.likes || 0} likes
                    </span>
                    <span style={{ fontWeight: "500", color: "#666" }}>
                      {photo.comments || 0} comments • {photo.shares || 0} shares • {photo.views || 0} views
                    </span>
                  </div>

                  {/* Divider */}
                  <hr style={{ margin: "0 0 8px 0", border: "none", borderTop: "1px solid #e8e8e8" }} />

                  {/* Action Buttons */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-around",
                    gap: "10px"
                  }}>
                    <Button
                      variant="light"
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#555",
                        fontSize: "15px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        flex: 1
                      }}
                      onClick={() => handleLike(photo.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f8f8";
                        e.currentTarget.style.color = "#008080";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#555";
                      }}
                    >
                      <FaThumbsUp /> Like
                    </Button>
                    <Button
                      variant="light"
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#555",
                        fontSize: "15px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        flex: 1
                      }}
                      onClick={() => handleComment(photo.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f8f8";
                        e.currentTarget.style.color = "#008080";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#555";
                      }}
                    >
                      <FaComment /> Comment
                    </Button>
                    <Button
                      variant="light"
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        color: "#555",
                        fontSize: "15px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        flex: 1
                      }}
                      onClick={() => handleShare(photo.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f8f8";
                        e.currentTarget.style.color = "#008080";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#555";
                      }}
                    >
                      <FaShare /> Share
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>

        {/* Posting UI removed for student role */}

        {/* Comment Modal */}
        <Modal show={showCommentModal} onHide={handleCloseCommentModal} size="lg" centered>
          <Modal.Header closeButton style={{ 
            backgroundColor: "#008080", 
            color: "white",
            borderRadius: "0",
            padding: "20px 25px"
          }}>
            <Modal.Title style={{ fontWeight: "700", fontSize: "24px" }}>
              💬 Comments & Discussion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "25px" }}>
            {selectedPhotoForComment && (
              <>
                {/* Photo Info */}
                <div style={{ 
                  marginBottom: "25px", 
                  padding: "18px", 
                  background: "linear-gradient(135deg, #e8f5f5 0%, #f0f8f8 100%)", 
                  borderRadius: "12px",
                  borderLeft: "4px solid #008080"
                }}>
                  <h5 style={{ 
                    color: "#008080", 
                    marginBottom: "8px", 
                    fontWeight: "700",
                    fontSize: "18px"
                  }}>
                    {selectedPhotoForComment.heading}
                  </h5>
                  <p style={{ fontSize: "14px", color: "#555", marginBottom: "0", fontWeight: "500" }}>
                    📷 Posted by {selectedPhotoForComment.postedBy} • {selectedPhotoForComment.postedDate}
                  </p>
                </div>

                {/* Comments List */}
                <div style={{ 
                  maxHeight: "350px", 
                  overflowY: "auto", 
                  marginBottom: "25px",
                  paddingRight: "10px"
                }}>
                  {selectedPhotoForComment.commentsList && selectedPhotoForComment.commentsList.length > 0 ? (
                    selectedPhotoForComment.commentsList.map((comment) => (
                      <div key={comment.id} style={{ 
                        marginBottom: "15px", 
                        padding: "16px", 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "12px",
                        borderLeft: "4px solid #008080",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e8f5f5";
                        e.currentTarget.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                      >
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#008080",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
                            marginRight: "12px"
                          }}>
                            {comment.author.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: "#008080", fontSize: "15px" }}>{comment.author}</strong>
                            <span style={{ fontSize: "12px", color: "#999", marginLeft: "10px" }}>
                              {comment.timestamp}
                            </span>
                          </div>
                        </div>
                        <p style={{ margin: "0 0 0 48px", fontSize: "14px", color: "#333", lineHeight: "1.6" }}>
                          {comment.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: "center", 
                      color: "#999", 
                      padding: "40px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "48px", marginBottom: "10px" }}>💭</div>
                      <p style={{ fontStyle: "italic", marginBottom: "0" }}>
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <Form onSubmit={handleSubmitComment}>
                  <Form.Group controlId="commentText">
                    <Form.Label style={{ fontWeight: "600", color: "#333", marginBottom: "10px" }}>
                      Add Your Comment
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Share your thoughts about this photo..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      style={{
                        borderRadius: "8px",
                        border: "2px solid #e0e0e0",
                        padding: "12px",
                        fontSize: "14px",
                        resize: "none"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#008080"}
                      onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    style={{
                      marginTop: "15px",
                      background: "linear-gradient(135deg, #008080 0%, #006666 100%)",
                      border: "none",
                      padding: "12px 30px",
                      fontWeight: "700",
                      fontSize: "15px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,128,128,0.3)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,128,128,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,128,128,0.3)";
                    }}
                  >
                    💬 Post Comment
                  </Button>
                </Form>
              </>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}

export default StudentsPhotoPost;
