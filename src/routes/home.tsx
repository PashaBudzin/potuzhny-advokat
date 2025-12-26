import { NavLink } from "react-router";

export default function HomeRoute() {
  return (
    <div>
      <NavLink to="/template-filler" end>
        Template Filler
      </NavLink>
      <br />
      <NavLink to="/create-dogovir" end>
        Створити Договір
      </NavLink>
    </div>
  );
}
