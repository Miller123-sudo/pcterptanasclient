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
import ProductApp from "../../microapps/productApp/Index";
import DepartmentApp from "../../microapps/departmentApp/Index";
import PurchaseApp from "../../microapps/purchaseApp/Index";
import ProductReceiveApp from "../../microapps/productReceiveApp/Index";
import ProductReceivedApp from "../../microapps/productReceivedApp/Index";
import BillApp from "../../microapps/billApp/Index";
import BillPaymentApp from "../../microapps/billPaymentApp/Index";
import PurchaseAnalysisApp from "../../microapps/purchaseReportingApp/Index";
import RFQApp from "../../microapps/RFQApp/Index";
import InventoryAdjustmentApp from "../../microapps/inventoryAdjustmentApp/Index";
import InventoryStockReportApp from "../../microapps/InventoryStockReportApp/Index";
import CategoryApp from "../../microapps/categoryApp/Index";

export default function InventoryModule() {
  const { dispatch, user } = useContext(UserContext);
  const [appNavigationCenter, setAppNavigationCenter] = useState(null);

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
    getAppNavigationCenter();
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
                {_header &&
                  _header.header &&
                  _header.header.navbar_left?.nav_dropdowns &&
                  _header.header?.navbar_left?.nav_dropdowns?.map(
                    (dropdown) => {
                      console.log(dropdown);
                      return (
                        <NavDropdown
                          active
                          title={`${dropdown?.nav_dropdown?.nav_dropdown_name}`}
                          id="collasible-nav-dropdown"
                        >
                          {dropdown?.nav_dropdown?.nav_dropdown_items?.map(
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
                      );
                    }
                  )}
              </Nav>

              <Nav>
                <Nav.Link href="#home">
                  <div
                    style={{
                      backgroundColor: "white",
                      minWidth: "24px",
                      minHeight: "24px",
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
          <Route path="/" element={<InventoryAdjustmentApp />} />
          <Route
            path="/inventoryadjustment/*"
            element={<InventoryAdjustmentApp />}
          />
          <Route path="/product/*" element={<ProductApp />} />
          <Route
            path="/inventorystocksreport/*"
            element={<InventoryStockReportApp />}
          />
          <Route path="/category/*" element={<CategoryApp />} />
        </Routes>
      </AppContentContainer>
    </AppContainer>
  );
}
