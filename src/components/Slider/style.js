import styled from 'styled-components';

export const SliderWrapper = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 600px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    display: flex;
    flex-direction: column;

    .slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
        }

        .slider-close {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 12px;
            font-size: 22px;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;

            &:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }
        }
    }

    .slider-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;
