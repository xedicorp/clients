import styled from 'styled-components';

const Wrapper = styled.div`
    
    /* ===== STAFF MODAL FORM ===== */
    .staff-save--modal-details {    
        overflow: hidden;
        padding: 8px 2px;
    }

    .form-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
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

    .staff-action-btn {
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
`;

export default Wrapper;
