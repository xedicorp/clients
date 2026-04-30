import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import workflows from "../../mock/workflows";
import BookingWrapper from "./style";
import "./SelectWorkflow.css";

const STORAGE_KEY = "property_bookings_v1";

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveBookings(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function SelectWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bookings = loadBookings();
  const booking = bookings.find(b => b.id === id);

  if (!booking) { 
    return (
      <BookingWrapper>
        <div className="card">
          <h3>Booking not found</h3>
          <button className="small-btn" onClick={() => navigate("/property")}>Back to bookings</button>
        </div>
      </BookingWrapper>
    );
  }

  const choose = (wf) => {
    // seed steps from template
    const steps = wf.steps.map((title, idx) => ({
      id: `s-${idx}-${Date.now()}`,
      stepKey: `step_${idx}`,
      title,
      status: "pending"
    }));

    const next = bookings.map(b => b.id === booking.id ? { ...b, workflowCode: wf.code, workflowName: wf.name, steps, status: "workflow_selected", updatedAt: new Date().toISOString() } : b);
    saveBookings(next);
    navigate(`/property/${booking.id}`);
  };

  return (
    <BookingWrapper>
      <div className="select-workflow-header">
        <div>
          <h2>Select Workflow</h2>
          <div className="select-workflow-info">{booking.id} � {booking.township} / {booking.plotNumber}</div>
        </div>
        <button className="small-btn" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="card">
        <div className="workflow-grid">
          {workflows.map(wf => (
            <div key={wf.code} className="workflow-card">
              <div className="workflow-card-title">{wf.name}</div>
              <div className="workflow-card-description">{wf.description}</div>
              <div className="workflow-card-steps">{wf.steps.length} steps</div>
              <div className="workflow-card-actions">
                <button className="small-btn primary" onClick={() => choose(wf)}>Select</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BookingWrapper>
  );
}