import styled from "styled-components";

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #edf3fb;
  position: relative;

  /* MAIN BG */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("/src/assets/img/login-bg.png") center/cover no-repeat;
    opacity: 0.75;
    z-index: 0;
  }

  .login-container {
    min-height: 100vh;
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }

  .row {
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  /* LEFT SIDE */
  .login-hero {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;
  }

  .login-hero img {
    width: 100%;
    max-width: 520px;
    object-fit: contain;
    animation: float 4s ease-in-out infinite;
  }

  /* RIGHT SIDE */
  .login-right {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .login-box {
    width: 100%;
    max-width: 500px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-radius: 4px;
    padding: 45px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
  }

  .login-box::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.7),
      rgba(255,255,255,0)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }

  .login-box img {
    max-width: 150px;
    margin-bottom: 10px;
  }

  .login-box h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 10px;
    text-align: center;
  }

  .login-box p {
    text-align: center;
    color: #64748b;
    margin-bottom: 35px;
    font-size: 15px;
  }

  /* INPUT */
  .input-group {
    position: relative;
    margin-bottom: 22px;
  }

  .form-control {
    width: 100%;
    height: 58px;
    border-radius: 14px;
    border: 1px solid #dbe3ef;
    background: #f8fbff;
    padding: 0 18px;
    font-size: 15px;
    color: #1e293b;
    transition: all 0.25s ease;
    box-shadow: none !important;
  }

  .form-control:focus {
    border-color: var(--primary-color);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  }

  .form-control::placeholder {
    color: #94a3b8;
  }

  /* PASSWORD TOGGLE */
  .toggle-password {
    position: absolute;
    top: 50%;
    right: 18px;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font-size: 17px;
    padding: 0;
    z-index: 5;
  }

  .toggle-password:hover {
    color: var(--primary-color);
  }

  /* BUTTON */
  .login-btn {
    width: 100%;
    height: 56px;
    border: none;
    border-radius: 4px;
    background: linear-gradient(
      135deg,
      var(--primary-color),
      #334ea2
    );
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.25s ease;
    margin-top: 10px;
  }

  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(51, 78, 162, 0.25);
  }

  .login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* LOADER */
  .loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
  }

  .loading-container {
    width: 160px;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* ANIMATION */
  @keyframes float {
    0% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(-12px);
    }

    100% {
      transform: translateY(0px);
    }
  }

  /* RESPONSIVE */
  @media (max-width: 992px) {
    .login-hero {
      display: none !important;
    }

    .login-right {
      width: 100%;
      min-height: 100vh;
    }

    .login-box {
      max-width: 100%;
      padding: 35px 25px;
    }
  }

  @media (max-width: 576px) {
    .login-container {
      padding: 15px;
    }

    .login-box {
      border-radius: 20px;
      padding: 28px 20px;
    }

    .login-box h2 {
      font-size: 1.7rem;
    }

    .form-control {
      height: 52px;
    }

    .login-btn {
      height: 52px;
    }
  }
`;

export default Wrapper;