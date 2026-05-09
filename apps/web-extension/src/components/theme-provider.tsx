import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import browser from "webextension-polyfill";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
};

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => Promise.resolve(),
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);

    useEffect(() => {
        browser.storage.local.get(storageKey).then((result) => {
            const stored = result[storageKey] as Theme | undefined;
            if (stored) setThemeState(stored);
        });
    }, [storageKey]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const setTheme = useCallback(
        async (newTheme: Theme) => {
            setThemeState(newTheme);
            await browser.storage.local.set({ [storageKey]: newTheme });
        },
        [storageKey],
    );

    const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

    return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
