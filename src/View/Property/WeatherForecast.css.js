import styled from 'styled-components';

export const Wrapper = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;

    .container {
        background: white;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e5e7eb;

        h1 {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }

        .btn-refresh {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;

            &:hover:not(:disabled) {
                background: #2563eb;
            }

            &:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        }
    }

    .loading, .no-data {
        text-align: center;
        padding: 40px;
        font-size: 16px;
        color: #6b7280;
    }

    .weather-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }

    .weather-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 24px;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
        }

        .weather-date {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 16px;
            opacity: 0.9;
        }

        .weather-temp {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .temp-celsius {
                font-size: 36px;
                font-weight: 700;
            }

            .temp-fahrenheit {
                font-size: 20px;
                font-weight: 500;
                opacity: 0.8;
            }
        }

        .weather-summary {
            font-size: 18px;
            font-weight: 600;
            text-transform: capitalize;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
        }
    }

    @media (max-width: 768px) {
        padding: 12px;

        .container {
            padding: 16px;
        }

        .header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;

            h1 {
                font-size: 24px;
            }

            .btn-refresh {
                width: 100%;
            }
        }

        .weather-grid {
            grid-template-columns: 1fr;
        }
    }
`;
