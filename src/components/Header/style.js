import styled from 'styled-components';

const Wrapper = styled.div`
  .header-container {
    width: 100%;
    height: 85px;
    background-color: var(--card-color);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(150, 150, 150, 0.15);
    transition: background 0.3s ease, color 0.3s ease, border 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* ---------- LEFT SECTION ---------- */
  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hamburger {
    display: block;
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0;
    margin-right: 0.25rem;
    transition: color 0.3s ease, transform 0.2s ease;

    &:hover {
      color: #21a2a7;
      transform: scale(1.1);
    }

    svg {
      display: block;
    }
  }

  .brand {
    font-size: 1.5rem;
    font-weight: 600;
    color: #21a2a7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
  }

  .brand-logo {
    height: 50px;
    display: flex;
    align-items: center;
  }

  .logo-svg {
    height: 100%;
    width: auto;
  }

  .logo-nav {
    font-size: 120px;
    font-weight: 800;
    fill: #ff6b35;
 
    letter-spacing: -5px;
  }

  .logo-arrow {
    fill: none;
    stroke: #ff6b35;
    stroke-width: 25;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .logo-saar {
    font-size: 120px;
    font-weight: 800;
    fill: #6b1f1f;
    
    letter-spacing: -5px;
  }

  .logo-tagline {
    font-size: 28px;
    font-weight: 400;
    fill: #a85858;
  
    letter-spacing: 8px;
  }

  /* ---------- RIGHT SECTION ---------- */
  .right-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .profile-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #203351;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow:none;
    height: 40px;

    &:hover:not(.disabled) {
      background: #1a2942;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 42, 84, 0.4);
    }

    &:active:not(.disabled) {
      transform: translateY(0);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: linear-gradient(135deg, #9ca3af, #6b7280);
    }

    svg {
      flex-shrink: 0;
    }

    span {
      white-space: nowrap;
      color: #fff;
    }
  }

  .greeting {
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--text-color) 70%, #888);
    white-space: nowrap;
    transition: color 0.3s ease;
  }

  .profile-circle {
   width: 36px;
    background: #203351;
    height: 36px;
    border-radius: 50%;
    border: none;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(33, 162, 167, 0.4);
    }
  }

  /* ---------- PROFILE DROPDOWN ---------- */
  .profile-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    width: 320px;
    background: var(--card-color);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: dropdownSlide 0.3s ease;
    border: 1px solid rgba(33, 162, 167, 0.2);
    right:0;  }

  @keyframes dropdownSlide {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f6f7f8;
    border-radius: 12px 12px 0 0;
  }

  .dropdown-avatar {
    width: 56px;
    height: 56px;
    background: #203351;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 3px solid rgba(33, 162, 167, 0.3);
  }

  .dropdown-user-info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .role-badge {
    display: inline-block;
    margin-top: 0.25rem;
    padding: 0.25rem 0.75rem;
    background: #203351;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dropdown-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(33, 162, 167, 0.3), transparent);
    margin: 0.5rem 0;
  }

  .dropdown-details {
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.75rem;
    color: var(--text-color);
    font-size: 0.9rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(33, 162, 167, 0.05);
    }

    svg {
      color: #203351;
      flex-shrink: 0;
    }

    span {
      word-break: break-word;
    }
  }

  .dropdown-actions {
    padding: 0.75rem 1.5rem 1.5rem;
  }

  .dropdown-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #203351;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(33, 162, 167, 0.3);

    &:hover {
      background: #203351;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 162, 167, 0.4);
    }

    &:active {
      transform: translateY(0);
    }

    svg {
      flex-shrink: 0;
    }
      span{
      color: #fff;}
  }

  /* ---------- RESPONSIVE ---------- */
  @media (max-width: 768px) {
    .greeting {
      display: none;
    }

    .brand {
      font-size: 1rem;
    }

    .brand-logo {
      height: 35px;
    }

    .logo-tagline {
      display: none;
    }

    .profile-circle {
      width: 32px;
      height: 32px;
      font-size: 0.9rem;
    }

    .logout-btn span {
      display: none;
      color: #fff;
    }

    .logout-btn {
      padding: 0.5rem;
      min-width: 40px;
      justify-content: center;
    }

    .profile-dropdown {
      width: 280px;
      right: -10px;
    }

    .dropdown-header {
      padding: 1rem;
    }

    .dropdown-avatar {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }

    .dropdown-details {
      padding: 0.75rem 1rem;
    }

    .detail-item {
      font-size: 0.85rem;
    }
  }
  .logo-img {
    width: auto;
    height: 85px;
}
.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--primary-color);
}

`;

export default Wrapper;
