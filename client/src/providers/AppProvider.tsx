import  { createContext, useState, ReactNode, useContext } from "react";

interface AppContextProps {
  isSideBarExpanded: boolean;
  toggleSideBar: () => void;
  isListView: boolean;
  toggleListView: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isSideBarExpanded, setIsSideBarExpanded] = useState(true);
  const [isListView, setIsListView] = useState(false);

  const toggleSideBar = () => setIsSideBarExpanded(!isSideBarExpanded);
  const toggleListView = () => setIsListView(!isListView);

  return (
    <AppContext.Provider
      value={{ isSideBarExpanded, toggleSideBar, isListView, toggleListView }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;