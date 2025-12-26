import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomeRoute() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Потужний Адвокат
          </h1>
          <p className="text-lg text-gray-600">
            Створюйте юридичні документи швидко та легко
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl">Template Filler</CardTitle>
              <CardDescription>
                Заповнюйте шаблони документів власними даними
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NavLink to="/template-filler" className="block">
                <Button className="w-full">Розпочати</Button>
              </NavLink>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl">Створити Договір</CardTitle>
              <CardDescription>
                Генеруйте договори з персоналізованими даними
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NavLink to="/create-dogovir" className="block">
                <Button className="w-full">Створити</Button>
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
