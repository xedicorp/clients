// import './styles/variables.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ThemeProvider from "./Context/Theme";

// Demo authentication is now handled manually - no auto-login

createRoot(document.getElementById('root')).render(
    <ThemeProvider>
        <App />
    </ThemeProvider>
);