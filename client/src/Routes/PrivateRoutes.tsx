import { ReactNode } from "react";
import { Navigate, useLocation, Location } from "react-router-dom";
import Loading from "../components/Loading/Loading";
import useAuth from "../hooks/useAuth";

interface PrivateRoutesProps {
  children: ReactNode;
}

const PrivateRoutes = ({ children }: PrivateRoutesProps) => {
  const { user, loading } = useAuth()

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