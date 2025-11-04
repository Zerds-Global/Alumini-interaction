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

function StudentsLiveUpdates() {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [updateFormData, setUpdateFormData] = useState({
    heading: "",
    description: ""
  });

  // Add function to handle profile click
  const handleProfileClick = (userId) => {
    if (userId) {
      navigate(`/student/view-profile/${userId}`);
    }
  };
  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedUpdateForComment, setSelectedUpdateForComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    // Load update posts dynamically from backend
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:5000/api/posts?postType=update&populate=postedBy", {
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
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          likedBy: Array.isArray(p.likes) ? p.likes : [],
          comments: Array.isArray(p.comments) ? p.comments.length : 0,
          shares: p.shares || 0,
          views: 0,
          postedBy: p.postedBy || 'User',
          postedById: p.postedById?._id || p.postedById || null,
          postedDate: new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          commentsList: Array.isArray(p.comments) ? p.comments.map((c, idx) => ({ id: idx + 1, author: c.userId?.name || c.userId || 'User', text: c.text, timestamp: new Date(c.createdAt).toLocaleString() })) : [],
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
    const userId = localStorage.getItem('userId') || localStorage.getItem('name') || 'guest';
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/posts/${updateId}/like`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setUpdates(updates.map(u => u.id === updateId ? { ...u, likes: data.likes } : u));
    } catch (e) { console.error(e); }
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
    const userName = localStorage.getItem('name') || 'User';
    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/posts/${selectedUpdateForComment.id}/comment`, {
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

  const handleShare = async (updateId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/posts/${updateId}/share`, { 
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      setUpdates(updates.map(u => u.id === updateId ? { ...u, shares: data.shares } : u));
      alert('Update shared!');
    } catch (e) { console.error(e); }
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  // Posting functionality removed for students: Add button and post modal disabled.

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
                      <div 
                        style={{ 
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
                          boxShadow: "0 2px 8px rgba(0,128,128,0.3)",
                          cursor: update.postedById ? "pointer" : "default"
                        }}
                        onClick={() => {
                          if (update.postedById) {
                            handleProfileClick(update.postedById);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (update.postedById) {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,128,128,0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (update.postedById) {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,128,128,0.3)";
                          }
                        }}
                      >
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
                              navigate(`/student/view-profile/${update.postedById}`);
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

export default StudentsLiveUpdates;
