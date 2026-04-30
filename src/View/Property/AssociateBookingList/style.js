import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

        .actions-section {
            display: flex;
            gap: 1rem;
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
        width: 40px;
        height: 40px;
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
            animation: ${spin} 1s linear infinite;
        }
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

    /* Filters Section */
    .filters-section {
        background: white;
        border-radius: 0px;
        padding: 20px;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        flex-wrap: wrap;

        .filter-group {
            min-width: 250px;

            label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #334155;
                font-size: 0.9rem;

                svg {
                    color: #64748b;
                }
            }

            .filter-select,
            .filter-input {
                width: 100%;
                padding: 0.75rem 1rem;
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

            .filter-select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                background-position: right 0.5rem center;
                background-repeat: no-repeat;
                background-size: 1.5em 1.5em;
                padding-right: 2.5rem;
            }

            .filter-input:disabled {
                background-color: #f1f5f9;
                cursor: not-allowed;
                opacity: 0.6;
            }
        }

        .btn-search {
            background: var(--primary-color) !important;
            border: none;
            color: black !important;
            padding: 0.85rem 1.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            transition: all 0.2s;
            font-size: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            white-space: nowrap;

            svg {
                color: black !important;
                stroke: black !important;
                width: 20px;
                height: 20px;
            }

            &:hover:not(:disabled) {
                background: #1a8287 !important;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            &:disabled {
                background: #cbd5e1 !important;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
                
                svg {
                    color: #64748b !important;
                    stroke: #64748b !important;
                }
            }

            .spinning {
                animation: ${spin} 1s linear infinite;
            }
        }
    }

    /* Table Container */
    .table-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        margin-bottom: 1.5rem;

        .data-table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: #f8fafc;
                border-bottom: 2px solid #e2e8f0;

                th {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    white-space: nowrap;

                    &.text-right {
                        text-align: right;
                    }
                }
            }

            tbody {
                tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background-color 0.2s;

                    &:hover {
                        background-color: #f8fafc;
                    }

                    &:last-child {
                        border-bottom: none;
                    }
                }

                td {
                    padding: 1rem 1.5rem;
                    color: #334155;
                    font-size: 0.9rem;

                    &.text-right {
                        text-align: right;
                    }

                    &.no-data {
                        text-align: center;
                        padding: 3rem;
                        color: #94a3b8;
                        font-style: italic;
                    }
                }
            }
        }
    }

    /* Table Footer */
    .table-footer {
        background: white;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;

        p {
            margin: 0;
            color: #64748b;
            font-size: 0.9rem;
            font-weight: 500;
        }
    }

    /* Old styles kept for compatibility */
    .filters-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        flex-wrap: wrap;

        .filter-group {
            min-width: 250px;

            label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #334155;
                font-size: 0.9rem;

                svg {
                    color: #64748b;
                }
            }

            .township-select,
            .search-input {
                width: 100%;
                padding: 0.75rem 1rem;
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

            .township-select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                background-position: right 0.5rem center;
                background-repeat: no-repeat;
                background-size: 1.5em 1.5em;
                padding-right: 2.5rem;
            }
        }
    }

    /* Table Card */
    .table-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        .table-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;

            h3 {
                margin: 0;
                color: #1e293b;
                font-size: 1.125rem;
                font-weight: 600;
            }
        }

        .table-container {
            overflow-x: auto;
        }

        .hold-table {
            width: 100%;
            border-collapse: collapse;

            thead {
                background: #f8fafc;
                border-bottom: 2px solid #e2e8f0;

                th {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    white-space: nowrap;

                    &.text-right {
                        text-align: right;
                    }
                }
            }

            tbody {
                tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background-color 0.2s;

                    &:hover {
                        background-color: #f8fafc;
                    }

                    &:last-child {
                        border-bottom: none;
                    }
                }

                td {
                    padding: 1rem 1.5rem;
                    color: #334155;
                    font-size: 0.9rem;

                    &.text-right {
                        text-align: right;
                    }

                    .cell-content {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;

                        svg {
                            color: #64748b;
                            flex-shrink: 0;
                        }
                    }
                }
            }
        }
    }

    /* Badges */
    .workflow-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;

        &.workflow-1 {
            background: #dbeafe;
            color: #1e40af;
        }

        &.workflow-2 {
            background: #fef3c7;
            color: #92400e;
        }

        &.workflow-3 {
            background: #e0e7ff;
            color: #3730a3;
        }
    }

    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;

        &.status-hold {
            background: #fef3c7;
            color: #92400e;
        }

        &.status-active {
            background: #dcfce7;
            color: #166534;
        }

        &.status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }
    }

    /* Confirm Booking Button */
    .btn-confirm-booking {
        background: var(--primary-color) !important;
        color: black !important;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.85rem;
        transition: all 0.2s;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &:hover {
            background: #1a8287 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .status-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }

    .btn-confirm-booking {
        background: var(--primary-color) !important;
        color: black !important;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.8rem;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        white-space: nowrap;

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

    @media (max-width: 768px) {
        padding: 1rem;

        .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;

            .actions-section {
                width: 100%;
                flex-direction: column;

                .btn-secondary {
                    width: 100%;
                    justify-content: center;
                }
            }
        }

        .filters-card {
            flex-direction: column;
            align-items: stretch;

            .filter-group {
                min-width: 100%;
            }

            .btn-icon {
                width: 100%;
            }
        }

        .table-card {
            .hold-table {
                font-size: 0.8rem;

                thead th,
                tbody td {
                    padding: 0.75rem 0.5rem;
                }
            }
        }

        .btn-confirm-booking {
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
        }

        .status-cell {
            gap: 0.3rem;
        }
    }
`;
