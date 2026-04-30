import styled from 'styled-components';

const Wrapper = styled.div`
    
  .progress-report-card .filter-group label{
  max-width:235px;
        }
        .progress-report-card .filter-group select{
        max-width:400px;
        }

    .reports-title h2 {
        padding: 0px;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a202c;
    }

    .reports-subtitle {
        margin: 2px 0 0 0;
        font-size: 12px;
        color: #6b7280;
        font-weight: 400;
    }

    .back-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-btn:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }

    .back-btn svg {
        width: 16px;
        height: 16px;
    }

    .dashboard-btn,
    .reminder-btn,
    .booking-list-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: var(--primary-color) !important;
        border: 1px solid var(--primary-color) !important;
        color: black !important;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.3s;
    }

    

    .dashboard-btn:hover,
    .reminder-btn:hover,
    .booking-list-btn:hover {
        opacity: 0.9;
    }

   

    /* ===== FILTERS ===== */
    .progress-report-filters-card {
        padding: 20px;
        margin-bottom: 20px;
    }

    .filter-group {
        display: flex;
        align-items: center;
        flex-direction: row;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 4px;
    }

    .filter-group label {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
    }

   

    .filter-group svg {
        width: 18px;
        height: 18px;
        color: var(--primary-color);
    }

    /* ===== STATUS BADGE ===== */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 5px;
        font-size: 10px;
        font-weight: 600;
        text-transform: capitalize;
        letter-spacing: 0.2px;
        background-color: rgb(226, 227, 229);
        color: #1e293b;
    }

    /* ===== NO DATA ===== */
    .no-data {
        text-align: center;
        padding: 50px 20px;
        color: #64748b;
        font-size: 15px;
        font-weight: 500;
    }

    .summary-btn {
        background-color: rgb(33, 150, 243);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
        .progress-report-container {
            padding: 16px;
        }

        .filter-group {
            max-width: 100%;
        }
    }
`;

export default Wrapper;
