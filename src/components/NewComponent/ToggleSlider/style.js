import styled from 'styled-components';

const Wrapper = styled.div`
    --toggle-width: 50px;
    --toggle-height: 25px;
    --circle-size: 22px;
    --translate-x: 25px;

    width: var(--toggle-width);
    height: var(--toggle-height);
    border-radius: 30px;
    background-color: #ccc;
    cursor: pointer;
    position: relative;
    transition: background-color 0.3s ease;

    &.active {
        background-color: #4caf50;
    }

    .toggle-circle {
        width: var(--circle-size);
        height: var(--circle-size);
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 1.5px;
        transform: translateY(-50%);
        transition: transform 0.3s ease;
    }

    &.active .toggle-circle {
        transform: translate(var(--translate-x), -50%);
    }

    .tooltip {
        position: fixed;
        top: calc(var(--tooltip-top, 0px) - 30px);
        left: var(--tooltip-left, 0px);
        transform: translateX(-50%);
        background: black;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        animation: fadeIn 0.2s forwards;
        z-index: 999999;
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }

    @media (max-width: 480px) {
        --toggle-width: 44px;
        --toggle-height: 22px;
        --circle-size: 18px;
        --translate-x: 22px;
    }

    @media (min-width: 1200px) {
        --toggle-width: 56px;
        --toggle-height: 28px;
        --circle-size: 24px;
        --translate-x: 28px;
    }
`;

export default Wrapper;
