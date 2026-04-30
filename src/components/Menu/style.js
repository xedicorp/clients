import styled from 'styled-components';

export const Wrapper = styled.div`

&.collapsed .brand-logo img {
    max-width: 100px;
    max-height: 60px;
    transition: all 0.3s ease;
  }
    &.collapsed .nav{
    padding-left:10px;
    }
&.collapsed .nav-item{
justify-content: center;
}
  &.collapsed .nav-item .icon {
    margin-right: 0 !important;
    transform:scale(1.5);
  }
  /* ---------- NAVIGATION ---------- */
  .nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 0.5rem;
    padding-bottom: 60px;
    min-height: 0;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      border-radius: 0rem;
      cursor: pointer;
      color: var(--text-color);
      opacity: 0.85;
      text-decoration: none;
      transition: background 0.25s ease, color 0.25s ease, opacity 0.25s ease;
      flex-shrink: 0;
  

      &:hover {
        background-color: #fff;
        color: #203351;
        opacity: 1;
      }

      &.active {
        background-color: color-mix(in srgb, var(--card-color) 80%, #21a2a7 20%);
        color: #203351;
        font-weight: 600;
      }

      .icon {
        margin-right: 0.75rem;
        font-size: 1.2rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      span {
        font-size: 0.9rem;
        white-space: normal;
        word-wrap: break-word;
        line-height: 1.3;
        color:#fff;
      }
    }
      .nav-item:hover .icon,
.nav-item:hover span {
  color: #203351;
}
  .nav-item.active .icon,
.nav-item.active span {
  color: #203351;
}
  }

  /* ---------- MOBILE RESPONSIVE ---------- */
  @media (max-width: 1024px) {
    &.menu,
    &.menu.open {
      position: fixed;
      top: 64px;
      left: 0;
      width: 320px;
      height: calc(100vh - 64px);
      background-color: var(--card-color);
      z-index: 1000;
      transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    &.menu {
      transform: translateX(-100%);
    }

    &.menu.open {
      transform: translateX(0);
    }

    .nav {
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  @media (max-width: 480px) {
    &.menu,
    &.menu.open {
      width: 280px;
    }
  }
    .brand-logo {
    text-align:center;}
   
    .brand-logo img {
    max-width: 180px;
    margin: auto;
    margin-bottom: 20px;
    max-height: 100px;
    margin-top: 20px;
}

        
`;
