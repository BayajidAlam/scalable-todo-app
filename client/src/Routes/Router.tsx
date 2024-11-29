import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/MainLayout";
import PrivateRoutes from "./PrivateRoutes";
import HomePage from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import RegisterUser from "../pages/RegisterUser/RegisterUser";
import TrashPage from "../pages/Trash/TrashPage";
import ArchivePage from "../pages/Archive/ArchivePage";
import { ChangePassword } from "../components/ChangePassword/ChangePassword";
import WithoutSideBarLayout from "../Layout/WithoutSideBarLayout";

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
      {
        path: "/archive",
        element: <ArchivePage />,
      },
      {
        path: "/trash",
        element: <TrashPage />,
      },
    ],
  },
  {
    path: "/user",
    element: (
      <PrivateRoutes>
        <WithoutSideBarLayout />
      </PrivateRoutes>
    ),
    children: [
      {
        path: "/user/change-password",
        element: <ChangePassword />,
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
