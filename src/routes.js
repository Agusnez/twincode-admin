import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Lobby from "./pages/Lobby";
import Playground from "./pages/Playground";
import Admin from "./pages/Admin";
import PageNotFound from "./pages/PageNotFound";

const routes = [
  {
    path: "/",
    component: Login,
    name: "Login",
    meta: { title: "Login - Twincode" },
  },
  {
    path: "/signup",
    component: Signup,
    name: "Signup",
    meta: { title: "Signup - Twincode" },
  },
  {
    path: "/lobby",
    component: Lobby,
    name: "Lobby",
    meta: { title: "Lobby - Twincode" },
  },
  {
    path: "/administration",
    component: Admin,
    name: "Administration",
    meta: { title: "Admin console - Twincode" },
  },
  {
    path: "/rooms/:mode/:rid",
    component: Playground,
    name: "Playground",
    meta: { title: "Twincode" },
  },
  {
    path: "*",
    component: PageNotFound,
    name: "404",
    meta: { title: "Not found" },
  },
];

export default routes;
