import { React, useState, useEffect, useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { BsGrid3X3GapFill, BsWifi } from "react-icons/bs";
import {
  AppContainer,
  AppHeader,
  AppContentContainer,
} from "../../pcterp/builder/Index";
import _header from "./data/_header.json";
import ApiService from "../../helpers/ApiServices";
import { UserContext } from "../../components/states/contexts/UserContext";
import EmployeeApp from "../../microapps/employeeApp/Index";
import RoleApp from "../../microapps/roleApp/Index";
import DepartmentApp from "../../microapps/departmentApp/Index";
import LocationApp from "../../microapps/locationApp/Index";
import JobPositionApp from "../../microapps/jobPositionApp/Index";
import CompanyApp from "../../microapps/comapnyApp";
import ForgotPassword from "../../components/pages/authentication/ForgotPassword";
import Import from "../../microapps/importApp/import";

export default function EmployeeModule() {
  const { dispatch, user } = useContext(UserContext);
  const [appNavigationCenter, setAppNavigationCenter] = useState(null);
  const [isAdmin, setisAdmin] = useState(false);
  let array = new Array();

  const getAppNavigationCenter = async () => {
    const response = await ApiService.get(
      "appNavigationCenter/query?navigationCenterType=Employees"
    );
    if (response.data.isSuccess) {
      console.log(response.data.document);
      setAppNavigationCenter(response.data.document);
    }
  };

  useEffect(() => {
    let admin = false;
    getAppNavigationCenter();

    user.roles.map((e) => {
      if (e.name == "Administrator") {
        setisAdmin(true);
        admin = true;
        return;
      }
    });

    console.log(_header.header?.navbar_left?.nav_link);

    if (admin) {
      _header.header?.navbar_left?.nav_link.pop();
    }

    console.log(_header.header?.navbar_left?.nav_link);
  }, []);

  return (
    <AppContainer>
      <AppHeader>
        <Navbar
          className="p-0 m-0"
          collapseOnSelect
          style={{ backgroundColor: "#009999" }}
          variant="dark"
          expand="lg"
        >
          <Container fluid>
            <Navbar.Brand as={Link} to="/">
              <BsGrid3X3GapFill style={{ marginTop: "-5px" }} />
            </Navbar.Brand>
            <Navbar.Brand
              as={Link}
              to={`/${_header && _header.header && _header.header.baseRoute}`}
            >
              {_header && _header?.header?.name}
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                {_header &&
                  _header.header &&
                  _header.header?.navbar_left?.nav_link.map(
                    (navItem, index) => {
                      return (
                        <Nav.Link
                          active
                          key={index}
                          as={Link}
                          to={`${navItem.nav_link_navigation}`}
                        >
                          {navItem.nav_link_name}
                        </Nav.Link>
                      );
                    }
                  )}

                {isAdmin &&
                  _header &&
                  _header.header &&
                  _header.header?.navbar_left?.nav_password.map(
                    (navItem, index) => {
                      return (
                        <Nav.Link
                          active
                          key={index}
                          as={Link}
                          to={`${navItem.nav_link_navigation}`}
                        >
                          {navItem.nav_link_name}
                        </Nav.Link>
                      );
                    }
                  )}

                {_header &&
                  _header.header &&
                  _header.header.navbar_left?.nav_dropdown && (
                    <NavDropdown
                      active
                      title={`${_header.header?.navbar_left?.nav_dropdown?.nav_dropdown_name}`}
                      id="collasible-nav-dropdown"
                    >
                      {_header.header?.navbar_left?.nav_dropdown?.nav_dropdown_items.map(
                        (dropdownItem, index) => {
                          return (
                            <NavDropdown.Item
                              key={index}
                              as={Link}
                              to={`${dropdownItem.item_navigation}`}
                            >
                              {dropdownItem.item_name}
                            </NavDropdown.Item>
                          );
                        }
                      )}
                    </NavDropdown>
                  )}
              </Nav>

              <Nav>
                <Nav.Link href="/">
                  <div
                    style={{
                      backgroundColor: "white",
                      minWidth: "24px",
                      minHeight: "24px",
                      lineHeight: "24px",
                      borderRadius: "50%",
                      color: "black",
                      textAlign: "center",
                    }}
                  >
                    {user?.name[0]}
                  </div>
                </Nav.Link>
                <Nav.Link>{user?.name}</Nav.Link>
                <Nav.Link active>
                  <BsWifi />
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </AppHeader>
      <AppContentContainer>
        <Routes>
          <Route path="/" element={<EmployeeApp />} />
          <Route path="/employees/*" element={<EmployeeApp />} />
          <Route path="/roles/*" element={<RoleApp />} />
          <Route path="/departments/*" element={<DepartmentApp />} />
          <Route path="/locations/*" element={<LocationApp />} />
          <Route path="/jobpositions/*" element={<JobPositionApp />} />
          <Route path="/company/*" element={<CompanyApp />} />
          <Route path="/forgotpassword/*" element={<ForgotPassword />} />
          <Route path="/importemployees/*" element={<Import />} />
        </Routes>
      </AppContentContainer>
    </AppContainer>
  );
}
