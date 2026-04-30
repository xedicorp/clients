import styled from "styled-components";

const BookingWrapper = styled.div`
  color: var(--text-color);
  padding: 16px;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
  }

  .controls {
    display: flex;
    gap: 8px;
  }

 
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

 

  .badge {
    padding: 6px 8px;
    border-radius: 12px;
    font-weight: 600;
    color: white;
    font-size: 12px;
    display: inline-block;
  }

  .badge.booking_created { background: #7b8aa1; }
  .badge.payment_pending { background: #e09b3d; }
  .badge.payment_confirmed { background: var(--primary-color); }
  .badge.workflow_selected { background: #5b8cfa; }
  .badge.on_hold { background: #d9534f; }
  .badge.closed { background: #28a745; }

  .small-btn {
    background: white;
    border: 1px solid rgba(100,100,100,0.18);
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
  }

  .primary {
    background: linear-gradient(90deg,var(--primary-color),#6fffe9);
    color: rgba(33, 49, 41, 1);
    border: none;
  }

  input, textarea, select {
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid rgba(100, 100, 100, 0.3);
    background: transparent;
    color: var(--text-color);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus, textarea:focus, select:focus {
    border-color: var(--primary-color);
  }

  input::placeholder, textarea::placeholder {
    color: rgba(127, 143, 166, 0.6);
  }

  .modal {
    position: fixed;
    inset: 0;
    background: rgba(10,12,15,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .modal .content {
    width: 760px;
    max-width: 95%;
    background: var(--card-color);
    border-radius: 10px;
    padding: 16px;
    border: 1px solid rgba(47,60,82,0.5);
  }

  @media (max-width: 768px) {
    .header { flex-direction: column; align-items: flex-start; gap: 8px; }
    th, td { padding: 8px; font-size: 13px; }
  }

  /* Add these styles to your BookingWrapper component */

.booking-info-section {
  margin-top: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.info-field {
  margin-bottom: 12px;
}

.info-label {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  display: block;
  margin-bottom: 4px;
}

.info-value {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(100,100,100,0.1);
  font-size: 14px;
 
}

.section-title {
  margin-bottom: 12px;
  color: var(--text-color);
}
`;

export default BookingWrapper;