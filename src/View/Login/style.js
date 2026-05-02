import styled from "styled-components";

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow: hidden;

  .login-container {
    min-height: 100vh;
  }

  /* LEFT SIDE */
 .login-hero {
  position: relative;
  background: url("/src/assets/img/login-bg.jpg") center/cover no-repeat;
  color: #fff;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
}
.login-hero img {
  max-width: 100%;
  height: auto;
  filter: brightness(0) saturate(100%) invert(100%) sepia(5%) saturate(7500%) hue-rotate(312deg) brightness(100%) contrast(106%);
  max-width: 400px;
  }
/* Overlay */
.login-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--primary-color);
  opacity: 0.85; /* adjust 0.7 - 0.9 */
  z-index: 1;
}

/* Content must stay above overlay */
.login-hero > * {
  position: relative;
  z-index: 2;
}


  .login-hero h1 {
    font-size: 3.5rem;
    font-weight: 700;
    color:#fff;
  }

  .login-hero p {
    margin-top: 20px;
    font-size: 1.1rem;
    max-width: 400px;
    opacity: 0.9;
  }

  /* RIGHT SIDE */
  .login-right {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
  }

  .login-box {
    width: 100%;
    max-width: 420px;
  }

  .login-box h2 {
    font-weight: 700;
  }

  .input-group {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: none;
    cursor: pointer;
  }

  .login-btn {
    width: 100%;
  }

  @media (max-width: 992px) {
    .login-hero {
      display: none;
    }
  }
    .loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(32, 51, 81, 0.85); /* primary with opacity */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
background-color:transparent;
}

`;

export default Wrapper;
