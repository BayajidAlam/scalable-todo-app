import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/MainLayout";
import PrivateRoutes from "./PrivateRoutes";
import HomePage from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import RegisterUser from "../pages/RegisterUser/RegisterUser";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoutes>
        <Main />
      </PrivateRoutes>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registration",
    element: <RegisterUser />,
  },
]);