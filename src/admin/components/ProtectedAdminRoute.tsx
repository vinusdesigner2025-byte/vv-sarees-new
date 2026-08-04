import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

export default function ProtectedAdminRoute() {
  const location = useLocation();

  const hasAdminSession =
    localStorage.getItem(
      "vv-admin-session"
    ) === "true";

  if (!hasAdminSession) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}