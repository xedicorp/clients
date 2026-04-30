import styled from 'styled-components';

export const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background 0.3s ease, color 0.3s ease;

  /* ---------- BODY ---------- */
  .body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* ---------- MAIN CONTENT AREA ---------- */
  .content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--bg-color);
    color: var(--text-color);
    padding: 0;
    box-sizing: border-box;
    transition: background 0.3s ease, color 0.3s ease;
  }

  /* Full-width content (no sidebar) */
  .content.full-width {
    padding: 0;
    margin: 0;
    width: 100%;
  }

  /* ---------- HEADER ---------- */
  .header .brand-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-color);
  }

  /* ---------- HAMBURGER ICON ---------- */
  .hamburger {
    display: none;
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    font-size: 1.4rem;
    transition: color 0.3s ease;

    &:hover {
      color: #21a2a7;
    }
  }

  /* ---------- SIDEBAR MENU ---------- */
  .menu {
    width: 280px;
    background-color: #203351;
    color: #fff;
    transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    border-right: 1px solid rgba(150, 150, 150, 0.2);
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
    .menu-toggle {
  display: flex !important;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #111;
}


  /* ---------- RESPONSIVE BEHAVIOR ---------- */
  @media (max-width: 1024px) {
    .hamburger {
      display: block;
    }

    .menu {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      background-color: var(--card-color);
      transform: translateX(-100%);
      z-index: 999;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
    }

    .menu.open {
      transform: translateX(0);
    }

    .body {
      padding-left: 0 !important;
    }
  }
   
.sidebar {
  width: 280px;
  background: var(--primary-color);
  min-height: 100vh;
  transition: width 0.3s ease !important;
  overflow: auto;
}

/* ===== Modern Scrollbar ===== */

/* Chrome, Edge, Safari */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4); /* light on primary bg */
  border-radius: 10px;
  transition: background 0.3s ease;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}

/* Firefox */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.4) transparent;
}
.sidebar.collapsed {
  width: 80px;
}

/* LOGO */
.sidebar .logo {
  text-align: center;
  padding: 20px 0;
  transition: all 0.3s ease;
}

.sidebar .logo img {
  width: 150px;
  transition: width 0.3s ease;
}

.sidebar.collapsed .logo img {
  width: 45px;
}

/* NAV ITEM */
.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #fff;
  transition: all 0.3s ease;
  cursor:pointer;
}

.nav-item i {
  font-size: 18px;
  min-width: 30px;
  text-align: center;
}

/* TEXT */
.nav-item span {
  margin-left: 0px;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

/* COLLAPSE TEXT HIDE */
.sidebar.collapsed .nav-item span {
  display:none;
}

`;
