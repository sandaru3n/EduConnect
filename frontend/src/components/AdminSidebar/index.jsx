//frontend/src/components/AdminSidebar/index.js
import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { MdSpaceDashboard } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import { RiPagesFill } from "react-icons/ri";
import { SiPlanetscale } from "react-icons/si";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsFillBuildingsFill } from "react-icons/bs";
import { MdPayments } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { TbPresentationAnalyticsFilled } from "react-icons/tb";
import { TbHelpSquareRoundedFilled } from "react-icons/tb";
import { IoLibrary } from "react-icons/io5";
import { TfiAnnouncement } from "react-icons/tfi";


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
            <RiPagesFill 
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
                    to="/admin/pages"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    View All Pages
                  </Button>
                </li>
                <li>
                  <Button
                    component={Link}
                    to="/admin/pages/edit-page/terms"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Edit Terms Page
                  </Button>
                </li>

                <li>
                  <Button
                    component={Link}
                    to="/admin/pages/edit-page/privacy-policy"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Edit Privacy Page
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
            <SiPlanetscale
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Subscription</span>}
          </Button>
        </li>

        {/* Teachers */}
        <li>
          <Button
            component={Link}
            to="/admin/teachers"
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

        {/* Institutes */}
        <li>
          <Button
            component={Link}
            to="/admin/institutes"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <BsFillBuildingsFill
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>All Institutes</span>}
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
                    to="/admin/refund-management"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Class Refund Mangement
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
            to="/admin/analytics"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <TbPresentationAnalyticsFilled
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Analytics</span>}
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
            <TbHelpSquareRoundedFilled 
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
                    to="/admin/support/categories"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Manage Support Categories
                  </Button>
                </li>



                <li>
                  <Button
                    component={Link}
                    to="/admin/support/ticket"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Support Tickets
                  </Button>
                </li>

                <li>
                  <Button
                    component={Link}
                    to="/admin/manage-faqs"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Manage FAQs
                  </Button>
                </li>

                <li>
                  <Button
                    component={Link}
                    to="/admin/manage-knwoledgebase"
                    className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full !text-[13px] !font-[500] !pl-9 flex gap-3 !py-1 hover:!bg-[#fafafa]"
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Manage Knowlwdgebase
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
            <IoLibrary 
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Library</span>}
          </Button>
        </li>

        {/* Publish Notce*/}
        <li>
          <Button
            component={Link}
            to="/admin/notices"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <TfiAnnouncement
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Publish Notice</span>}
          </Button>
        </li>

        {/* Contact message*/}
        <li>
          <Button
            component={Link}
            to="/admin/contact-messages"
            className={`${
              isCollapsed
                ? "!w-[40px] !h-[40px] !min-w-[40px] !p-0 !flex !justify-center"
                : "w-full !justify-start !px-3"
            } !capitalize flex gap-3 !text-[16px] !text-[rgba(0,0,0,0.8)] font-[500] items-center !py-2 hover:!bg-[#fafafa]`}
          >
            <IoLibrary 
              className={`${isCollapsed ? "text-[20px]" : "text-[18px]"} flex-shrink-0`}
            />
            {!isCollapsed && <span>Contact Messages</span>}
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