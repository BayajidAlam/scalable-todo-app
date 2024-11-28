import { Outlet } from "react-router-dom";
import "../index.css";
import Header from "../components/Shared/Header/Header";
import SideBar from "../components/Shared/SideBar/SideBar";
import { useState } from "react";

const Main = () => {
  const [isSideBarExpanded, setIsSideBarExpanded] = useState(true);

  const toggleSideBar = () => setIsSideBarExpanded(!isSideBarExpanded);

  return (
    <div>
      <Header toggleSideBar={toggleSideBar} />

      <div className="flex justify-start items-start w-full pt-2">
        <SideBar isSideBarExpanded={isSideBarExpanded}/>
        <Outlet />
      </div>
    </div>
  );
};

export default Main;