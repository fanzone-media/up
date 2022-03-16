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
    const adminAddresses = process.env.REACT_APP_OWNER_ACCOUNTS?.split(",");
    const isAdmin = data && adminAddresses?.includes(data.address)

    return (
        <Route { ...rest } render = { (props) => (
            isAdmin ? <Component {...props}/> : <Redirect to="/mumbai"/>
        )}/>        
    );
}

export default ProtectedRoute;
