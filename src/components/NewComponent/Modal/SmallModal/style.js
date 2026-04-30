import styled from 'styled-components';

const ModalWrapper = styled.div`
    /* ---------- OVERLAY ---------- */
    
    /* ---------- MODAL ---------- */
    .modal {
        background: var(--card-color);
        color: var(--text-color);
        border-radius: 14px;
        width: 550px;
        height: auto;
        max-width: 95vw;
        max-height: 95vh;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: popIn 0.25s ease;
        transition:
            background 0.3s ease,
            color 0.3s ease;
        position: relative;
    }

    /* ---------- HEADER (MATCH LARGE MODAL) ---------- */
    .modal h3 {
        margin: 0;
        padding: 1rem 1.25rem;
        font-size: 1.25rem;
        font-weight: 600;
        background: color-mix(in srgb, var(--card-color) 85%, #000);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 14px 14px 0 0;
    }

    /* ---------- BODY (CRITICAL FIX) ---------- */
    .modal-body {
        overflow-y: auto;
        max-height: 75vh;
        color: var(--text-color);
        background: transparent;
        scrollbar-width: thin;
        scrollbar-color: rgba(120, 120, 120, 0.4) transparent;
    }

    .modal-header {
        padding: 1rem 1.25rem;
        background: color-mix(in srgb, var(--card-color) 85%, #000);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-title {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 600;
    }

    .modal-body::-webkit-scrollbar {
        width: 6px;
    }

    .modal-body::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.3);
        border-radius: 6px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
        background: #21a2a7;
    }

    
    /* ---------- ANIMATION ---------- */
    @keyframes popIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @media (max-width: 600px) {
        .modal-overlay {
            padding-top: calc(1rem + env(safe-area-inset-top));
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
        }

        .modal {
            width: 95vw;
            max-height: calc(
                85svh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
            );
            flex: 1;
            min-height: 0;
        }

        .modal-body {
            padding: 1rem;
            flex: 1;
            min-height: 0;
            overflow-y: auto;
        }

        .modal-footer {
            justify-content: center;
            padding: 0.8rem;
        }
    }

    /* ---------- CLOSE BUTTON ---------- */
    .close-btn {
        position: absolute;
        top: 15px;
        right: 18px;
        cursor: pointer;
        color: #555;
        background: #f1f1f1;
        border-radius: 50%;
        border: 1px solid transparent;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: all 0.2s ease;
        z-index: 100;
    }

    .close-btn:hover {
        background: #f1f1f1;
        color: #e11d48;
        border-color: #e11d48;
    }
`;

export default ModalWrapper;
