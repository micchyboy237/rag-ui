import { lazy } from "react";
import { type RouteConfig } from "@react-router/dev/routes";

export const navRoutes = [
  { path: "/", file: "routes/nodes.tsx", label: "Nodes" },
  { path: "/query", file: "routes/query.tsx", label: "Query" },
];

export default navRoutes satisfies RouteConfig;
