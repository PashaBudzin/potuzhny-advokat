"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth-server";
import { hashPassServer } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<string> {
    const password = formData.get("password") as string;

    if (!password) {
        return "Password required";
    }

    const hash = hashPassServer(password);
    const success = await login(hash);

    if (!success) {
        return "Invalid password";
    }

    redirect("/dashboard");
    return "success";
}
