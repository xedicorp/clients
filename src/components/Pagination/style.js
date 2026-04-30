import styled from 'styled-components';

const Wrapper = styled.div`
    .pagination.simple {
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        margin-top: 16px;
    }

    .page-info {
        font-size: 12px;
        font-weight: 500;
        color: #334155;

        text-align: center;
    }

    .pagination button {
        padding: 8px 16px;
        border: 1px solid rgb(221, 221, 221);
        border-radius: 4px;
        background: white;
        cursor: pointer;
        color: rgb(51, 51, 51);

        font-size: 15px;
        font-weight: 600;
        cursor: pointer;

        transition: all 0.2s ease;
    }

    .pagination button:hover:not(:disabled) {
        background: #e2e8f0;
        border-color: #94a3b8;
        color: #1e293b;
    }

    .pagination button:disabled {
        padding: 8px 16px;
        border: 1px solid rgb(221, 221, 221);
        border-radius: 4px;
        background: rgb(245, 245, 245);
        color: rgb(153, 153, 153);
        cursor: not-allowed;
    }
`;

export default Wrapper;
