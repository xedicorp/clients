import styled from "styled-components";

const DropdownWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
        font-size: 14px;
        font-weight: 450;
        color: #374151;
    }

    .dropdown-box {
        position: relative;
    }
    .dropdown-box:focus-within .dropdown-input-wrapper {
        border-color: #21a2a7;
        box-shadow: 0 0 0 2px rgba(33, 162, 167, 0.25);
    }

    && input {
        flex: 1;
        min-width: 120px;
        background: transparent;
        border: none;
        outline: none;
        font-size: 16px;
        color: var(--text-color);
        padding-right: 36px;
        &::placeholder {
            color: #9ca3af;
        }
    }

    && input.visually-hidden {
        position: absolute;
        opacity: 0;
        pointer-events: none;
        width: 0;
        height: 0;
        padding: 0;
        margin: 0;
        border: 0;
        min-height: 0;
        line-height: 0;
        overflow: hidden;
        z-index: -100;
    }

    /* === DROPDOWN LIST === */
    .dropdown-list {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-top: 4px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        max-height: 180px;
        padding: 6px 0;
        z-index: 99999999 !important;
        animation: fadeIn 0.15s ease-out;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .dropdown-item {
        padding: 10px 14px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: #374151;

        &:hover {
            background: #f3f4f6;
        }
    }

    .dropdown-item.no-result {
        color: #9ca3af;
        cursor: default;
        justify-content: center;
    }

    .dropdown-name {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        font-weight: 500;
    }

    /* === CHIPS (MULTI-SELECT) === */
    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .chip {
        background: #21a2a7;
        color: white;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .chip-remove {
        cursor: pointer;
        font-size: 10px;
    }

    .role-name {
        font-size: 14px;
        color: #374151;
        font-weight: 600;
        white-space: nowrap;
    }

    .group-name {
        font-size: 12px;
        color: #9ca3af;
        font-weight: 500;
        text-transform: uppercase;
        white-space: nowrap;
    }

    .clear-icon {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #888;
    }

    /* === CHECKBOX === */
    .checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid #9aa3b1;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: inline-flex;
        justify-content: center;
        position: relative;
    }

    .checkbox:hover {
        border-color: #21a2a7;
        background: rgba(33, 162, 167, 0.08);
    }

    .checkbox:checked {
        background: #21a2a7;
        border-color: #21a2a7;
    }

    .checkbox:checked::after {
        content: '';
        position: absolute;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }

    .checkbox:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(33, 162, 167, 0.3);
    }

    .checkbox:disabled {
        background: #e5e7eb;
        border-color: #cbd5e1;
        cursor: not-allowed;
        opacity: 0.6;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-3px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

export default DropdownWrapper;
