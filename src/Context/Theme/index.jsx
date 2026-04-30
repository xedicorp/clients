import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    // Force light mode as default
    const [theme, setTheme] = useState(() => {
        // Clear any existing dark theme and set to light
        localStorage.setItem("theme", "light");
        return "light";
    }); 

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
