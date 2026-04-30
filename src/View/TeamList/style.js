import styled from 'styled-components';

const Wrapper = styled.div`
    /* ===== STAFF MODAL FORM ===== */
    .staff-save--modal-details {
        padding: 8px 2px;
        min-height: 250px;
    }

    .form-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        width: calc(50% - 9px);
    }

    .form-group.full {
        width: 100%;
    }

  

    .form-group input {
        height: 40px;
        padding: 0 12px;
        border-radius: 8px;
        border: 1px solid #dcdcdc;
        font-size: 14px;
        outline: none;
        transition: all 0.2s ease;
    }

    .form-group input::placeholder {
        color: #9ca3af;
        font-size: 13px;
    }

    .form-group input:focus {
        border-color: #4f7cff;
        box-shadow: 0 0 0 2px rgba(79, 124, 255, 0.15);
    }

    .team-action-btn {
        display: flex;
        gap: 8px;
    }

    /* ===== MOBILE ===== */
    @media (max-width: 768px) {
        .form-group {
            width: 100%;
        }

        .toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .card {
            padding: 12px;
        }
    }

    .associate-modal {
        min-height: 400px;
    }

    .plot-modal {
        min-height: 400px;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .township-search-section-modal {
        margin-bottom: 12px;
    }

    .section-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .count {
        font-size: 12px;
        color: #6b7280;
        background: #f3f4f6;
        padding: 2px 8px;
        border-radius: 999px;
    }

    .table-box {
        border: 1px solid #e5e7eb;
        margin-bottom: 12px;
        max-height: 320px;
        overflow-y: auto;
        background: #fff;
    }

    .associate-search-box {
        margin-bottom: 18px;
    }

    .team-table-staff-list,
    .team-table-associate-list {
        max-width: 350px;
        white-space: normal;
        overflow-wrap: anywhere;
        min-width: 0;
        word-break: break-word;
    }

    .team-table-plot-list {
        max-width: 120px;
        white-space: normal;
        overflow-wrap: anywhere;
        min-width: 0;
        word-break: break-word;
    }
`;

export default Wrapper;
