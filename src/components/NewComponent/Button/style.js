import styled, { css } from 'styled-components';

const StyledButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'fullWidth',
})`
   

    /* -------- COLOR VARIANTS -------- */

    /* Primary Action Button */
    ${({ variant }) =>
        variant === 'primary' &&
        css`
            background: var(--primary-color);
            color: #fff;
        `}

    /* Secondary / Subtle Button */
  ${({ variant }) =>
        variant === 'secondary' &&
        css`
            background: color-mix(in srgb, var(--card-color) 80%, #747c7c 20%);
            color: var(--text-color);
            &:hover:not(:disabled) {
                background: #747c7c;
            }
        `}

  /* Success / Confirm */
  ${({ variant }) =>
        variant === 'success' &&
        css`
            background: #00b894;
            color: #fff;
            &:hover:not(:disabled) {
                background: #00a382;
            }
        `}

  /* Danger / Destructive */
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
        variant === 'remove' &&
        css`
            background: transparent;
            color: #df364c;
            border: 1px solid #df364c;

            &:hover:not(:disabled) {
                background: rgba(223, 54, 76, 0.1);
            }
        `}

  /* Neutral / Soft Button */
  ${({ variant }) =>
        variant === 'neutral' &&
        css`
            background: color-mix(in srgb, var(--card-color) 70%, #444c63 30%);
            color: var(--text-color);
            &:hover:not(:disabled) {
                filter: brightness(1.1);
            }
        `}

  /* Info Button */
 ${({ variant }) =>
        variant === 'info' &&
        css`
            background: #64748b;
            color: #ffffff;

            &:hover:not(:disabled) {
                background: #7b9cbf;
            }
        `}


  /* Warning Button */
  ${({ variant }) =>
        variant === 'warning' &&
        css`
            background: #e1b12c;
            color: #111;
            &:hover:not(:disabled) {
                background: #d49e1f;
            }
        `}

  /* Outline Variant */
  ${({ variant }) =>
        variant === 'outline' &&
        css`
            background: transparent;
            color: #21a2a7;
            border: 1.5px solid #21a2a7;
            &:hover:not(:disabled) {
                background: rgba(33, 162, 167, 0.1);
            }
        `}

  /* Ghost / Minimal Variant */
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
