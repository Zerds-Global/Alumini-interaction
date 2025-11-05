import React, { useState, useEffect } from "react";
import { Table, Form, Container, Button, Row, Col, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

function BatchTable() {
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newBatch, setNewBatch] = useState({ batchName: "", startDate: "", endDate: "" });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://alumini-interaction.onrender.com/api/batches", {
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

  const handleAddBatch = async () => {
    if (newBatch.batchName && newBatch.startDate && newBatch.endDate) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://alumini-interaction.onrender.com/api/batches", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify(newBatch),
        });
        if (response.ok) {
          setNewBatch({ batchName: "", startDate: "", endDate: "" });
          setShowModal(false);
          fetchBatches();
        } else {
          alert("Error adding batch");
        }
      } catch (error) {
        console.error("Error adding batch:", error);
      }
    } else {
      alert("Please fill all fields");
    }
  };

  const handleAdd = () => {
    setNewBatch({ batchName: "", startDate: "", endDate: "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`https://alumini-interaction.onrender.com/api/batches/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          fetchBatches();
        } else {
          alert("Error deleting batch");
        }
      } catch (error) {
        console.error("Error deleting batch:", error);
      }
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
        height: "auto",
      }}
    >
      <h2
        className="text-center mb-4"
        style={{ color: "#008080", fontWeight: "bold" }}
      >
        Batch Management Table
      </h2>
      <div className="d-flex justify-content-end mb-4">
        <Button
          style={{ backgroundColor: "#008080", borderColor: "#008080" }}
          onClick={handleAdd}
        >
          + Add Batch
        </Button>
      </div>
      <Table striped bordered hover responsive className="shadow-sm rounded">
        <thead
          className="text-center"
          style={{
            backgroundColor: "#008080",
            color: "white",
            overflow: "visible",
            height: "auto",
          }}
        >
          <tr>
            <th>Batch Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody style={{ height: "auto" }}>
          {batches.length > 0 ? (
            batches.map((batch) => (
              <tr key={batch._id}>
                <td className="text-center">{batch.batchName}</td>
                <td className="text-center">{new Date(batch.startDate).toLocaleDateString()}</td>
                <td className="text-center">{new Date(batch.endDate).toLocaleDateString()}</td>
                <td className="text-center">
                  <Button
                    className="text-white"
                    style={{
                      backgroundColor: "#ff4d4d",
                      borderColor: "#ff4d4d",
                    }}
                    size="sm"
                    onClick={() => handleDelete(batch._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-danger">
                No batches found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Batch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Batch Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 2022-2025"
                value={newBatch.batchName}
                onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={newBatch.startDate}
                onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={newBatch.endDate}
                onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                required
              />
            </Form.Group>
            <Button
              className="w-100"
              style={{ backgroundColor: "#008080", borderColor: "#008080" }}
              onClick={handleAddBatch}
            >
              Add Batch
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default BatchTable;
