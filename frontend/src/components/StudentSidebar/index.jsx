//frontend/src/components/StudentSidebar/index.js
import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { MdSpaceDashboard } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { MdClass } from "react-icons/md";
import { MdLeaderboard } from "react-icons/md";
import { MdPayments } from "react-icons/md";
import { IoLibrary } from "react-icons/io5";
import { TbMessageFilled } from "react-icons/tb";
import { FaChalkboardTeacher } from "react-icons/fa";
import { SiStudyverse } from "react-icons/si";
import { FaLightbulb } from "react-icons/fa6";
import { SiQuizlet } from "react-icons/si";
import { RiFileReduceFill } from "react-icons/ri";
import { SiSololearn } from "react-icons/si";

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
            to="/student/dashboard"
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

        {/* Class with Submenu */}
        <li>
          <Button
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
            onClick={() => toggleSubmenu(1)}
          >
            <MdClass 
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Class</span>}
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
                    to="/student/dashboard/available-classes"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Available Classes
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/student/dashboard/my-classes"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    My Classes
                  </Button>
                </li>
              </ul>
            </Collapse>
          )}
        </li>


        {/* Study Pack with Submenu */}
        <li>
          <Button
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
            onClick={() => toggleSubmenu(8)}
          >
            <SiStudyverse
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Study Pack</span>}
            {!isCollapsed && (
              <span className="ml-auto">
                <FaAngleDown
                  className={`transition-transform duration-300 ${
                    submenuIndex === 8 ? "rotate-180" : ""
                  }`}
                />
              </span>
            )}
          </Button>

          {/* Submenu with Smooth Collapse */}
          {!isCollapsed && (
            <Collapse
              isOpened={submenuIndex === 8}
              theme={{
                collapse: "ReactCollapse--collapse transition-all duration-300 ease-in-out",
              }}
            >
              <ul className="w-full space-y-1 mt-1">
                <li>
                  <Button
                    component={Link}
                    to="/student/studypacks"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    All Study Packs
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/student/purchased-studypacks"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Purchased Study Packs
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
            to="/student/dashboard/all-teachers"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <FaChalkboardTeacher
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>All Teachers</span>}
          </Button>
        </li>

        {/* Doubt Resolver */}
        <li>
          <Button
            component={Link}
            to="/student/doubt-resolver"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <FaLightbulb
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>AI Doubt Resolver</span>}
          </Button>
        </li>

        {/* Quiz*/}
        <li>
          <Button
            component={Link}
            to="/student/quizlist"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <SiQuizlet
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Quizzes</span>}
          </Button>
        </li>

        {/* Fee Waiver Request*/}
        <li>
          <Button
            component={Link}
            to="/student/fee-waiver"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <RiFileReduceFill
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Apply Fee Waiver</span>}
          </Button>
        </li>

        {/* Learning path generator*/}
        <li>
          <Button
            component={Link}
            to="/student/personalied-path"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <SiSololearn
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>AI Learning Path Gen</span>}
          </Button>
        </li>

        {/* Teachers */}
        <li>
          <Button
            component={Link}
            to="/student/message"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <TbMessageFilled
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Private Message</span>}
          </Button>
        </li>

        {/* Institutes */}
        <li>
          <Button
            component={Link}
            to="/student/library"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <IoLibrary
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Library</span>}
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
            <MdPayments 
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Payment</span>}
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
                    to="/student/dashboard/payment-history"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                     Payment History
                  </Button>
                </li>

                <li>
                  <Button
                    component={Link}
                    to="/student/dashboard/refund-request"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Refund Request
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/student/dashboard/refund-history"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Refund History
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
            to="/student/leaderboard"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <MdLeaderboard
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Leaderboard</span>}
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