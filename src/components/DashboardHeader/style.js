import styled from 'styled-components';

export const DashboardHeaderWrapper = styled.div`
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 28px 36px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 20px;
    box-shadow: 
      0 20px 40px rgba(15, 118, 110, 0.12),
      0 8px 16px rgba(15, 118, 110, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.9) inset;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(15, 118, 110, 0.08);
  }

  .dashboard-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0f766e 0%, #22c55e 50%, #0f766e 100%);
    border-radius: 20px 20px 0 0;
  }

  .dashboard-header::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 60%;
    height: 120%;
    background: radial-gradient(ellipse, rgba(15, 118, 110, 0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  .dashboard-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 2;
  }

  .dashboard-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .dashboard-header-icon {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 
      0 8px 24px rgba(15, 118, 110, 0.25),
      0 4px 8px rgba(15, 118, 110, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dashboard-header-icon svg {
    width: 32px;
    height: 32px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .dashboard-header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dashboard-header-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.8px;
    line-height: 1.1;
    background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .dashboard-header-subtitle {
    margin: 0;
    color: #64748b;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  .dashboard-header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .dashboard-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dashboard-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 8px 24px rgba(15, 118, 110, 0.25),
      0 4px 8px rgba(15, 118, 110, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .dashboard-back-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    transition: left 0.5s ease;
  }

  .dashboard-back-btn:hover::before {
    left: 100%;
  }

  .dashboard-back-btn:hover {
    background: linear-gradient(135deg, #115e59 0%, #134e4a 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 12px 32px rgba(15, 118, 110, 0.35),
      0 8px 16px rgba(15, 118, 110, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .dashboard-back-btn:active {
    transform: translateY(0);
    transition: transform 0.1s ease;
  }

  .dashboard-back-btn svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.5;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      align-items: stretch;
      gap: 24px;
      padding: 24px 20px;
    }

    .dashboard-header-content {
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
    }

    .dashboard-header-left {
      justify-content: center;
      text-align: center;
    }

    .dashboard-header-right {
      justify-content: center;
      flex-wrap: wrap;
    }

    .dashboard-header-title {
      font-size: 24px;
    }

    .dashboard-header-subtitle {
      font-size: 15px;
    }

    .dashboard-header-icon {
      width: 56px;
      height: 56px;
    }

    .dashboard-header-icon svg {
      width: 28px;
      height: 28px;
    }
  }

  @media (max-width: 480px) {
    .dashboard-header {
      padding: 20px 16px;
      margin-bottom: 24px;
    }

    .dashboard-header-left {
      flex-direction: column;
      gap: 16px;
    }

    .dashboard-header-title {
      font-size: 24px;
    }

    .dashboard-header-subtitle {
      font-size: 14px;
    }

    .dashboard-back-btn {
      width: 100%;
      justify-content: center;
      padding: 16px 24px;
    }
  }

  /* Animation for smooth entrance */
  .dashboard-header {
    animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

 

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .dashboard-header {
      border: 2px solid #000;
    }

    .dashboard-header-title {
      -webkit-text-fill-color: #000;
      color: #000;
    }

    .dashboard-back-btn {
      border: 2px solid #fff;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .dashboard-header,
    .dashboard-back-btn,
    .dashboard-back-btn::before {
      animation: none;
      transition: none;
    }
  }
`;

export default DashboardHeaderWrapper;