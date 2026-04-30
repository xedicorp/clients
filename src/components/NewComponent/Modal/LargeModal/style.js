import styled from 'styled-components';

const ModalWrapper = styled.div`
    

    /* ---------- MODAL ---------- */
    .modal {
        background: var(--card-color);
        color: var(--text-color);
        border-radius: 14px;
        width: calc(70vw + 200px);
        min-width: 600px;
        max-height: 90vh;
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

    .modal-overlay:has(.modal.fullscreen) {
        padding: 0;
    }

    .modal.fullscreen {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        min-width: unset;
        border-radius: 0;
    }

    .modal.fullscreen {
        display: flex;
        flex-direction: column;
    }

    .modal.fullscreen .modal-body {
        flex: 1;
        max-height: none;
        overflow-y: auto;
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

    /* ---------- BODY ---------- */
    .modal-body {
        padding: 1rem;
        padding-top: 0;
        overflow-y: auto;
        max-height: 72vh;
        scrollbar-width: thin;
        scrollbar-color: rgba(120, 120, 120, 0.4) transparent;
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

    

    /* ---------- ANIMATIONS ---------- */
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

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

    /* ---------- RESPONSIVE ---------- */

    /* Tablet */
    @media (max-width: 900px) {
        .modal {
            width: 90vw;
            min-width: 500px;
        }

        .modal-title {
            font-size: 1.3rem;
        }
    }

    /* Mobile */
    @media (max-width: 600px) {
        .modal-overlay {
            padding-top: calc(1rem + env(safe-area-inset-top));
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
        }

        .modal {
            max-height: calc(
                100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
            );
            flex: 1;
            min-height: 0;
            min-width: unset;
        }

        .modal-body {
            max-height: none;
            flex: 1;
            min-height: unset;
            min-width: unset;
            overflow-y: auto;
        }

        .modal.fullscreen {
            height: calc(
                100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
            );
            max-height: calc(
                100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
            );
        }

        .modal-header {
            padding: 0.8rem 1rem;
        }

        .modal-title {
            font-size: 1.2rem;
        }

        .modal-actions {
            justify-content: center;
            padding: 0.8rem;
        }

        .action-buttons-parent {
            display: flex;
            align-items: center;
            gap: 2.5rem;
        }
    }

    /* Small Mobile */
    @media (max-width: 400px) {
        .modal-title {
            font-size: 1.1rem;
        }

        .action-buttons {
            flex-direction: column;
            width: 100%;
        }

        .action-buttons button {
            width: 100%;
            font-size: 0.8rem;
            padding: 0.5rem 0.8rem;
        }
    }

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
        line-height: 0;
        transition: all 0.2s ease;
    }

    .close-icon {
        font-size: 22px;
        display: block;
    }

    .close-btn:hover {
        background: #f1f1f1;
        color: #e11d48;
        border-color: #e11d48;
    }
`;

export default ModalWrapper;
