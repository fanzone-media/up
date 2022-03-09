import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAccount } from 'wagmi';

type ProtectRouteProps = {
    exact: boolean;
    path: RouteProps['path'];
    component: React.ElementType;
};

const ProtectedRoute : React.FC<ProtectRouteProps> = ({ component: Component, path, ...rest }) => {
    
    const [{ data, error }] = useAccount();

    return (
        <Route { ...rest } render = { (props) => (
            data?.address.toLowerCase() === process.env.REACT_APP_OWNER?.toLowerCase() ? <Component {...props}/> : <Redirect to="/mumbai"/>
        )}/>        
    );
}

export default ProtectedRoute;
