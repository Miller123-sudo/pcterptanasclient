import "./index.css";
import { React, useState, useEffect, useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  NavDropdown,
  Form,
  InputGroup,
  Button,
  FormControl,
} from "react-bootstrap";
import { BsGearFill, BsGrid3X3GapFill, BsSearch, BsWifi } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import {
  AppContainer,
  AppHeader,
  AppContentContainer,
} from "../../pcterp/builder/Index";
import _header from "./data/_header.json";
import ApiService from "../../helpers/ApiServices";
import { UserContext } from "../../components/states/contexts/UserContext";
import Dashboard from "../../pctpos/pages/Dashboard";
import Payment from "../../pctpos/pages/Payment";
import { CartContext } from "../../components/states/contexts/CartContext";
import CashInOut from "../../pctpos/pages/CashInOut";
import OrderList from "../../microapps/cashSaleApp/OrderList";
import SalesReport from "../../pctpos/reports/SalesReport";
import CustomersReport from "../../pctpos/reports/CustomersReport";
import EmployeesReport from "../../pctpos/reports/EmployeesReport";
import InventoryReport from "../../pctpos/reports/InventoryReport";
import Refund from "../../pctpos/pages/Refund";
import CashsaleApp from "../../microapps/cashSaleApp/Index";
import CustomerPOSApp from "../../microapps/customerPOSApp/Index";

export default function POSModule() {
  const { dispatch, user } = useContext(UserContext);
  const [appNavigationCenter, setAppNavigationCenter] = useState(null);
  const contextValues = useContext(CartContext);

  const getAppNavigationCenter = async () => {
    const response = await ApiService.get(
      "appNavigationCenter/query?navigationCenterType=Employees"
    );
    if (response.data.isSuccess) {
      console.log(response.data.document);
      setAppNavigationCenter(response.data.document);
    }
  };

  // const handleAddItemToCart = async () => {
  //     const value = document.getElementById('barcode').value;
  //     const response = await ApiService.get(`/product/barcode/${value}`);
  //     console.log(response);
  //     if (response.data.isSuccess && response.data.document) {
  //         console.log(response.data.document);
  //         contextValues.addProduct(response.data.document);
  //     }
  // }

  const handleAddItemToCart = async () => {
    const value = document.getElementById("barcode").value;
    const response = await ApiService.get(`/product/barcode/${value}`);
    console.log(response);
    if (response.data.isSuccess && response.data.document) {
      console.log(response.data.document);
      const item = response.data.document;
      console.log(contextValues.cartItems);
      const isInCart = contextValues.cartItems.find(
        (cartItem) => cartItem._id === item._id
      )
        ? true
        : false;

      if (isInCart) {
        const cartItemMatchedWithItem = await contextValues.cartItems.filter(
          (cartItem) => cartItem.id === item._id
        );
        const value = parseFloat(
          parseFloat(cartItemMatchedWithItem[0].quantity) + 1.0
        ).toFixed(2);
        contextValues.increaseByValue(item, value);
      } else {
        contextValues.addProduct(item);
      }

      const cartItemMatchedWithItem = await contextValues.cartItems.filter(
        (cartItem) => cartItem.id === item._id
      );
      console.log(cartItemMatchedWithItem);

      document.getElementById("barcode").value = "";
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    // submit();
    handleAddItemToCart();
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
              <Form onSubmit={handleBarcodeSubmit} className="d-flex">
                <InputGroup size="sm" style={{ marginRight: "10px" }}>
                  <FormControl
                    placeholder="Bar Code"
                    aria-label="Bar Code"
                    aria-describedby="BarCode"
                    id="barcode"
                  />
                  <Button variant="light" type="submit">
                    <BsSearch />
                  </Button>
                </InputGroup>
              </Form>

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
                <Nav.Link as={Link} to="/settings">
                  <BsGearFill />
                </Nav.Link>
                <Nav.Link active as={Link} to="/">
                  <HiOutlineLogout />
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </AppHeader>
      <AppContentContainer>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/payment/*" element={<Payment />} />
          <Route path="/cashinout/*" element={<CashInOut />} />
          <Route path="/orders/*" element={<CashsaleApp />} />
          <Route path="/customers/*" element={<CustomerPOSApp />} />
          <Route path="/salesreport/*" element={<SalesReport />} />
          <Route path="/customersreport/*" element={<CustomersReport />} />
          <Route path="/employeesreport/*" element={<EmployeesReport />} />
          <Route path="/inventory/*" element={<InventoryReport />} />
          <Route path="/refund/*" element={<Refund />} />
        </Routes>
      </AppContentContainer>
    </AppContainer>
  );
}
