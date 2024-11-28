import { Outlet } from "react-router-dom";
import "../index.css";
import Header from "../components/Shared/Header/Header";
import SideBar from "../components/Shared/SideBar/SideBar";
import { useAppContext } from "../providers/AppProvider";

const Main = () => {
  
  const { isSideBarExpanded } = useAppContext();

  return (
    <div>
      <Header />

      <div className="flex justify-start items-start w-full pt-2">
        <SideBar isSideBarExpanded={isSideBarExpanded} />
        <Outlet />
      </div>
    </div>
  );
};

export default Main;
