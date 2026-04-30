import styled from 'styled-components';

const Wrapper = styled.div`
.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 10px 0 20px;
}

.kpi-card {
    background: white;
    padding: 25px 20px;
    border-radius: 0;
    display: flex;
    align-items: center;
    gap: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
}



.kpi-title {
  font-size: 14px;
  color: #6b7280;
}

.kpi-value {
  font-size: 22px;
  font-weight: 600;
  margin-top: 4px;
}


/* ===== COLLECTION SECTION ===== */

.collection-wrapper {
  background: white;
  padding: 30px;
  border-radius: 0px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  margin-bottom: 40px;
}

.collection-header h2 {
  margin-bottom: 6px;
}

.collection-header p {
  color: #6b7280;
  margin-bottom: 20px;
}


/* ===== TOWNSHIP CARDS ===== */

.township-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.township-card {
  background: #f9fafb;
  padding: 20px;
  border-radius: 0px;
  transition: 0.3s ease;
}

.township-card:hover {
  background: #f3f4f6;
}

.township-card h3 {
  margin-bottom: 10px;
}

.township-card button {
    margin-top: 12px;
    padding: 15px 20px;
    border: none;
    border-radius: 0;
    background: #203351;
    color: white;
    cursor: pointer;
}



.kpi-icon {
    font-size: 40px;
    color: #203351;
}
    /* ---------- NAVIGATION BUTTONS ---------- */

    .dashboard-navigation {
  display: flex;
  flex-wrap: wrap;
  padding: 30px 20px;
  background-color: #fff;
  margin-bottom: 0.8rem;
  max-width: 100%;
  gap: 20px;
  border-radius: 10px;

  /* subtle admin shadow */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}


    .nav-card {
    width: 220px;
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 22px 18px;
        background: var(--card-color);
        border: 1px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        color: var(--text-color);
    }

    .nav-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

     .nav-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
    }

    .nav-card.booking-list .nav-icon {
        background: #203351;
        box-shadow: none;
    }

    .nav-card.booking-list {
        border-color: #203351;
    background: #2033510a;
    }

    .nav-card.booking-list:hover {
        border-color: #203351;
    background: #2033510a;
    }


.nav-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  transition: left 0.8s ease;
}

.nav-card:hover .nav-icon::before {
  left: 100%;
}
.nav-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}
.nav-icon svg {
  width: 22px;
  height: 22px;
  transition: stroke 0.25s ease;
}

.nav-card:hover .nav-icon svg {
  stroke: #ffffff;
}

    .nav-card.new-booking {
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.05);
    }

    .nav-card.new-booking:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .nav-card.reports {
        border-color: rgba(139, 92, 246, 0.2);
        background: rgba(139, 92, 246, 0.05);
    }

    .nav-card.reports:hover {
        border-color: #8b5cf6;
        background: rgba(139, 92, 246, 0.1);
    }

    .nav-card.draft-request {
        border-color: rgba(255, 152, 0, 0.2);
        background: rgba(255, 152, 0, 0.05);
    }

    .nav-card.draft-request:hover {
        border-color: #ff9800;
        background: rgba(255, 152, 0, 0.1);
    }

    .nav-card.reminder {
        border-color: rgba(245, 158, 11, 0.2);
        background: rgba(245, 158, 11, 0.05);
    }

    .nav-card.reminder:hover {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
    }

    .nav-card.township {
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.05);
    }

    .nav-card.township:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .nav-card.refund-management {
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.05);
    }

    .nav-card.refund-management:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .nav-card.township {
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.05);
    }

    .nav-card.township:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .nav-card.refund-management {
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.05);
    }

    .nav-card.refund-management:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

   

    .nav-card.new-booking .nav-icon {
        background: #10b981;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .nav-card.reports .nav-icon {
        background: #8b5cf6;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
    }

    .nav-card.draft-request .nav-icon {
        background: #ff9800;
        box-shadow: 0 2px 6px rgba(255, 152, 0, 0.4);
    }

    .nav-card.reminder .nav-icon {
        background: #f59e0b;
        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
    }

    .nav-card.township .nav-icon {
        background: #10b981;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .nav-card.refund-management .nav-icon {
        background: #10b981;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .nav-card.township .nav-icon {
        background: #10b981;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .nav-card.refund-management .nav-icon {
        background: #10b981;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
    }

    .nav-icon svg {
        width: 22px;
        height: 22px;
        color: white;
        stroke-width: 2;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
    }

    .nav-content {
        flex: 1;
        text-align: left;
    }

    .nav-content h3 {
        margin: 0 0 0.15rem 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-color);
        font-family: "Poppins", sans-serif;
    }

    .nav-content p {
        margin: 0;
        font-size: 0.65rem;
        color: #64748b;
        opacity: 0.9;
    }

    /* ---------- REMINDER LIST OVERLAY ---------- */
    .reminder-list-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    }

    .reminder-list-popup {
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    /* ---------- RESPONSIVE ---------- */
    @media (max-width: 768px) {
        padding: 1rem;
        
        .dashboard-navigation {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        &::-webkit-scrollbar {
            width: 6px;
        }
    }

    @media (max-width: 480px) {
        padding: 0.75rem;
        
        .dashboard-navigation {
            grid-template-columns: 1fr;
        }
    }
`;

export default Wrapper;

/* ---------- REPORTS CONTAINER ---------- */
const BookingWrapper = styled.div`
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
    max-width: 100%;
    overflow: hidden;

    .reports-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0;
        padding: 24px;
        border-bottom: 1px solid #e2e8f0;
        background: white;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .reports-header-content {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .reports-header-icon {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
        box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
    }

    .reports-header-icon svg {
        width: 36px;
        height: 36px;
        color: white;
        stroke-width: 3;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    }

    .reports-header h2 {
        margin: 0 0 4px 0;
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
        line-height: 1.2;
    }

    .reports-subtitle {
        margin: 0;
        font-size: 16px;
        color: #64748b;
        font-weight: 400;
    }

    .header-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 24px;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        min-width: 150px;
        height: 48px;
    }

    .action-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
    }

    .action-btn:hover::before {
        width: 300px;
        height: 300px;
    }

    .action-btn svg {
        width: 20px;
        height: 20px;
        stroke-width: 2.5;
        position: relative;
        z-index: 1;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .action-btn span {
        position: relative;
        z-index: 1;
    }

    .action-btn.new-booking-btn {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white;
    }

    .action-btn.new-booking-btn:hover {
        background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
    }

    .action-btn.booking-list-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
    }

    .action-btn.booking-list-btn:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    .action-btn.print-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
    }

    .action-btn.print-btn:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    .action-btn.download-btn {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
    }

    .action-btn.download-btn:hover {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
    }

    /* Township Info Grid */
    .township-section {
        padding: 24px;
        background: #f8fafc;
    }

    .township-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        max-width: 100%;
    }

    

    .info-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        border-color: #667eea;
    }

    .info-icon {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .info-icon svg {
        width: 36px;
        height: 36px;
        color: white;
        stroke-width: 3;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    }

    .info-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .info-label {
        font-size: 18px;
        color: #1e293b;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
    }

    .info-address {
        font-size: 14px;
        color: #64748b;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        line-height: 1.6;
    }

    .info-address svg {
        color: #0d9488;
        stroke-width: 2.5;
        flex-shrink: 0;
    }

    .health-btn {
        padding: 12px 18px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
        text-align: center;
    }

    .health-btn:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    /* Reports Table */
    .card {
        background: white;
        border-radius: 0;
        overflow: hidden;
    }

    .reports-table-header {
        padding: 24px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .reports-table-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
    }

    .reports-table-wrapper {
        overflow-x: auto;
        overflow-y: auto;
        max-width: 100%;
        max-height: 600px;
    }

    .reports-table-wrapper::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    .reports-table-wrapper::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    .reports-table-wrapper::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }

    .reports-table-wrapper::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }

    .reports-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
        font-size: 14px;
    }

    .reports-table thead {
        background: white;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .reports-table th {
        padding: 16px;
        text-align: left;
        font-size: 14px;
        font-weight: 600;
        color: #000;
        border-bottom: 2px solid #e2e8f0;
        background: white;
        white-space: nowrap;
    }

    .reports-table th.center {
        text-align: center;
    }

    .reports-table td {
        padding: 16px;
        border-bottom: 1px solid #f1f5f9;
        color: #4b5563;
        vertical-align: middle;
    }

    .reports-table tbody tr {
        transition: background 0.2s ease;
        background: white;
    }

    .reports-table tbody tr:hover {
        background: #f8fafc;
    }

    .property-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

 
    .property-details {
        font-size: 13px;
        color: #64748b;
        font-weight: 400;
    }

    .amount-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
    }

    .amount-badge.today {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
    }

    .amount-badge.total {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
    }

    .center {
        text-align: center;
    }

    .details-btn {
        padding: 10px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
        min-width: 140px;
    }

    .details-btn:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Loading Spinner */
    .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 60px 24px;
        background: #f8fafc;
    }

    .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e2e8f0;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .reports-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .header-actions {
            width: 100%;
            justify-content: flex-start;
        }

        .township-info-grid {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }
    }

    @media (max-width: 768px) {
        .reports-header,
        .township-section,
        .reports-table-header {
            padding: 16px;
        }

        .township-info-grid {
            grid-template-columns: 1fr;
        }

        .reports-header h2 {
            font-size: 22px;
        }

        .reports-subtitle {
            font-size: 14px;
        }

        .action-btn {
            min-width: 130px;
            padding: 12px 20px;
            font-size: 14px;
            height: 44px;
        }

        .reports-table {
            min-width: 600px;
            font-size: 13px;
        }

        .reports-table th,
        .reports-table td {
            padding: 12px;
        }
    }

    @media (max-width: 480px) {
        .header-actions {
            flex-direction: column;
            width: 100%;
        }

        .action-btn {
            width: 100%;
            justify-content: center;
        }

        
        .reports-table-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
       



        
`;

export { BookingWrapper };
