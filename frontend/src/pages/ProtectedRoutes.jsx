import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/FakeAuthContext";

function ProtectedRoutes({ children }) {
  const { isAuthenticated } = useAuth();

  return <>{isAuthenticated ? children : <Navigate to={"/"} />}</>;
}

export default ProtectedRoutes;
