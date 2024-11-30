import { NavLink } from "react-router-dom";
import { MdLightbulbOutline } from "react-icons/md";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { GoTrash } from "react-icons/go";

const items = [
  {
    name: "Notes",
    link: "/",
    icon: <MdLightbulbOutline />,
  },
  {
    name: "Archive",
    link: "/archive",
    icon: <HiOutlineArchiveBoxArrowDown />,
  },
  {
    name: "Trash",
    link: "/trash",
    icon: <GoTrash />,
  },
];

const SideBar = ({ isSideBarExpanded }: { isSideBarExpanded: boolean }) => {
  return (
    <div
      className={`transition-width duration-300 ${
        isSideBarExpanded ? "w-64" : "w-16"
      } bg-white h-full`}
    >
      <div className="flex justify-start items-start flex-col w-full">
        {items?.map((item, index) => (
          <NavLink
            to={item.link}
            key={index}
            className={({ isActive }: { isActive: boolean }) =>
              `flex justify-start items-center p-2 w-full hover:bg-indigo-100 hover:rounded-r-3xl ${
                isActive
                  ? `bg-[#c7d2fe] rounded-r-3xl text-black font-semibold`
                  : ""
              }`
            }
          >
            <div className="text-xl pl-4">{item.icon}</div>
            {isSideBarExpanded && <span className="ml-4">{item.name}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
