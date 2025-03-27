import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { MdSpaceDashboard } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";

const AdminSidebar = ({ isCollapsed}) => {
  const [submenuIndex, setSubmenuIndex] = useState(null);

  const toggleSubmenu = (index) => {
    if (isCollapsed) return; // Prevent submenu toggle when sidebar is collapsed
    setSubmenuIndex(submenuIndex === index ? null : index);
  };

  return (
    <div
      className={`sidebar fixed top-0 left-0 bg-[#fff] h-full border-r border-[rgba(0,0,0,0.1)] transition-all duration-300 z-50 ${
        isCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
      }`}
    >
      {/* Logo Section - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="py-2 w-full flex justify-center">
          <Link to="/admin/dashboard">
            <img
              src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
              alt="Logo"
              className="w-[120px] transition-all duration-300"
            />
          </Link>
        </div>
      )}

      {/* Menu Items */}
      <ul className="space-y-1">
        {/* Dashboard */}
        <li>
          <Button
            component={Link}
            to="/admin/dashboard"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Dashboard</span>}
          </Button>
        </li>

        {/* Users with Submenu */}
        <li>
          <Button
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
            onClick={() => toggleSubmenu(1)}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Pages</span>}
            {!isCollapsed && (
              <span className="ml-auto">
                <FaAngleDown
                  className={`transition-transform duration-300 ${
                    submenuIndex === 1 ? "rotate-180" : ""
                  }`}
                />
              </span>
            )}
          </Button>

          {/* Submenu with Smooth Collapse */}
          {!isCollapsed && (
            <Collapse
              isOpened={submenuIndex === 1}
              theme={{
                collapse: "ReactCollapse--collapse transition-all duration-300 ease-in-out",
              }}
            >
              <ul className="w-full space-y-1 mt-1">
                <li>
                  <Button
                    component={Link}
                    to="/admin/users/add"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add User
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/admin/users/list"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    User List
                  </Button>
                </li>
              </ul>
            </Collapse>
          )}
        </li>

        {/* Support */}
        <li>
          <Button
            component={Link}
            to="/admin/subscription"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Subscription</span>}
          </Button>
        </li>

        {/* Teachers */}
        <li>
          <Button
            component={Link}
            to="/logout"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Teachers</span>}
          </Button>
        </li>

        {/* Students */}
        <li>
          <Button
            component={Link}
            to="/logout"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Students</span>}
          </Button>
        </li>

        {/* Institutes */}
        <li>
          <Button
            component={Link}
            to="/logout"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Institutes</span>}
          </Button>
        </li>

        {/* Payment */}
        {/* Users with Submenu */}
        <li>
          <Button
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
            onClick={() => toggleSubmenu(2)}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Payments</span>}
            {!isCollapsed && (
              <span className="ml-auto">
                <FaAngleDown
                  className={`transition-transform duration-300 ${
                    submenuIndex === 2 ? "rotate-180" : ""
                  }`}
                />
              </span>
            )}
          </Button>

          {/* Submenu with Smooth Collapse */}
          {!isCollapsed && (
            <Collapse
              isOpened={submenuIndex === 2}
              theme={{
                collapse: "ReactCollapse--collapse transition-all duration-300 ease-in-out",
              }}
            >
              <ul className="w-full space-y-1 mt-1">
                <li>
                  <Button
                    component={Link}
                    to="/admin/users/add"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add User
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/admin/users/list"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    User List
                  </Button>
                </li>
              </ul>
            </Collapse>
          )}
        </li>


        {/* Reports*/}
        <li>
          <Button
            component={Link}
            to="/logout"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Reports</span>}
          </Button>
        </li>

        {/* Discounts*/}
        <li>
          <Button
            component={Link}
            to="/logout"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Discounts</span>}
          </Button>
        </li>


        {/* Support Ticket */}
        {/* Users with Submenu */}
        <li>
          <Button
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
            onClick={() => toggleSubmenu(3)}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Help Center</span>}
            {!isCollapsed && (
              <span className="ml-auto">
                <FaAngleDown
                  className={`transition-transform duration-300 ${
                    submenuIndex === 3 ? "rotate-180" : ""
                  }`}
                />
              </span>
            )}
          </Button>

          {/* Submenu with Smooth Collapse */}
          {!isCollapsed && (
            <Collapse
              isOpened={submenuIndex === 3}
              theme={{
                collapse: "ReactCollapse--collapse transition-all duration-300 ease-in-out",
              }}
            >
              <ul className="w-full space-y-1 mt-1">
                <li>
                  <Button
                    component={Link}
                    to="/admin/users/add"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Support Tickets
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/admin/users/list"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Knowledgbase
                  </Button>
                </li>
              </ul>
            </Collapse>
          )}
        </li>

        {/* Library*/}
        <li>
          <Button
            component={Link}
            to="/admin/library"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Library</span>}
          </Button>
        </li>

        {/* Study Pack*/}
        <li>
          <Button
            component={Link}
            to="/component/studyPacks"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdSpaceDashboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Study Pack</span>}
          </Button>
        </li>
        
      </ul>
    </div>
  );
};

// PropTypes Validation
AdminSidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default AdminSidebar;