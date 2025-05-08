//frontend/src/components/TeacherSidebar/index.js
import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { MdSpaceDashboard } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { MdClass } from "react-icons/md";
import { MdCollectionsBookmark } from "react-icons/md";
import { TbMessageFilled } from "react-icons/tb";
import { IoLibrary } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { BiSupport } from "react-icons/bi";
import { SiStudyverse } from "react-icons/si";
import { SiQuizlet } from "react-icons/si";
import { TfiAnnouncement } from "react-icons/tfi";
import { FaChalkboardTeacher } from "react-icons/fa";

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
              src="../../src/assets/educonnetlogo.png"
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
            to="/institute/dashboard"
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

        {/* Add Teacher */}
        <li>
          <Button
            component={Link}
            to="/institute/add-teacher"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <FaChalkboardTeacher 
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Add Teachers</span>}
          </Button>
        </li>
        
        

        {/* Payment */}
        <li>
          <Button
            component={Link}
            to="/institute/payment-history"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdPayments 
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Payment History</span>}
          </Button>
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
            <BiSolidReport
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Reports</span>}
          </Button>
        </li>

        {/* Notices*/}
        <li>
          <Button
            component={Link}
            to="/institute/notices"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <TfiAnnouncement
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>View Notices</span>}
          </Button>
        </li>

        
         {/* Support */}
        {/* Users with Submenu */}
        <li>
          <Button
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
            onClick={() => toggleSubmenu(5)}
          >
            <BiSupport
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Support</span>}
            {!isCollapsed && (
              <span className="ml-auto">
                <FaAngleDown
                  className={`transition-transform duration-300 ${
                    submenuIndex === 5 ? "rotate-180" : ""
                  }`}
                />
              </span>
            )}
          </Button>

          {/* Submenu with Smooth Collapse */}
          {!isCollapsed && (
            <Collapse
              isOpened={submenuIndex === 5}
              theme={{
                collapse: "ReactCollapse--collapse transition-all duration-300 ease-in-out",
              }}
            >
              <ul className="w-full space-y-1 mt-1">
                <li>
                  <Button
                    component={Link}
                    to="/institute/support-form"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Submit Ticket
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/institute/support-ticket"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    View Support Tickets
                  </Button>
                </li>
              </ul>
            </Collapse>
          )}
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