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
import VendorApp from "../../microapps/vendorApp/Index";
import PurchaseApp from "../../microapps/purchaseApp/Index";
import ProductReceiveApp from "../../microapps/productReceiveApp/Index";
import ProductReceivedApp from "../../microapps/productReceivedApp/Index";
import BillApp from "../../microapps/billApp/Index";
import NewBillApp from "../../microapps/newBillApp/Index";
import BillPaymentApp from "../../microapps/billPaymentApp/Index";
import PurchaseAnalysisApp from "../../microapps/purchaseReportingApp/Index";
import RFQApp from "../../microapps/RFQApp/Index";
import BrandApp from "../../microapps/brandApp";
import GroupMasterApp from "../../microapps/groupMasterApp";
import ProductMasterApp from "../../microapps/productMasterApp";
import Category1App from "../../microapps/category1App";
import Category2App from "../../microapps/category2App";
import SizeApp from "../../microapps/sizeApp";
import SizeListApp from "../../microapps/sizeListApp";
import PriceChartUploadApp from "../../microapps/priceChartUploadApp";
import PriceChartListApp from "../../microapps/priceChartList";
import ImportVendor from "../../microapps/vendorApp/VendorImport";

export default function PurchaseModule() {
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
          <Route path="/" element={<PurchaseApp />} />
          <Route path="/vendors/*" element={<VendorApp />} />
          <Route path="/product/*" element={<ProductApp />} />
          <Route path="/rfqs/*" element={<RFQApp />} />
          <Route path="/purchases/*" element={<PurchaseApp />} />
          <Route path="/receivedproducts/*" element={<ProductReceiveApp />} />
          <Route path={"/received/*"} element={<ProductReceivedApp />} />
          {/* <Route path={"/vendorbills/*"} element={<BillApp />} /> */}
          <Route path={"/bills/*"} element={<NewBillApp />} />
          <Route path={"/billpayment/*"} element={<BillPaymentApp />} />
          <Route path={"/brand/*"} element={<BrandApp />} />
          <Route path={"/groupmaster/*"} element={<GroupMasterApp />} />
          <Route path={"/productmaster/*"} element={<ProductMasterApp />} />
          <Route path={"/category1/*"} element={<Category1App />} />
          <Route path={"/category2/*"} element={<Category2App />} />
          <Route path={"/size/*"} element={<SizeApp />} />
          <Route path={"/sizelist/*"} element={<SizeListApp />} />
          <Route path={"/pricechartlist/*"} element={<PriceChartListApp />} />
          <Route path={"/importvendors/*"} element={<ImportVendor />} />
          <Route
            path={"/pricechartupload/*"}
            element={<PriceChartUploadApp />}
          />
          <Route
            path={"/purchasereportsdashboard/*"}
            element={<PurchaseAnalysisApp />}
          />
        </Routes>
      </AppContentContainer>
    </AppContainer>
  );
}
