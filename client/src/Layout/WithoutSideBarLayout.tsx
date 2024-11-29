import { Outlet } from "react-router-dom";
import "../index.css";
import Header from "../components/Shared/Header/Header";

const WithoutSideBarLayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default WithoutSideBarLayout;
