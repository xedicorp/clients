import styled, { css } from 'styled-components';

const StyledButton = styled.button`

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

 

  

  /* ---------- RESPONSIVE BUTTON ---------- */
  @media (max-width: 768px) {
    padding: 0.55rem 1rem;  /* slightly smaller */
    font-size: 13.5px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.85rem; /* mobile */
    font-size: 13px;
    gap: 5px;
  }

  @media (max-width: 360px) {
    padding: 0.45rem 0.75rem; /* ultra small phones */
    font-size: 12.5px;
    gap: 4px;
  }

  /* ---------- VARIANTS ---------- */

  ${({ variant }) =>
    variant === 'primary' &&
    css`
      background: var(--primary-color);
      color: #fff;
    `}

  ${({ variant }) =>
    variant === 'secondary' &&
    css`
      background: color-mix(in srgb, var(--card-color) 80%, #747c7c 20%);
      color: var(--text-color);
      &:hover:not(:disabled) {
        background: #747c7c;
      }
    `}

  ${({ variant }) =>
    variant === 'success' &&
    css`
      background: #00b894;
      color: #fff;
      &:hover:not(:disabled) {
        background: #00a382;
      }
    `}

  ${({ variant }) =>
    variant === 'danger' &&
    css`
      background: #df364c;
      color: #fff;
      &:hover:not(:disabled) {
        background: #c52e41;
      }
    `}

  ${({ variant }) =>
    variant === 'neutral' &&
    css`
      background: color-mix(in srgb, var(--card-color) 70%, #444c63 30%);
      color: var(--text-color);
      &:hover:not(:disabled) {
        filter: brightness(1.1);
      }
    `}

  ${({ variant }) =>
    variant === 'info' &&
    css`
      background: #0984e3;
      color: #fff;
      &:hover:not(:disabled) {
        background: #0772c6;
      }
    `}

  ${({ variant }) =>
    variant === 'warning' &&
    css`
      background: #e1b12c;
      color: #111;
      &:hover:not(:disabled) {
        background: #d49e1f;
      }
    `}

  ${({ variant }) =>
    variant === 'outline' &&
    css`
      background: transparent;
      color: var(--primary-color);
      border: 1.5px solid var(--primary-color);
      &:hover:not(:disabled) {
        background: rgba(33, 162, 167, 0.1);
      }
    `}

  ${({ variant }) =>
    variant === 'ghost' &&
    css`
      background: transparent;
      color: color-mix(in srgb, var(--text-color) 80%, #cfd8dc 20%);
      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
      }
    `}
`;

export default StyledButton;
