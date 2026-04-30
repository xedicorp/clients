import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --bg-color: #ebedf1ff;
    --card-color: #ffffff;
    --text-color: #1a1f29;
    --accent-color: #007a7e;
  }

  [data-theme="dark"] {
    --bg-color: #0e141b;
    --card-color: #1a2432;
    --text-color: #e3e9ef;
    --accent-color: var(--primary-color);
  }

  [data-theme="light"] {
    --bg-color: #f5f7fa;
    --card-color: #ffffff;
    --text-color: #1a1f29;
    --accent-color: #007a7e;
  }

  body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background 0.3s ease, color 0.3s ease;
    font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-weight: 400;
  }
`;
