"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    setPending(false);
    setError(result);
  };

  return (
    <div className="flex min-h-[200px] items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="flex w-64 flex-col gap-4">
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
}