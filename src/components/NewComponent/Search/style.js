import styled from 'styled-components';

const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: 360px;

    && input[data-input='search'] {
        width: 100%;
        height: 40px;
        padding-left: 36px;
        padding-right: 36px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        line-height: 40px;
        box-sizing: border-box;
        transition: all 0.2s ease;
    }

    && input[data-input='search']:focus {
        outline: none;
        border-color: #21a2a7;
        box-shadow: 0 0 0 3px rgba(33, 162, 167, 0.2);
    }

    .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        color: #9ca3af;
        pointer-events: none;
    }

    .clear-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    @media (max-width: 480px) {
        max-width: calc(100vw - 70px);

        && input[data-input='search'] {
            height: 44px;
            font-size: 15px;
            padding-left: 44px;
            padding-right: 40px;
        }

        .search-icon {
            font-size: 18px;
        }
    }
`;

export default SearchWrapper;
