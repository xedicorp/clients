// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import translation JSONs (you can also load via http backend)
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
            zh: { translation: zh },
        },
        fallbackLng: "en",
        supportedLngs: ["en", "ar", "zh"],
        lng: localStorage.getItem("app_lang") || "en",
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });

export default i18n;
