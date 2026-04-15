import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";


interface ProtectedRouteProps{
  children:React.ReactNode;
  allowed:boolean;
}

export function ProtectedRoute({children , allowed}:ProtectedRouteProps){
  const {isAuth , loading , permissions} = useAuth();
  const loaction = useLocation();

  if(loading){
    return <div>Loading ... </div>;
  }
  if(!isAuth){
    return <Navigate to="/login" replace/>
  }
  if(!allowed){
    if(permissions.dashboard)return <Navigate to="/dashboard" replace/>;
    if(permissions.management)return <Navigate to="/management" replace/>;
    return <Navigate to="/leave"replace/>;
  }
  return children
}


interface PublicRouteProps{
  children:React.ReactNode;
}

export function PublicRoute({children}:PublicRouteProps){
  const {isAuth , loading, permissions} = useAuth();

  if(loading){
    return <div>Loading...</div>;
  }
  if(isAuth){
    if(permissions.dashboard)return<Navigate to="/dashboard" replace/>;
    if(permissions.management)return <Navigate to="/management" replace />;
    return <Navigate to="/leave" replace/>;
  }
  return children;
}