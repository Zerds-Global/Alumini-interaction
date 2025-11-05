import React from "react";
import { Container, Card, Button, Modal, Form } from "react-bootstrap";
import { AiFillNotification } from "react-icons/ai";
import { FaThumbsUp, FaComment, FaShare, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";

// Add custom styles
const customStyles = `
  .update-card {
    transition: all 0.3s ease;
  }
  
  .update-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,128,128,0.15) !important;
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

function LiveUpdates() {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [show, setShow] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    heading: "",
    description: ""
  });
  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedUpdateForComment, setSelectedUpdateForComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    // Load only update posts from Post API
    const token = localStorage.getItem("token");
    const collegeId = localStorage.getItem('college');
    const params = new URLSearchParams({ postType: 'update' });
    if (collegeId) {
      params.append('collegeId', collegeId);
    }
    
    fetch(`https://render.com/docs/web-services#port-binding/api/posts?${params.toString()}`, {
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
          referenceId: p.referenceId,
          postType: p.postType,
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          likedBy: Array.isArray(p.likes) ? p.likes : [],
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          shares: p.shares || 0,
          views: 0,
          postedBy: p.postedBy || 'User',
          postedById: p.postedById ? p.postedById.toString() : null,
          postedDate: new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          commentsList: Array.isArray(p.comments) ? p.comments.map((c, idx) => ({ id: idx + 1, author: c.userId, text: c.text, timestamp: new Date(c.createdAt).toLocaleString() })) : [],
        }));
        setUpdates(posts);
      })
      .catch((error) => console.error("Error fetching update posts:", error));
  }, []);

  const toggleReadMore = (updateId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [updateId]: !prev[updateId]
    }));
  };

  const handleLike = async (updateId) => {
    const userId = localStorage.getItem('id') || localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://render.com/docs/web-services#port-binding/api/posts/${updateId}/like`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + (data.error || 'Failed to like post'));
        return;
      }
      setUpdates(updates.map(u => u.id === updateId ? { ...u, likes: data.likes } : u));
    } catch (e) { console.error(e); alert('Failed to like post'); }
  };

  const handleComment = (updateId) => {
    const update = updates.find(u => u.id === updateId);
    setSelectedUpdateForComment(update);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCommentText("");
    setSelectedUpdateForComment(null);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedUpdateForComment) return;
    const userId = localStorage.getItem('id') || localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://render.com/docs/web-services#port-binding/api/posts/${selectedUpdateForComment.id}/comment`, {
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
      
      // Update the updates list with new comments
      const updatedUpdates = updates.map(u => {
        if (u.id === selectedUpdateForComment.id) {
          return {
            ...u,
            comments: comments.length,
            commentsList: comments.map((c, idx) => ({
              id: idx + 1,
                author: (typeof c.userId === 'object' && c.userId?.name) ? c.userId.name : (typeof c.userId === 'string' ? 'User' : 'User'),
              text: c.text,
              timestamp: new Date(c.createdAt).toLocaleString()
            }))
          };
        }
        return u;
      });
      
      setUpdates(updatedUpdates);
      
      // Update the selected update for immediate display in modal
      setSelectedUpdateForComment(prev => ({
        ...prev,
        comments: comments.length,
        commentsList: comments.map((c, idx) => ({
          id: idx + 1,
          author: c.userId?.name || c.userId || 'User',
          text: c.text,
          timestamp: new Date(c.createdAt).toLocaleString()
        }))
      }));
      
      setCommentText('');
      alert('Comment posted successfully!');
    } catch (e) { console.error(e); alert('Failed to add comment'); }
  };

  const handleShare = async (updateId) => {
    const userId = localStorage.getItem('id') || localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://render.com/docs/web-services#port-binding/api/posts/${updateId}/share`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + (data.error || 'Failed to share post'));
        return;
      }
      setUpdates(updates.map(u => u.id === updateId ? { ...u, shares: data.shares } : u));
      alert('Update shared!');
    } catch (e) { console.error(e); alert('Failed to share post'); }
  };

  const handleDelete = async (update) => {
    const currentUserId = localStorage.getItem('id') || localStorage.getItem('userId') || '';
    if (update.postedById && update.postedById !== currentUserId) {
      alert('You can only delete your own posts.');
      return;
    }
    if (!window.confirm('Delete this update post?')) return;
    try {
      const token = localStorage.getItem("token");
      if (update.referenceId) {
        try { 
          await fetch(`https://render.com/docs/web-services#port-binding/api/updates/${update.referenceId}`, { 
            method: 'DELETE',
            headers: {
              "Authorization": `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }); 
        } catch (_) {}
      }
      const res = await fetch(`https://render.com/docs/web-services#port-binding/api/posts/${update.id}`, {
        method: 'DELETE',
        headers: { 
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId: currentUserId })
      });
      if (!res.ok) {
        const data = await res.json();
        alert('Failed to delete: ' + (data.error || 'Unknown error'));
        return;
      }
      setUpdates(prev => prev.filter(u => u.id !== update.id));
      alert('Update post deleted');
    } catch (e) {
      console.error(e);
      alert('Failed to delete update post');
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const handleShow = () => {
    setUpdateFormData({
      heading: "",
      description: ""
    });
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({ ...updateFormData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check user role - only alumni can create posts
    const userRole = localStorage.getItem('role');
    if (userRole !== 'alumni') {
      alert('Only alumni can create posts.');
      return;
    }

    // Create update on backend then create a Post
    const token = localStorage.getItem("token");
    fetch("https://render.com/docs/web-services#port-binding/api/updates", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(updateFormData),
    })
      .then((res) => res.json())
      .then(async (savedUpdate) => {
        const postRes = await fetch("https://render.com/docs/web-services#port-binding/api/posts", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            heading: savedUpdate.heading,
            description: savedUpdate.description,
            postType: "update",
            referenceId: savedUpdate._id
            // collegeId and postedById are taken from JWT token automatically by backend
          }),
        });

        const newPost = await postRes.json();

        if (!postRes.ok) {
          alert('Failed to create post: ' + (newPost.error || 'Unknown error'));
          return;
        }

        const displayUpdate = {
          id: newPost._id,
          heading: newPost.heading,
          description: newPost.description,
          postedBy: newPost.postedBy || 'User',
          postedById: newPost.postedById || null,
          postedDate: new Date(newPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          commentsList: [],
  };

  setUpdates([displayUpdate, ...updates]);
  alert("Update posted successfully!");
  handleClose();
      })
      .catch((err) => { console.error(err); alert("Failed to post update"); });
  };

  return (
    <>
      <style>{customStyles}</style>
      <Container
        id="live-updates"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          marginLeft: "350px",
          marginRight: "auto",
          maxWidth: "1100px",
          marginTop: "80px",
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
            📢 Live Updates
          </h2>
          <p style={{ 
            textAlign: "center", 
            color: "#666", 
            fontSize: "16px",
            marginBottom: "30px"
          }}>
            Stay informed with the latest announcements and notifications
          </p>
        </div>

        {/* Updates Feed */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "25px", 
          width: "100%", 
          alignItems: "center" 
        }}>
          {updates.length === 0 ? (
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
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
              <h4 style={{ color: "#666", marginBottom: "10px" }}>No updates available</h4>
              <p style={{ fontSize: "14px", color: "#999" }}>Check back later for new announcements</p>
            </div>
          ) : (
            updates.map((update) => (
              <Card
                key={update.id}
                className="update-card"
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
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
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
                        <FaBell />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div 
                          style={{ 
                            fontWeight: "600", 
                            fontSize: "16px", 
                            color: "#333",
                            cursor: update.postedById ? "pointer" : "default",
                            textDecoration: "none"
                          }}
                          onClick={() => {
                            if (update.postedById) {
                              const userId = typeof update.postedById === 'object' ? update.postedById._id : update.postedById;
                              navigate(`/alumni/view-profile/${userId}`);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (update.postedById) {
                              e.currentTarget.style.color = "#008080";
                              e.currentTarget.style.textDecoration = "underline";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (update.postedById) {
                              e.currentTarget.style.color = "#333";
                              e.currentTarget.style.textDecoration = "none";
                            }
                          }}
                        >
                          {update.postedBy || "Placement Cell"}
                        </div>
                        <div style={{ fontSize: "13px", color: "#999" }}>
                          {update.postedDate || "Recent"}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}>
                        <FaBell style={{ fontSize: "10px" }} />
                        Important
                      </div>
                    </div>
                  </div>

                  {/* Update Title */}
                  <Card.Title
                    style={{
                      fontSize: "26px",
                      fontWeight: "700",
                      color: "#1a1a1a",
                      marginBottom: "15px",
                      lineHeight: "1.3"
                    }}
                  >
                    {update.heading}
                  </Card.Title>

                  {/* Update Description */}
                  <Card.Text
                    style={{ 
                      fontSize: "15px", 
                      color: "#444", 
                      marginBottom: "18px", 
                      lineHeight: "1.7",
                      textAlign: "justify"
                    }}
                  >
                    {expandedPosts[update.id] 
                      ? update.description 
                      : truncateText(update.description, 200)}
                    {update.description && update.description.length > 200 && (
                      <span
                        onClick={() => toggleReadMore(update.id)}
                        style={{
                          color: "#008080",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginLeft: "5px",
                          textDecoration: "underline"
                        }}
                      >
                        {expandedPosts[update.id] ? " Show less" : " Read more"}
                      </span>
                    )}
                  </Card.Text>

                  {/* Divider */}
                  <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #e8e8e8" }} />

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
                      {update.likes || 0} likes
                    </span>
                    <span style={{ fontWeight: "500", color: "#666" }}>
                      {update.comments || 0} comments • {update.shares || 0} shares • {update.views || 0} views
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
                      onClick={() => handleLike(update.id)}
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
                      onClick={() => handleComment(update.id)}
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
                      onClick={() => handleShare(update.id)}
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
                  {(update.postedById && update.postedById === (localStorage.getItem('userId') || '')) && (
                    <Button
                        variant="outline-danger"
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          flex: 1
                        }}
                        onClick={() => handleDelete(update)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>

        {/* Floating Add Button - Only for Alumni */}
        {localStorage.getItem('role') === 'alumni' && (
        <Button
          style={{
            position: "fixed",
            bottom: "40px",
            right: "60px",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #008080 0%, #006666 100%)",
            border: "none",
            fontSize: "32px",
            fontWeight: "bold",
            boxShadow: "0 6px 20px rgba(0,128,128,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 1000,
            transition: "all 0.3s ease"
          }}
          onClick={handleShow}
          aria-label="Add Update"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,128,128,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,128,128,0.4)";
          }}
        >
          +
        </Button>
        )}

        {/* Post Update Modal */}
        <Modal show={show} onHide={handleClose} size="lg" centered>
          <Modal.Header closeButton style={{ 
            backgroundColor: "#008080", 
            color: "white",
            borderRadius: "0",
            padding: "20px 25px"
          }}>
            <Modal.Title style={{ fontWeight: "700", fontSize: "24px" }}>
              📢 Post New Update
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "30px" }}>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formHeading" className="mb-3">
                <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                  Update Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="heading"
                  placeholder="e.g., Placement Drive Announcement"
                  value={updateFormData.heading}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    padding: "12px"
                  }}
                />
              </Form.Group>

              <Form.Group controlId="formDescription" className="mb-3">
                <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="description"
                  placeholder="Describe the update in detail..."
                  value={updateFormData.description}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    padding: "12px",
                    resize: "vertical"
                  }}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                style={{
                  marginTop: "20px",
                  background: "linear-gradient(135deg, #008080 0%, #006666 100%)",
                  border: "none",
                  width: "100%",
                  padding: "14px",
                  fontWeight: "700",
                  fontSize: "16px",
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
                🚀 Post Update
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

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
            {selectedUpdateForComment && (
              <>
                {/* Update Info */}
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
                    {selectedUpdateForComment.heading}
                  </h5>
                  <p style={{ fontSize: "14px", color: "#555", marginBottom: "0", fontWeight: "500" }}>
                    📢 Posted by {selectedUpdateForComment.postedBy} • {selectedUpdateForComment.postedDate}
                  </p>
                </div>

                {/* Comments List */}
                <div style={{ 
                  maxHeight: "350px", 
                  overflowY: "auto", 
                  marginBottom: "25px",
                  paddingRight: "10px"
                }}>
                  {selectedUpdateForComment.commentsList && selectedUpdateForComment.commentsList.length > 0 ? (
                    selectedUpdateForComment.commentsList.map((comment) => (
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
                      placeholder="Share your thoughts, questions, or feedback..."
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

export default LiveUpdates;
