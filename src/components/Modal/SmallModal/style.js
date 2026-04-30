import styled from 'styled-components';

const ModalWrapper = styled.div`
  


  /* ---------- HEADER ---------- */
  .modal h3 {
    margin: 0;
    padding: 20px 24px 16px;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    background: #ffffff;
  }

  /* ---------- BODY ---------- */
  .modal-body {
    flex: 1;
    min-width: ${({ $size }) => {
      if ($size === 'compact') return '280px';
      if ($size === 'small') return '300px';
      return '350px';
    }};
    padding: ${({ $size }) => {
      if ($size === 'compact') return '14px 18px 18px 18px';
      if ($size === 'small') return '16px 20px 20px 20px';
      return '20px 30px 30px 30px';
    }};
    overflow-y: auto;
    overflow-x: hidden;
    color: #111827;  
    background: #ffffff;
  }

  /* ---------- SCROLLBAR STYLING ---------- */
  .modal-body::-webkit-scrollbar {
    width: 10px;
  }

  .modal-body::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 5px;
    margin: 5px 0;
  }

  .modal-body::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
    border-radius: 5px;
    border: 2px solid #f1f5f9;
    transition: all 0.3s ease;
  }

  .modal-body::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--primary-color) 0%, #1a8287 100%);
    border-color: #e2e8f0;
  }

  .modal-body::-webkit-scrollbar-thumb:active {
    background: linear-gradient(180deg, #1a8287 0%, #156166 100%);
  }

  .modal label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .modal input,
  .modal select {
    width: 100%;
    padding: 0.6rem;
    border-radius: 6px;
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 0.9rem;
  }

  .modal input:focus,
  .modal select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(33, 162, 167, 0.25);
  }

 

 


  .action-buttons .save {
    background: var(--primary-color);
  }

  .action-buttons .cancel {
    background: #df364c;
  }

  .action-buttons button:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .action-buttons button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(33, 162, 167, 0.3);
  }

  /* ---------- SUPPLIER FORM GRID FIX ---------- */
  .supplier-form {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;

    h4 {
      margin-bottom: 0.6rem;
      color: var(--text-color);
      font-size: 1.1rem;
      font-weight: 600;
      border-bottom: 1px solid rgba(100, 100, 100, 0.3);
      padding-bottom: 0.3rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    input[type='file'] {
      padding: 6px;
      background-color: transparent;
      border: 1px dashed rgba(150, 150, 150, 0.4);
      cursor: pointer;
      transition: border-color 0.3s ease;

      &:hover {
        border-color: var(--primary-color);
      }
    }
  }

  /* ---------- ANIMATION ---------- */
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ---------- RESPONSIVE ---------- */
  @media (max-width: 900px) {
    .modal {
      width: ${({ $size }) => {
        if ($size === 'compact') return '85vw';
        if ($size === 'small') return '88vw';
        return '90vw';
      }};
      min-width: 280px;
    }
  }

  @media (max-width: 600px) {
    .modal {
      width: 92vw;
      min-width: unset;
      max-height: 70vh;
    }

    .modal-body {
      min-width: auto;
      padding: 14px 16px;
    }

    .action-buttons button {
      flex: 1;
      font-size: 0.85rem;
    }

    .modal-actions {
      justify-content: center;
    }
  }

  @media (max-width: 400px) {
    .modal {
      width: 95vw;
      max-height: 80vh;
    }

    .modal-body {
      padding: 12px 14px;
    }

    .modal h3 {
      padding: 16px 18px 14px;
      font-size: 16px;
    }
  }
`;

export default ModalWrapper;
