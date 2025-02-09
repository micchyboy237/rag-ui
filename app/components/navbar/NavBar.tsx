import { Link, useLocation } from "react-router";
import navRoutes from "~/routes";

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="flex gap-6 p-4 bg-gray-900 text-white">
      {navRoutes.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={`px-4 py-2 rounded-md ${
            location.pathname === path ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
