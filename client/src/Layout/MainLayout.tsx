import { Outlet } from "react-router-dom";
import NavBar from "../components/shared/NavBar/NavBar";
import "../index.css";
import Footer from "../components/shared/Footer/Footer";

const Main = () => {
  return (
    <div>
      <NavBar />
      <div className="">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Main;