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
import CustomerApp from "../../microapps/customerApp/Index";
import SalesApp from "../../microapps/salesOrderApp/Index";
import ProductDeliveryApp from "../../microapps/productDeliveryApp/Index";
import ProductDeliveredApp from "../../microapps/productDeliveredApp/Index";
import InvoiceApp from "../../microapps/invoiceApp/Index";
import InvoicePaymentApp from "../../microapps/invoicePaymentApp/Index";
import Dashboard from "../../microapps/purchaseReportingApp/Dashboard";
import ImportProduct from "../../microapps/productApp/ImportProduct";
import ImportCustomer from "../../microapps/customerApp/CustomerImport";

export default function SalesModule() {
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
          <Route path="/" element={<SalesApp />} />
          <Route path="/salesorders/*" element={<SalesApp />} />
          <Route path="/product/*" element={<ProductApp />} />
          <Route path="/customers/*" element={<CustomerApp />} />
          <Route path="/productdeliveries/*" element={<ProductDeliveryApp />} />
          <Route path="/delivered/*" element={<ProductDeliveredApp />} />
          <Route path="/invoices/*" element={<InvoiceApp />} />
          <Route path="/customerpayments/*" element={<InvoicePaymentApp />} />
          <Route path="/salesanalysis/*" element={<Dashboard />} />
          <Route path="/importproduct/*" element={<ImportProduct />} />
          <Route path="/importcustomers/*" element={<ImportCustomer />} />
          {/* <Route path="/invoicepayment/*" element={<InvoicePaymentApp />} /> */}
        </Routes>
      </AppContentContainer>
    </AppContainer>
  );
}
