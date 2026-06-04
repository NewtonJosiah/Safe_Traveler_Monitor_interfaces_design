import { createBrowserRouter } from "react-router";
import { WelcomePage } from "./components/WelcomePage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import DashboardLayout from "./components/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/app",
    Component: DashboardLayout,
  },
  {
    path: "*",
    Component: WelcomePage,
  },
]);
