import { FiMenu, FiSettings } from "react-icons/fi";
import { BsViewStacked } from "react-icons/bs";
import { Avatar } from "../../ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { BsGrid } from "react-icons/bs";
import { useAppContext } from "../../../providers/AppProvider";
import { useCallback } from "react";
import { debounce } from "lodash";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const Header = () => {
  const { toggleSideBar, isListView, toggleListView, setSearchTerm } =
    useAppContext();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 500),
    [setSearchTerm]
  );

  const { logOutUser } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
      {/* Previous sections remain unchanged */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleSideBar()}
          className="p-3 rounded-full hover:bg-gray-100"
        >
          <FiMenu size={20} />
        </button>
        <span className="text-xl font-semibold text-gray-700">SimplyDone</span>
      </div>

      <div className="flex flex-grow items-center justify-center">
        <div className="flex items-center w-full max-w-lg bg-gray-100 rounded-md px-4 py-2">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-transparent outline-none text-gray-700"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleListView()}
          className="p-2 rounded hover:bg-gray-100"
        >
          {isListView ? <BsGrid size={20} /> : <BsViewStacked size={20} />}
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-100">
              <FiSettings size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2 mt-3">
            <Link to="/user/change-password">
              <button className="w-full text-left px-3 p text-sm hover:bg-gray-100 rounded-md">
                Forgot Password
              </button>
            </Link>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-20 p-2 mt-3 mr-4">
            <button
              onClick={logOutUser}
              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded-md text-red-600"
            >
              Logout
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default Header;
