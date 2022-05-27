import { React, useContext, useEffect, useState } from 'react'
import { Button, Container, Form, FormControl, InputGroup, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsSearch, BsWifi, BsWifiOff } from 'react-icons/bs';
// import {
//     BrowserRouter as Router,
//     Routes,
//     Route,
//     Link,
//     useParams,
//     useRouteMatch
// } from "react-router-dom";
import { Link, Routes, Route, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { BsBell, BsGearFill } from 'react-icons/bs'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
// import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import Dashboard from './dashboard/Dashboard';
import './index.css'
import Refund from './refund/Refund';
import Customer from './customer/Customer';
import Payment from './payment/Payment';
import { UserContext } from '../../components/states/contexts/UserContext';
import CustomerList from './customer/CustomerList';
import OrderList from './order/OrderList';
import ShopSession from './session/ShopSession';
import CashInOut from './cashInOut/CashInOut';
import ApiService from '../../helpers/ApiServices';
import { CartContext } from '../../components/states/contexts/CartContext';

import SalesReport from './reports/salesReport/SalesReport';
import CustomersReport from './reports/customersReport/CustomersReport';
import EmployeesReport from './reports/employeesReport/EmployeesReport';
import InventoryReport from './reports/inventory/InventoryReport';
import Order from './order/Order';
// import Refund from './refund/Refund';
// import Order from './order/Order';
// import Customer from './customer/Customer';
// import './dashboard/dashboard.css';



export default function POSRoutes() {
    const [isonline, setisonline] = useState()
    // const { user } = useContext(UserContext);
    // const { dispatch, user } = useContext(UserContext)
    // let { path, url } = useRouteMatch();
    const { dispatch, user } = useContext(UserContext);
    const contextValues = useContext(CartContext);

    const navigate = useNavigate();
    const location = useLocation();
    const url = location?.pathname?.split('/')[0];
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();

    const isAddMode = !id;

    const [searchParams] = useSearchParams();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }

    // const handleLogout = () => {
    //     // dispatch({ type: "LOGOUT_USER" });
    //     console.log("LOGOUT USER...")
    // }


    useEffect(async () => {
        setInterval(function () {
            if (navigator.onLine) {
                setisonline(true)
            } else {
                setisonline(false)
            }
        }, 0);

    }, [isonline]);


    const handleSelect = (eventKey) => console.log(`selected ${eventKey}`);

    const handleAddItemToCart = async () => {
        const value = document.getElementById('barcode').value;
        const response = await ApiService.get(`/product/barcode/${value}`);
        console.log(response);
        if (response.data.isSuccess && response.data.document) {
            console.log(response.data.document);
            contextValues.addProduct(response.data.document);
        }
    }

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        // submit();
        handleAddItemToCart();
    }



    return (
        <Container className="pct-app-container p-0 m-0" fluid style={{ userSelect: 'none' }}>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        {/* <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand> */}
                        <Navbar.Brand as={Link} to={`${url}`}>PCT POS</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto" onSelect={handleSelect}>
                                <Nav.Link active eventKey="cashinout" as={Link} to="/pos/cashinout">Cash In/Out</Nav.Link>
                                <Nav.Link active eventKey="orders" as={Link} to="/pos/orders">Orders</Nav.Link>
                                <NavDropdown title="Reports" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/pos/salesreport`}>Sales Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/pos/customersreport`}>Customers Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/pos/employeesreport`}>Employees Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/pos/inventory`}>Inventory</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <Form onSubmit={handleBarcodeSubmit} className="d-flex">
                                <InputGroup style={{ marginRight: '10px' }} >
                                    <FormControl
                                        placeholder="Bar Code"
                                        aria-label="Bar Code"
                                        aria-describedby="BarCode"
                                        id="barcode"
                                    />
                                    <Button variant="light" type='submit'>
                                        <BsSearch />
                                    </Button>
                                </InputGroup>
                            </Form>
                            <Nav>
                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{`${user?.name?.substr(0, 1) + "" + user?.name?.split(" ")[1].substr(0, 1)}`}</Nav.Link>
                                <NavDropdown title={`${user?.name}`} id="nav-dropdown">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                                {
                                    isonline ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>
                                }
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Routes>
                /*Default*/
                <Route path={`/`} element={<Dashboard />} />
                <Route path={`refund`} element={<Refund />} />
                <Route path={`orders`} element={<OrderList />} />
                <Route path={`order/:id`} element={<Order />} />
                <Route path={`customers`} element={<CustomerList />} />
                <Route path={`customer`} element={<Customer />} />
                <Route path={`customer/:id`} element={<Customer />} />
                <Route path={`payment`} element={<Payment />} />
                <Route path={`cashinout`} element={<CashInOut />} />
                <Route path={`shopsession`} element={<ShopSession />} />
                <Route path={`salesreport`} element={<SalesReport />} />
                <Route path={`customersreport`} element={<CustomersReport />} />
                <Route path={`employeesreport`} element={<EmployeesReport />} />
                <Route path={`inventory`} element={<InventoryReport />} />


                <Route path="*" element={<h1 className="text-center">Not Completed Yet!</h1>} />
            </Routes>
        </Container >
    )
}
