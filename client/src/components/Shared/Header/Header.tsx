import { FiMenu, FiRefreshCcw, FiSettings } from "react-icons/fi";
import { BsViewStacked } from "react-icons/bs";
import { Avatar } from "../../ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface HeaderProps {
  toggleSideBar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSideBar }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleSideBar()}
          className="p-3 rounded-full hover:bg-gray-100"
        >
          <FiMenu size={20} />
        </button>
        <span className="text-xl font-semibold text-gray-700">Reep</span>
      </div>

      {/* Search Section */}
      <div className="flex flex-grow items-center justify-center">
        <div className="flex items-center w-full max-w-lg bg-gray-100 rounded-md px-4 py-2">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-gray-100">
          <FiRefreshCcw size={20} />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <BsViewStacked size={20} />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <FiSettings size={20} />
        </button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;