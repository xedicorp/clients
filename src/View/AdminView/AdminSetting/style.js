import styled from 'styled-components';

export const Wrapper = styled.div`
    /* ---------- SETTINGS PAGE ---------- */
    .settings-page {
        max-width: 1400px;
        margin: 0 auto;
        color: var(--text-color);
        transition: background 0.3s ease, color 0.3s ease;
    }

    /* ---------- PAGE HEADER ---------- */
    .page-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(33, 162, 167, 0.2);
    }

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        background: linear-gradient(135deg, var(--primary-color), #6fffe9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .page-subtitle {
        font-size: 1rem;
        color: var(--text-color);
        opacity: 0.7;
        margin: 0;
    }

    /* ---------- SETTINGS GRID ---------- */
    .settings-grid {
        display: grid;
        gap: 2rem;
        grid-template-columns: 1fr;
    }

    /* ---------- SETTINGS CARD ---------- */
    .settings-card {
        background: var(--card-color);
        padding: 2rem;
        border-radius: 16px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(33, 162, 167, 0.1);

        &:hover {
            box-shadow: 0 8px 30px rgba(33, 162, 167, 0.15);
            transform: translateY(-2px);
        }
    }

    .appearance-card {
        max-width: 600px;
    }

    /* ---------- CARD HEADER ---------- */
    .card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(100, 100, 100, 0.2);
    }

    .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg {
            width: 24px;
            height: 24px;
        }

        &.supplier {
            background: linear-gradient(135deg, #4169E1, #6495ED);
            color: white;
        }

        &.appearance {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
        }
    }

    .card-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0 0 0.25rem 0;
    }

    .card-description {
        font-size: 0.9rem;
        color: var(--text-color);
        opacity: 0.7;
        margin: 0;
    }

    /* ---------- CARD ACTIONS ---------- */
    .card-actions {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(100, 100, 100, 0.2);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    /* ---------- INPUTS ---------- */
    input,
    textarea,
    select {
        flex: 1;
        min-width: 0;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid rgba(100, 100, 100, 0.4);
        background-color: var(--bg-color);
        color: var(--text-color);
        font-size: 1rem;
        transition:
            border 0.3s ease,
            background 0.3s ease;

        &:focus {
            border-color: var(--primary-color);
            outline: none;
            box-shadow: 0 0 4px rgba(33, 162, 167, 0.3);
        }

        &:disabled {
            background-color: rgba(200, 200, 200, 0.1);
            opacity: 0.7;
            cursor: not-allowed;
        }
    }

    textarea {
        resize: vertical;
        min-height: 80px;
    }

    /* ---------- SUPPLIER FORM ---------- */
    .supplier-form {
        display: flex;
        flex-direction: column;
        gap: 1.8rem;

        h4 {
            margin-bottom: 0.6rem;
            color: var(--text-color);
            font-size: 1.1rem;
            font-weight: 600;
            border-bottom: 1px solid rgba(100, 100, 100, 0.3);
            padding-bottom: 0.3rem;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        input[type='file'] {
            padding: 6px;
            background-color: transparent;
            border: 1px dashed rgba(150, 150, 150, 0.4);
            cursor: pointer;
            transition: border-color 0.3s ease;

            &:hover {
                border-color: var(--primary-color);
            }
        }

        .submit-btn {
            align-self: flex-end;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition:
                background 0.3s ease,
                transform 0.2s ease;

            &:hover {
                background: linear-gradient(135deg, var(--primary-color), #6fffe9);
                transform: translateY(-1px);
            }
        }
    }

    /* ---------- THEME TOGGLE ---------- */
    .theme-toggle-container {
        margin-top: 1rem;
    }

    .theme-toggle-btn {
        width: 100%;
        background: linear-gradient(135deg, rgba(33, 162, 167, 0.1), rgba(111, 255, 233, 0.1));
        border: 2px solid rgba(33, 162, 167, 0.3);
        color: var(--text-color);
        padding: 1.5rem;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
            background: linear-gradient(135deg, rgba(33, 162, 167, 0.2), rgba(111, 255, 233, 0.2));
            border-color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 162, 167, 0.2);
        }

        .theme-option {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            svg {
                flex-shrink: 0;
            }

            span {
                font-weight: 600;
            }
        }
    }

    /* ---------- LOADING ---------- */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(60, 120, 180, 0.15);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }


    @keyframes fadeIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    /* ---------- LOADING ---------- */
    .loading-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: background 0.3s ease;
    }

  

    /* ---------- RESPONSIVE ---------- */
    @media (max-width: 1024px) {
        .settings-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 768px) {
        .page-title {
            font-size: 1.75rem;
        }

        .settings-card {
            padding: 1.5rem;
        }

        .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;

            svg {
                width: 20px;
                height: 20px;
            }
        }

        .card-title {
            font-size: 1.25rem;
        }

    }

    @media (max-width: 480px) {
        .page-title {
            font-size: 1.5rem;
        }

        .settings-card {
            padding: 1rem;
        }

        .card-actions {
            flex-direction: column;

            button {
                width: 100%;
            }
        }

      
    }
`;
