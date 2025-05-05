//frontend/src/components/AdminHeader/index.js
import { useState } from "react";
import PropTypes from "prop-types";
import { FaRegUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { RiMenu2Fill } from "react-icons/ri";
import Button from "@mui/material/Button";
import { FaRegBell } from "react-icons/fa";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider } from "@mui/material";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import backgroundImage from '../../assets/avatars/thumb-1.jpg';

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const AdminHeader = ({ isSidebarCollapsed, toggleSidebar, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorMyacc, setAnchorMyacc] = useState(null);

  const handleClickMyacc = (event) => {
    setAnchorMyacc(event.currentTarget);
  };

  const handleCloseMyacc = () => {
    setAnchorMyacc(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    handleCloseMyacc(); // Close menu first
    navigate("/admin/edit-profile");
  };

  const handleLogoutClick = () => {
    handleCloseMyacc(); // Close menu first
    handleLogout();
  };

  const openMyAcc = Boolean(anchorMyacc);

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
        <IconButton aria-label="notifications">
          <StyledBadge badgeContent={4} color="secondary">
            <FaRegBell className="text-[18px]" />
          </StyledBadge>
        </IconButton>

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
                  <h3 className="text-[15px] font-[500] leading-5">{user.name}</h3>
                  <p className="text-[12px] font-[400] opacity-70">{user.email}</p>                 
                </div>
              </div>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfile} className="flex items-center gap-3">
              <FaRegUser className="text-[16px]" />
              <span className="text-[14px]">Profile </span>
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

AdminHeader.propTypes = {
  isSidebarCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default AdminHeader;