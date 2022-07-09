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
import AccountApp from "../../microapps/accountApp/Index";
import BillApp from "../../microapps/newBillApp/Index";
import GeneralLedgerApp from "../../microapps/generalLedgerApp/Index";
import InvoiceApp from "../../microapps/invoiceApp/Index";
import InvoicePaymentApp from "../../microapps/invoicePaymentApp/Index";
import BillPaymentApp from "../../microapps/billPaymentApp/Index";
import InventoryStockReportApp from "../../microapps/InventoryStockReportApp/Index";
import VendorApp from "../../microapps/vendorApp/Index";
import BillList from "../../microapps/newBillApp/BillList";
import RtgsApp from "../../microapps/rtgsAPP/Index";
import ChequeApp from "../../microapps/chequeApp/Index";
import AcknoledgeApp from "../../microapps/acknoledgeApp/Index";
import PrintAckPage from "../../microapps/acknoledgeApp/PrintAckPage";

export default function AccountingModule() {
  const { dispatch, user } = useContext(UserContext);
  const [appNavigationCenter, setAppNavigationCenter] = useState(null);

  // const getAppNavigationCenter = async () => {
  //     const response = await ApiService.get('appNavigationCenter/query?navigationCenterType=Employees');
  //     if (response.data.isSuccess) {
  //         console.log(response.data.document)
  //         setAppNavigationCenter(response.data.document);
  //     }
  // }

  useEffect(() => {
    // getAppNavigationCenter();
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
          <Route path="/" element={<BillApp />} />
          <Route path="/accounts/*" element={<AccountApp />} />
          <Route path="/bills/*" element={<BillApp />} />
          <Route path="/billpayment/*" element={<BillPaymentApp />} />
          <Route path="/customerinvoices/*" element={<InvoiceApp />} />
          <Route
            path="/customerinvoicepayments/*"
            element={<InvoicePaymentApp />}
          />
          <Route path="/generalledgers/*" element={<GeneralLedgerApp />} />
          <Route path="/vendor/*" element={<VendorApp />} />
          <Route path="/printrtgs/*" element={<RtgsApp />} />
          <Route path="/printcheque/*" element={<ChequeApp />} />
          <Route path="/printacknoledge/*" element={<AcknoledgeApp />} />
          <Route path="/printacknoledgepage/*" element={<PrintAckPage />} />

          <Route
            path="/inventoryanalysis/*"
            element={<InventoryStockReportApp />}
          />
        </Routes>
      </AppContentContainer>
    </AppContainer>
  );
}
