import styled from 'styled-components';

const Wrapper = styled.div`
    color: var(--text-color);

    /* ---------- HEADER ---------- */
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        position: relative;
    }

    .header h2 {
        flex: 1;
        text-align: center;
        margin: 0;
        color: var(--text-color);
        font-size: 20px;
        font-weight: 600;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    /* ---------- MAIN TOP SECTION ---------- */
    .container-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding: 10px 60px 10px 10px;
        width: 100%;
        box-sizing: border-box;
    }

    .container-row {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
        flex-wrap: wrap;
    }

    .container-label {
        font-weight: 600;
        color: var(--primary-color);
        min-width: 80px;
    }

    .container-value {
        color: var(--text-color);
        word-break: break-word;
    }

    .container-id-row {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    .container-list-scroll {
        margin-top: 10px;
        max-height: calc(100vh - 270px);
        overflow-y: auto;
    }

    .container-card {
        margin-bottom: 20px;
        background: var(--card-color);
        border: 1px solid rgba(100, 100, 100, 0.3);
        border-radius: 10px;
        color: var(--text-color);
        scrollbar-width: thin;
        transition:
            background 0.3s ease,
            color 0.3s ease;
    }

    .pallet-name {
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* ---------- LOADING ---------- */
    .loading-overlay {
        position: fixed;
        inset: 0;
        background: var(--card-color);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: background 0.3s ease;
    }

    .loading-container {
        width: 200px;
        height: 200px;

        @media (max-width: 768px) {
            width: 150px;
            height: 150px;
        }

        @media (max-width: 480px) {
            width: 120px;
            height: 120px;
        }
    }
`;

export default Wrapper;
