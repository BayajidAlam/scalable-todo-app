import { ReactNode, useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { Navigate, useLocation, Location } from "react-router-dom";
import Loading from "@/components/Loading/Loading";

interface PrivateRoutesProps {
  children: ReactNode;
}

const PrivateRoutes = ({ children }: PrivateRoutesProps) => {
  const { user, loading } = useContext(AuthContext);
  const location: Location = useLocation();

  if (loading) {
    if (loading) return <Loading />;
  }
  if (user) {
    return <>{children}</>;
  }
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoutes;