import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import MainPage from "./popup-routes";
import SettingsPage from "./popup-routes/settings";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/trpc";

let router = createMemoryRouter([
    {
        path: "/",
        element: <MainPage />,
    },
    {
        path: "/settings",
        element: <SettingsPage onBack={() => router.navigate("/")} />,
    },
]);

export default function () {
    return (
        <QueryClientProvider client={queryClient}>
            <nav className="flex items-center justify-between p-2">
                <h1 className="font-heading text-xl">Потужний адвокат</h1>
                <Button onClick={() => router.navigate("/settings")}>
                    <Settings className="h-4 w-4" />
                </Button>
            </nav>
            <main>
                <RouterProvider router={router} />
            </main>
        </QueryClientProvider>
    );
}
