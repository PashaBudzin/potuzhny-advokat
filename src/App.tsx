import { createBrowserRouter, RouterProvider } from "react-router";
import TemplateFillerRoute from "./routes/template-filler";
import CreateDogovirRoute from "./routes/create-dogovir";
import HomeRoute from "./routes/home";

const router = createBrowserRouter([
  {
    path: "/template-filler",
    element: <TemplateFillerRoute />,
  },
  {
    path: "/create-dogovir",
    element: <CreateDogovirRoute />,
  },
  {
    path: "/",
    element: <HomeRoute />,
  },
]);

export function App() {
  return (
    <main className="text-text bg-background">
      <RouterProvider router={router} />
      hello,world
    </main>
  );
}

export default App;
