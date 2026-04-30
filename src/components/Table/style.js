import styled from "styled-components";

const TableWrapper = styled.div`

    /* ================= CHECKBOX ================= */

    .checkbox {
        appearance: none;
        width: 18px;
        height: 18px;
        border: 2px solid #9aa3b1;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }

    .checkbox:hover {
        border-color: #1a8287;
    }

    .checkbox:checked {
        background: #1a8287;
        border-color: #1a8287;
    }

    .checkbox:checked::after {
        content: '';
        position: absolute;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        left: 5px;
        top: 1px;
    }

    .checkbox:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(26,130,135,0.25);
    }

    /* ================= RESPONSIVE ================= */

    @media (max-width: 1024px) {
        th, td {
            padding: 8px;
            font-size: 12.5px;
        }
    }

    @media (max-width: 768px) {
        overflow-x: auto;

        table {
            min-width: 700px;
        }

        th, td {
            padding: 7px;
            font-size: 12.5px;
        }
    }

    @media (max-width: 480px) {
        th, td {
            padding: 6px;
            font-size: 12px;
        }

        table {
            min-width: 650px;
        }
    }

    @media (max-width: 360px) {
        th, td {
            padding: 6px;
            font-size: 11.5px;
        }

        table {
            min-width: 600px;
        }
    }
`;

export default TableWrapper;
