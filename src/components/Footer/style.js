import styled from 'styled-components';

const Wrapper = styled.div`
  /* ---------- FOOTER CONTAINER ---------- */
  .footer-container {
    width: 100%;
    background-color: var(--card-color);
    color: var(--text-color);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    box-sizing: border-box;
    flex-wrap: wrap;
    gap: 1rem;
    border-top: 1px solid rgba(150, 150, 150, 0.15);
    transition: background 0.3s ease, color 0.3s ease, border 0.3s ease;
  }

  .footer-left,
  .footer-right {
    white-space: nowrap;
    color: color-mix(in srgb, var(--text-color) 80%, #aaa);
  }

  /* ---------- CENTER LINKS ---------- */
  .footer-center {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;

    .footer-link {
      cursor: pointer;
      color: var(--text-color);
      opacity: 0.9;
      transition: color 0.3s ease, opacity 0.3s ease;

      &:hover {
        color: #00b894;
        opacity: 1;
      }
    }

    .footer-support {
      color: var(--primary-color);
      font-weight: 500;

      &:hover {
        color: #00b894;
      }
    }
  }

  /* ---------- MODAL BACKDROP ---------- */
  .footer-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  /* ---------- FOOTER MODAL ---------- */
  .footer-modal {
    background: var(--card-color);
    color: var(--text-color);
    border-radius: 12px;
    padding: 2rem;
    padding-top: 0;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    position: relative;
    transition: background 0.3s ease, color 0.3s ease;

    h2 {
      color: #00b894;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    h3 {
      margin-top: 1rem;
      color: color-mix(in srgb, var(--text-color) 75%, #999);
      font-size: 1.1rem;
    }

    p {
      font-size: 1rem;
      line-height: 1.6;
      margin-top: 0.4rem;
      color: var(--text-color);
    }

    a {
      color: var(--primary-color);
      text-decoration: underline;

      &:hover {
        color: #00b894;
      }
    }
  }

  /* ---------- CLOSE BUTTON ---------- */
  .modal-close-btn {
    margin-top: 1.5rem;
    padding: 0.6rem 1.2rem;
    background: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: block;
    margin-left: auto;
    margin-right: auto;
    transition: background 0.3s ease, transform 0.2s ease;

    &:hover {
      background: #00b894;
      transform: translateY(-1px);
    }
  }

  /* ---------- RESPONSIVE DESIGN ---------- */
  @media (max-width: 768px) {
    .footer-container {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem;
      gap: 0.5rem;
    }

    .footer-left {
      font-size: 0.9rem;
      color: color-mix(in srgb, var(--text-color) 75%, #aaa);
    }

    .footer-right {
      display: none;
    }

    .footer-center {
      gap: 1rem;

      .footer-link:hover {
        color: #00b894;
      }

      .footer-support {
        color: var(--primary-color);

        &:hover {
          color: #00b894;
        }
      }
    }

    .footer-modal {
      padding: 1.2rem;
      max-width: 95vw;
      font-size: 0.9rem;

      h2 {
        font-size: 1.3rem;
      }

      h3 {
        font-size: 1rem;
      }

      p {
        font-size: 0.9rem;
      }
    }

    .modal-close-btn {
      font-size: 0.95rem;
      padding: 0.5rem 1rem;
    }
  }
`;

export default Wrapper;
