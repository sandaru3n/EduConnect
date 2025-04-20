//frontend/src/features/dashboard/institute/InstituteDashboard.jsx
import useAuth from "../../../hooks/useAuth";

const InstituteDashboard = () => {
    const user = useAuth();

    return (
        <div>
            <h2>Institute Dashboard</h2>
            <p>Welcome, {user?.name}</p>
            <p>Manage Teachers and Classes here.</p>
        </div>
    );
};

export default InstituteDashboard;
