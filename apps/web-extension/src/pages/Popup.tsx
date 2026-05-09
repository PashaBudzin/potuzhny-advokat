import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import MainPage from "./popup-routes";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/trpc";

let router = createMemoryRouter([
    {
        path: "/",
        element: <MainPage />,
    },
]);

export default function () {
    return (
        <QueryClientProvider client={queryClient}>
            <nav>
                <h1 className="font-heading text-xl text-center">Потужний адвокат</h1>
                <Button>
                    {/* @ts-ignore */}
                    <Settings />
                </Button>
            </nav>
            <main>
                <RouterProvider router={router} />
            </main>
        </QueryClientProvider>
    );
}
