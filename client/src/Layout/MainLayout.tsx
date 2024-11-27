import { Outlet } from "react-router-dom";
import "../index.css";

const Main = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Main;
