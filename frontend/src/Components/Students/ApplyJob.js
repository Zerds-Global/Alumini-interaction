import React, { useState, useEffect } from "react";
import { Container, Card, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaThumbsUp, FaComment, FaShare, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Add custom styles
const customStyles = `
  .form-control:focus, .form-select:focus {
    border-color: #008080 !important;
    box-shadow: 0 0 0 0.2rem rgba(0, 128, 128, 0.25) !important;
  }
  
  .form-label {
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  .modal-content {
    border-radius: 16px !important;
    border: none !important;
  }
  
  .modal-header .btn-close {
    filter: brightness(0) invert(1);
  }
  
  /* Scrollbar styling for comments */
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

function StudentsJobPosts() {
  const navigate = useNavigate();
  // Dynamic job posts loaded from backend
  const [jobs, setJobs] = useState([]);
  const [jobPostsMap, setJobPostsMap] = useState({});

  // Add function to handle profile click
  const handleProfileClick = (userId) => {
    if (userId) {
      navigate(`/student/view-profile/${userId}`);
    }
  }; // referenceId (job _id) -> post info

  // Load jobs from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:5000/api/jobs", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : []).map((job) => ({
          _id: job._id,
          title: job.title,
          description: job.description,
          eligibility: job.eligibility,
          location: job.location,
          type: job.type,
          company: job.company || "",
          postedBy: job.postedBy || "Placement Team",
          postedDate: new Date(job.created_at || job.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          commentsList: [],
        }));
        setJobs(mapped);
      })
      .catch((err) => console.error("Error loading jobs:", err));
    // Also load Post records for jobs to enable like/comment/share
    fetch("http://127.0.0.1:5000/api/posts?postType=job&populate=postedBy", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((posts) => {
        const map = {};
        (Array.isArray(posts) ? posts : []).forEach((p) => {
          if (p.referenceId) {
            map[p.referenceId] = {
              postId: p._id,
              likes: Array.isArray(p.likes) ? p.likes.length : 0,
              comments: Array.isArray(p.comments) ? p.comments.length : 0,
              shares: p.shares || 0,
              postedBy: p.postedBy,
              postedById: p.postedById?._id || p.postedById || null,
              postedDate: new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              commentsList: Array.isArray(p.comments) ? p.comments.map((c, idx) => ({ id: idx + 1, author: c.userId, text: c.text, timestamp: new Date(c.createdAt).toLocaleString() })) : [],
            };
          }
        });
        setJobPostsMap(map);
      })
      .catch((err) => console.error("Error loading job posts:", err));
  }, []);

  const [expandedPosts, setExpandedPosts] = useState({});
  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedJobForComment, setSelectedJobForComment] = useState(null);
  const [commentText, setCommentText] = useState("");
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  // Get unique job types and locations for filter dropdowns
  const jobTypes = Array.from(new Set(jobs.map(j => j.type)));
  const jobLocations = Array.from(new Set(jobs.map(j => j.location)));

  // Posting functionality removed for students: Add button and post modal disabled.

  const toggleReadMore = (jobId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleLike = async (jobId) => {
    try {
      const postInfo = jobPostsMap[jobId];
      if (!postInfo) return;
      const userId = localStorage.getItem('userId') || localStorage.getItem('name') || 'guest';
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/posts/${postInfo.postId}/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setJobPostsMap({ ...jobPostsMap, [jobId]: { ...postInfo, likes: data.likes } });
    } catch (e) { console.error(e); }
  };

  const handleComment = (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    setSelectedJobForComment(job);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCommentText("");
    setSelectedJobForComment(null);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedJobForComment) return;
    try {
      const postInfo = jobPostsMap[selectedJobForComment._id];
      if (!postInfo) return;
      const userId = localStorage.getItem('userId') || localStorage.getItem('name') || 'guest';
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/posts/${postInfo.postId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, text: commentText })
      });
      const comments = await res.json();
  setJobPostsMap({ ...jobPostsMap, [selectedJobForComment._id]: { ...postInfo, comments: comments.length, commentsList: comments.map((c, idx) => ({ id: idx + 1, author: (typeof c.userId === 'object' && c.userId?.name) ? c.userId.name : (typeof c.userId === 'string' ? 'User' : 'User'), text: c.text, timestamp: new Date(c.createdAt).toLocaleString() })) } });
      setCommentText('');
      alert('Comment posted successfully!');
    } catch (e) { console.error(e); }
  };

  const handleShare = async (jobId) => {
    try {
      const postInfo = jobPostsMap[jobId];
      if (!postInfo) return;
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/posts/${postInfo.postId}/share`, { 
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      setJobPostsMap({ ...jobPostsMap, [jobId]: { ...postInfo, shares: data.shares } });
      alert('Post shared!');
    } catch (e) { console.error(e); }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  // Filter and search jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      (job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? job.type === filterType : true;
    const matchesLocation = filterLocation ? job.location === filterLocation : true;
    return matchesSearch && matchesType && matchesLocation;
  });

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
          marginLeft: "300px",
          marginRight: "auto",
          maxWidth: "1100px",
          marginTop: "120px",
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
            marginBottom: "30px"
          }}
        >
          Job Opportunities
        </h2>

        {/* Search and Filters */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "10px",
          padding: "25px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <input
            type="text"
            placeholder="🔍 Search jobs, companies..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              minWidth: "250px",
              fontSize: "15px",
              outline: "none",
              transition: "all 0.3s ease",
              backgroundColor: "white"
            }}
            onFocus={(e) => e.target.style.borderColor = "#008080"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              minWidth: "160px",
              fontSize: "15px",
              outline: "none",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#008080"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          >
            <option value="">All Types</option>
            {jobTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              minWidth: "180px",
              fontSize: "15px",
              outline: "none",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#008080"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          >
            <option value="">All Locations</option>
            {jobLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        
        {/* Results count */}
        <p style={{ 
          textAlign: "center", 
          color: "#666", 
          fontSize: "14px",
          marginTop: "15px"
        }}>
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
        </p>
      </div>

      {/* Job Posts Feed - One by One */}
      <div style={{ display: "flex", flexDirection: "column", gap: "25px", width: "100%", alignItems: "center" }}>
        {filteredJobs.length === 0 && (
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
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🔍</div>
            <h4 style={{ color: "#666", marginBottom: "10px" }}>No jobs found</h4>
            <p style={{ fontSize: "14px", color: "#999" }}>Try adjusting your search or filters</p>
          </div>
        )}
        {filteredJobs.map((job) => (
          <Card
            key={job._id}
            style={{ 
              borderRadius: "16px", 
              padding: "0", 
              width: "1000px", 
              maxWidth: "100%",
              border: "1px solid #e0e0e0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,128,128,0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(0)";
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
                      fontWeight: "bold",
                      fontSize: "22px",
                      marginRight: "15px",
                      boxShadow: "0 2px 8px rgba(0,128,128,0.3)",
                      cursor: jobPostsMap[job._id]?.postedById ? "pointer" : "default"
                    }}
                    onClick={() => {
                      const userId = jobPostsMap[job._id]?.postedById;
                      if (userId) {
                        handleProfileClick(userId);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (jobPostsMap[job._id]?.postedById) {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,128,128,0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (jobPostsMap[job._id]?.postedById) {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,128,128,0.3)";
                      }
                    }}
                  >
                    {job.postedBy.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div 
                      style={{ 
                        fontWeight: "600", 
                        fontSize: "16px", 
                        color: "#333",
                        cursor: jobPostsMap[job._id]?.postedById ? "pointer" : "default",
                        textDecoration: "none"
                      }}
                      onClick={() => {
                          const userId = jobPostsMap[job._id]?.postedById;
                          if (userId) {
                            navigate(`/student/view-profile/${userId}`);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (jobPostsMap[job._id]?.postedById) {
                          e.currentTarget.style.color = "#008080";
                          e.currentTarget.style.textDecoration = "underline";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (jobPostsMap[job._id]?.postedById) {
                          e.currentTarget.style.color = "#333";
                          e.currentTarget.style.textDecoration = "none";
                        }
                      }}
                    >
                      {(jobPostsMap[job._id]?.postedBy) || job.postedBy || "User"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#999" }}>{(jobPostsMap[job._id]?.postedDate) || job.postedDate}</div>
                  </div>
                </div>
              </div>

              {/* Job Title */}
              <Card.Title
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  marginBottom: "12px",
                  lineHeight: "1.3"
                }}
              >
                {job.title}
              </Card.Title>

              {/* Company Info with Badges */}
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "10px", 
                marginBottom: "18px",
                alignItems: "center"
              }}>
                <span style={{
                  backgroundColor: "#008080",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}>
                  {job.company}
                </span>
                <span style={{
                  backgroundColor: "#f0f0f0",
                  color: "#555",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "500"
                }}>
                  📍 {job.location}
                </span>
                <span style={{
                  backgroundColor: "#e8f5f5",
                  color: "#008080",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "500"
                }}>
                  💼 {job.type}
                </span>
              </div>

              {/* Description with Read More */}
              <Card.Text
                style={{ 
                  fontSize: "15px", 
                  color: "#444", 
                  marginBottom: "15px", 
                  lineHeight: "1.7",
                  textAlign: "justify"
                }}
              >
                {expandedPosts[job._id] 
                  ? job.description 
                  : truncateText(job.description, 150)}
                {job.description.length > 150 && (
                  <span
                    onClick={() => toggleReadMore(job._id)}
                    style={{
                      color: "#008080",
                      cursor: "pointer",
                      fontWeight: "600",
                      marginLeft: "5px",
                      textDecoration: "underline"
                    }}
                  >
                    {expandedPosts[job._id] ? " Show less" : " Read more"}
                  </span>
                )}
              </Card.Text>

              {/* Eligibility Badge */}
              <div style={{ 
                backgroundColor: "#fff8e1", 
                padding: "12px 16px", 
                borderRadius: "10px",
                marginBottom: "18px",
                borderLeft: "4px solid #ffc107"
              }}>
                <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                  ✅ Eligibility: 
                </span>
                <span style={{ fontSize: "14px", color: "#333", marginLeft: "8px" }}>
                  {job.eligibility}
                </span>
              </div>

              {/* Divider */}
              <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #e8e8e8" }} />

              {/* Engagement Stats */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: "13px", 
                color: "#888",
                marginBottom: "12px",
                padding: "0 5px"
              }}>
                <span style={{ fontWeight: "500" }}>
                  <span style={{ color: "#008080", fontWeight: "600" }}>{(jobPostsMap[job._id]?.likes) ?? 0}</span> likes
                </span>
                <span style={{ fontWeight: "500" }}>
                  <span style={{ color: "#008080", fontWeight: "600" }}>{(jobPostsMap[job._id]?.comments) ?? 0}</span> comments • 
                  <span style={{ color: "#008080", fontWeight: "600" }}> {(jobPostsMap[job._id]?.shares) ?? 0}</span> shares • 
                  <span style={{ color: "#008080", fontWeight: "600" }}> {job.views}</span> views
                </span>
              </div>

              {/* Divider */}
              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #e8e8e8" }} />

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-around",
                marginTop: "8px",
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
                  onClick={() => handleLike(job._id)}
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
                  onClick={() => handleComment(job._id)}
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
                  onClick={() => handleShare(job._id)}
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
        ))}
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
          {selectedJobForComment && (
            <>
              {/* Job Info */}
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
                  {selectedJobForComment.title}
                </h5>
                <p style={{ fontSize: "14px", color: "#555", marginBottom: "0", fontWeight: "500" }}>
                  🏢 {selectedJobForComment.company} • 📍 {selectedJobForComment.location}
                </p>
              </div>

              {/* Comments List */}
              <div style={{ 
                maxHeight: "350px", 
                overflowY: "auto", 
                marginBottom: "25px",
                paddingRight: "10px"
              }}>
                {jobPostsMap[selectedJobForComment._id]?.commentsList && jobPostsMap[selectedJobForComment._id].commentsList.length > 0 ? (
                  jobPostsMap[selectedJobForComment._id].commentsList.map((comment) => (
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

export default StudentsJobPosts;
