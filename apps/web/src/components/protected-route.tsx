"use client";

import { useState, useEffect } from "react";
import { hashPassBrowser } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "auth_hash";

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        setIsAuthenticated(!!stored);
    }, []);

    const login = async (password: string) => {
        const hash = await hashPassBrowser(password);
        localStorage.setItem(STORAGE_KEY, hash);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, logout };
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, login } = useAuth();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (isAuthenticated === null) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[200px] items-center justify-center p-8">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        await login(password);
                        setLoading(false);
                    }}
                    className="flex w-64 flex-col gap-4"
                >
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </Button>
                </form>
            </div>
        );
    }

    return <>{children}</>;
}
