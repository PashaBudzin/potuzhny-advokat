"use server";

import { cookies } from "next/headers";
import { validatePass } from "./auth";

const COOKIE_NAME = "auth_token";

export async function login(passwordHash: string): Promise<boolean> {
    if (!validatePass(passwordHash)) return false;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, passwordHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return true;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    return !!cookieStore.get(COOKIE_NAME)?.value;
}
