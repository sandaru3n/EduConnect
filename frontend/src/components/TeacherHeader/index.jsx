import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaRegUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { RiMenu2Fill } from "react-icons/ri";
import Button from "@mui/material/Button";
import { FaRegBell } from "react-icons/fa";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider, Typography } from "@mui/material";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from '../../assets/avatars/thumb-1.jpg';


const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        right: -3,
        top: 13,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: "0 4px",
    },
}));

const TeacherHeader = ({ isSidebarCollapsed, toggleSidebar, isMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [anchorMyacc, setAnchorMyacc] = useState(null);
    const [anchorNotif, setAnchorNotif] = useState(null);
    const [notices, setNotices] = useState([]);
    const [error, setError] = useState(null);

    const handleClickMyacc = (event) => {
        setAnchorMyacc(event.currentTarget);
    };

    const handleCloseMyacc = () => {
        setAnchorMyacc(null);
    };

    const handleClickNotif = (event) => {
        setAnchorNotif(event.currentTarget);
    };

    const handleCloseNotif = () => {
        setAnchorNotif(null);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleProfile = () => {
        handleCloseMyacc();
        navigate("/teacher/edit-profile");
    };

    const handleLogoutClick = () => {
        handleCloseMyacc();
        handleLogout();
    };

    const handleViewNotice = async (noticeId) => {
        if (!noticeId) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.post(`http://localhost:5000/api/auth/admin/notices/${noticeId}/read`, {}, config);
            setNotices(notices.map(notice => 
                notice._id === noticeId ? { ...notice, unread: false } : notice
            ));
            handleCloseNotif();
            navigate(`/teacher/noticesview/${noticeId}`);
        } catch (err) {
            console.error("Error marking notice as read:", err);
            setError(err.response?.data?.message || "Error viewing notice");
        }
    };

    const handleSeeAllNotices = () => {
        handleCloseNotif();
        navigate("/teacher/noticesview");
    };

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get("http://localhost:5000/api/auth/admin/notices/user", config);
                setNotices(data || []);
            } catch (err) {
                console.error("Error fetching notices:", err);
                setError(err.response?.data?.message || "Error fetching notices");
                setNotices([]);
            }
        };
        fetchNotices();
    }, [user.token]);

    const unreadCount = notices.filter(notice => notice?.unread).length;
    const openMyAcc = Boolean(anchorMyacc);
    const openNotif = Boolean(anchorNotif);

    // Default profile picture
    const defaultProfilePicture = backgroundImage;

    return (
        <header
            className={`fixed top-0 left-0 w-full bg-[#fff] shadow-md flex items-center justify-between py-2 px-4 transition-all duration-300 z-40 ${
                isSidebarCollapsed
                    ? "ml-[60px] w-[calc(100%-60px)]"
                    : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
        >
            <div className="part1">
                {!isMobile && (
                    <Button
                        onClick={toggleSidebar}
                        className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px]"
                    >
                        <RiMenu2Fill className="text-[18px] text-[rgba(0,0,0,0.8)]" />
                    </Button>
                )}
            </div>

            <div className="part2 flex items-center justify-end gap-3">
                <div className="relative">
                    <IconButton aria-label="notifications" onClick={handleClickNotif}>
                        <StyledBadge badgeContent={unreadCount} color="secondary">
                            <FaRegBell className="text-[18px]" />
                        </StyledBadge>
                    </IconButton>

                    <Menu
                        anchorEl={anchorNotif}
                        open={openNotif}
                        onClose={handleCloseNotif}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: "visible",
                                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                    mt: 1.5,
                                    maxWidth: 500,
                                    width: "100%",
                                    "&::before": {
                                        content: '""',
                                        display: "block",
                                        position: "absolute",
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: "background.paper",
                                        transform: "translateY(-50%) rotate(45deg)",
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        <MenuItem disabled>
                            <Typography variant="h6">Notifications</Typography>
                        </MenuItem>
                        <Divider />
                        {error ? (
                            <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
                                <Typography variant="body2" color="error">
                                    {error}
                                </Typography>
                            </MenuItem>
                        ) : notices.length > 0 ? (
                            notices.slice(0, 5).map((notice) => (
                                notice && (
                                    <MenuItem
                                        key={notice._id}
                                        onClick={() => handleViewNotice(notice._id)}
                                        sx={{ 
                                            display: "flex", 
                                            flexDirection: "column", 
                                            alignItems: "flex-start", 
                                            py: 1,
                                            bgcolor: notice.unread ? "rgba(0, 128, 0, 0.1)" : "white"
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                            {notice.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            From: {notice.adminId?.name || "Admin"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(notice.createdAt).toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="primary">
                                            View full notification
                                        </Typography>
                                    </MenuItem>
                                )
                            ))
                        ) : (
                            <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
                                <Typography variant="body2" color="text.secondary">
                                    No new notifications
                                </Typography>
                            </MenuItem>
                        )}
                        <Divider />
                        <MenuItem onClick={handleSeeAllNotices} sx={{ justifyContent: "center" }}>
                            <Typography variant="caption" color="primary">
                                See all
                            </Typography>
                        </MenuItem>
                    </Menu>
                </div>

                <div className="relative">
                    <div
                        className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer"
                        onClick={handleClickMyacc}
                    >
                        <img
                            src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : defaultProfilePicture}
                            alt={user?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <Menu
                        anchorEl={anchorMyacc}
                        id="account-menu"
                        open={openMyAcc}
                        onClose={handleCloseMyacc}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: "visible",
                                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                    mt: 1.5,
                                    "& .MuiAvatar-root": {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    "&::before": {
                                        content: '""',
                                        display: "block",
                                        position: "absolute",
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: "background.paper",
                                        transform: "translateY(-50%) rotate(45deg)",
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        <MenuItem onClick={handleCloseMyacc} className="!bg-white">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full w-[35px] h-[35px] overflow-hidden">
                                <img
                            src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : defaultProfilePicture}
                            alt={user?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                                </div>
                                <div className="info">
                                    <h3 className="text-[15px] font-[500] leading-5">{user?.name || "User"}</h3>
                                    <p className="text-[12px] font-[400] opacity-70">{user?.email || "No email"}</p>
                                </div>
                            </div>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleProfile} className="flex items-center gap-3">
                            <FaRegUser className="text-[16px]" />
                            <span className="text-[14px]">Profile</span>
                        </MenuItem>
                        <MenuItem onClick={handleLogoutClick} className="flex items-center gap-3">
                            <IoLogOut className="text-[18px]" />
                            <span className="text-[14px]">Log Out</span>
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        </header>
    );
};

TeacherHeader.propTypes = {
    isSidebarCollapsed: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
};

export default TeacherHeader;