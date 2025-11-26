import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        // Check user login
        const isAuthenticated = () => {
            return !!localStorage.getItem("token");
        };

        useEffect(() => {
            if (!isAuthenticated()) {
                router("/auth");
            }
        }, []);

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
