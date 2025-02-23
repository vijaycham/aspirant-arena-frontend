import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const user = useSelector((state) => state.user.currentUser); // Get user from Redux state

  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
