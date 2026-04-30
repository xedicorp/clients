import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Wrapper = styled.div`
    padding: 2rem;
    width: 100%;
    margin: 0;
    animation: ${fadeIn} 0.4s ease-out;
    color: #334155;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;

        .title-section {
            h1 {
                color: #1e293b;
                margin: 0 0 0.5rem 0;
                font-size: 1.875rem;
                font-weight: 700;
                letter-spacing: -0.025em;
            }

            .subtitle {
                color: #64748b;
                margin: 0;
                font-size: 0.95rem;
            }
        }

       
    }

    .btn-primary {
        background: var(--primary-color) !important;
        color: black !important;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        font-size: 0.9rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &:hover {
            background: #1a8287 !important;
            color: black !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .btn-secondary {
        background: var(--primary-color) !important;
        border: none;
        color: black !important;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        font-size: 0.9rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        svg {
            color: black !important;
            stroke: black !important;
        }

        &:hover {
            background: #1a8287 !important;
            color: black !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
    }

    .btn-icon {
        background: white;
        border: 1px solid #cbd5e1;
        color: #64748b;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
            border-color: #94a3b8;
            color: #334155;
            background: #f1f5f9;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .spin {
            animation: spin 1s linear infinite;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .status-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
            background: #dcfce7;
            color: #166534;

            &:hover {
                background: #bbf7d0;
            }
        }

        &.inactive {
            background: #fee2e2;
            color: #991b1b;

            &:hover {
                background: #fecaca;
            }
        }
    }

    /* Status Switch Styling */

    .btn-assign-township {
        background: var(--primary-color) !important;
        color: black !important;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        svg {
            color: black !important;
        }

        &:hover {
            background: #1a8287 !important;
            color: black !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
    }

    .text-right {
        text-align: right;
    }

    .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    

    .table-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 0.9rem;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        color: #64748b;

        p {
            margin-top: 1rem;
            font-weight: 500;
        }
    }

    .error-message {
        background-color: #fef2f2;
        border: 1px solid #fee2e2;
        color: #b91c1c;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;

        .error-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
        }

        .btn-retry {
            background: white;
            border: 1px solid #fca5a5;
            color: #b91c1c;
            padding: 0.4rem 0.8rem;

            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s;

            &:hover {
                background-color: #fef2f2;
                border-color: #ef4444;
            }
        }
    }

    /* Modal Form Styling */
    .modal-form {
        padding: 0.5rem 0;
    }

   

        .input-with-icon {
            position: relative;

            svg {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #94a3b8;
                pointer-events: none;
            }

            input,
            select {
                width: 100%;
                padding: 0.75rem 1rem 0.75rem 2.5rem;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.95rem;
                transition: all 0.2s;
                color: #1e293b;

                &:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    outline: none;
                }

                &::placeholder {
                    color: #cbd5e1;
                }
            }
        }
    }

    .btn-cancel,
    .btn-save {
        padding: 0.6rem 1.25rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        font-size: 0.9rem;
    }

    .btn-cancel {
        background-color: var(--primary-color) !important;
        border: 1px solid var(--primary-color) !important;
        color: black !important;
        margin-right: 0.75rem;

        &:hover {
            background-color: #1a8287 !important;
            color: black !important;
        }
    }

    .btn-save {
        background: var(--primary-color) !important;
        color: black !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &:hover {
            background: #1a8287 !important;
            color: black !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        &:disabled {
            background-color: #9cc5c7 !important;
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
    }

    /* Township Assignment Modal Styles */
    .help-text {
        color: #64748b;
        font-size: 0.85rem;
        margin: 0.25rem 0 0 0;
    }

    .township-dropdown-container {
        .form-group {
            margin-bottom: 1.5rem;

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #1e293b;
                font-size: 0.95rem;
            }

            .input-with-icon {
                position: relative;
                display: flex;
                align-items: center;

                svg {
                    position: absolute;
                    left: 0.75rem;
                    color: #64748b;
                    z-index: 1;
                }

                .township-dropdown {
                    width: 100%;
                    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    color: #1e293b;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;

                    &:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }

                    &:hover {
                        border-color: #cbd5e1;
                    }

                    option {
                        padding: 0.5rem;

                        &:disabled {
                            color: #9ca3af;
                            background: #f3f4f6;
                        }
                    }
                }
            }
        }
    }

    .township-selection {
        .selected-count {
            margin-bottom: 1rem;

            .selection-summary {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                background: #dcfce7;
                color: #166534;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 500;
            }
        }
    }

    .selected-townships {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;

        h4 {
            margin: 0 0 0.75rem 0;
            color: #1e293b;
            font-size: 0.95rem;
            font-weight: 600;
        }

        .selected-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .selected-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0.75rem;
            background: #f1f5f9;
            border-radius: 6px;
            font-size: 0.85rem;

            .remove-btn {
                background: none;
                border: none;
                color: #ef4444;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s;

                &:hover {
                    background: #fee2e2;
                }
            }
        }
    }

    @media (max-width: 768px) {
        padding: 1rem;

        .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;

            
        }

        .table-toolbar {
            flex-direction: column;
            align-items: stretch;

            .search-box {
                max-width: none;
            }

            .toolbar-actions {
                justify-content: flex-end;
            }
        }

        .user-table {
            th,
            td {
                padding: 0.75rem 0.5rem;
                font-size: 0.85rem;
            }

            .user-info-cell {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.25rem;

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    font-size: 0.8rem;
                }
            }

            .btn-assign-township {
                padding: 0.3rem 0.6rem;
                font-size: 0.8rem;

                span {
                    display: none;
                }
            }

            .status-toggle {
                padding: 0.2rem 0.5rem;
                font-size: 0.8rem;
            }

            .status-switch-container {
                flex-direction: column;
                gap: 0.25rem;
                align-items: flex-start;

                .status-switch {
                    width: 36px;
                    height: 20px;

                    .switch-slider {
                        &:before {
                            height: 14px;
                            width: 14px;
                            left: 3px;
                            bottom: 3px;
                        }
                    }

                    input:checked + .switch-slider:before {
                        transform: translateX(16px);
                    }
                }

                .status-text {
                    font-size: 0.75rem;
                }
            }
        }

        /* Township Modal Mobile Styles */
        .township-dropdown-container {
            .form-group {
                .input-with-icon {
                    .township-dropdown {
                        font-size: 0.85rem;
                        padding: 0.6rem 2rem 0.6rem 2.25rem;
                    }
                }
            }
        }

        .selected-townships {
            .selected-item {
                font-size: 0.8rem;
                padding: 0.4rem 0.6rem;
            }
        }
    }

    .input-with-icon input {
        padding-right: 3rem;
    }
    .toggle-password-btn {
        position: absolute;
        right: 35px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        z-index: 2222222 !important;
    }
`;
