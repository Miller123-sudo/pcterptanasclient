import { React, useContext, useState, useEffect } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { findInitLetters } from '../../helpers/Utils';

import { UserContext } from '../../components/states/contexts/UserContext';
import SalesOrderList from './salesOrder/SalesOrderList';
import SalesOrder from './salesOrder/SalesOrder';
import Customer from './customer/Customer';
import CustomerList from './customer/CustomerList';
import ProductList from './product/ProductList';
import Product from './product/Product';
import ProductDeliveryList from './productDelivery/ProductDeliveryList';
import ProductDelivery from './productDelivery/ProductDelivery';
import InvoiceList from './invoice/InvoiceList';
import Invoice from './invoice/Invoice';
import InvoicePaymentList from './invoicePayment/InvoicePaymentList';
import InvoicePayment from './invoicePayment/InvoicePayment';
import InvoicedList from './invoiced/InvoicedList';
import DeliveredProductList from './delivered/DeliveredProductList';
import TrialBalance from '../reporting/TrialBalance';
import Dashboard from './reporting/Dashboard';

import OutstandingSOReport from './reporting/OutstandingSOReport';
import OutstandingDeliveryReport from './reporting/OutstandingDeliveryReport';
import OutstandingInvoicesReport from './reporting/OutstandingInvoicesReport (1)';
import SalesOrderReport from './reporting/SalesOrderReport';
import DeliveriesReport from './reporting/DeliveriesReport';
import InvoicesReport from './reporting/InvoicesReport';
import CashSaleList from './cashSale/CashSaleList';
import Login from '../../components/pages/login/Login';
import axios from "axios"
import ApiService from '../../helpers/ApiServices';
const moment = require('moment');




export default function SalesRoutes() {
    const [isonline, setisonline] = useState()
    const [newuser, setnewuser] = useState([])
    const { user, dispatch } = useContext(UserContext)

    let { path, url } = useRouteMatch();
    let days = "";
    let hr = "";
    let min = "";
    let sec = "";

    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }

    useEffect(async () => {
        setInterval(function () {
            if (navigator.onLine) {
                setisonline(true)
            } else {
                setisonline(false)
            }
        }, 0);

    }, []);
    console.log(moment.duration(moment(new Date(user?.currentLoginTime)).diff(moment(new Date(user?.previousLoginTime)))));
    const diff = moment.duration(moment(new Date(user?.currentLoginTime)).diff(moment(new Date(user?.previousLoginTime))))
    if (diff._data?.days < 0) {
        days = diff._data?.days * -1
    } else {
        days = diff._data?.days
    }
    if (diff._data?.hours < 0) {
        hr = diff._data?.hours * -1
    } else {
        hr = diff._data?.hours
    }
    if (diff._data?.minutes < 0) {
        min = diff._data?.minutes * -1
    } else {
        min = diff._data?.minutes
    }
    if (diff._data?.seconds < 0) {
        sec = diff._data?.seconds * -1
    } else {
        sec = diff._data?.seconds
    }
    console.log("diff(moment): ", `${days} days ${hr} hours ${min} minutes`)

    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow p-0 m-0" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}/orders`}>Sales</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/orders`}>Sales Orders</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/cashsales`}>Cash Sales</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/productDeliveries`}>Delivered Product</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Customers" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/customers`}>Customers</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/invoices`}>Customer Invoices</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/invoicepayments`}>Customer Payments</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/sales/products`}>Products</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/sales/analysis`}>Sales Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/trialbalance`}>Sales Reporting</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/salesorderreport`}>Sales Order Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/deliveryreport`}>Delivery Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/invoicesreport`}>Invoice Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/outstandingsoreport`}>Outstanding SO Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/outstandingdeliveryreport`}>Outstanding Delivery Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/outstandinginvoicesreport`}>Outstanding Invoices Report</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <Nav>

                                <Nav.Link href="#home">
                                    <div style={{ backgroundColor: 'white', minWidth: '24px', minHeight: '24px', borderRadius: '50%', color: 'black', textAlign: 'center' }}>{user?.name?.charAt(0)}</div>
                                </Nav.Link>

                                {
                                    isonline ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>
                                }

                                <NavDropdown title={user?.name} id="nav-dropdown" align="end">
                                    <NavDropdown.Item className="d-grid gap-2" >
                                        <Button onClick={handleLogout} variant="primary" size="sm" >Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>

                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

                /*Default*/
                <Route exact path={`${path}`}>
                    <SalesOrderList />

                </Route>

                /**Cash Sales Routes */
                <Route path={`${path}/cashsales`}>
                    <CashSaleList />
                </Route>
                /*Sales Order Routes*/
                <Route path={`${path}/orders`}>
                    <SalesOrderList />

                </Route>
                <Route exact path={`${path}/order`}>
                    <SalesOrder />
                </Route>
                <Route exact path={`${path}/order/:id`}>
                    <SalesOrder />
                </Route>

                /*Customer Routes*/
                <Route path={`${path}/customers`}>
                    <CustomerList />
                </Route>
                <Route exact path={`${path}/customer`}>
                    <Customer />
                </Route>
                <Route exact path={`${path}/customer/:id`}>
                    <Customer />
                </Route>

                /*Customer Invoice Routes*/
                <Route path={`${path}/invoices`}>
                    <InvoiceList />
                </Route>
                <Route exact path={`${path}/invoice`}>
                    <Invoice />
                </Route>
                <Route exact path={`${path}/invoice/:id`}>
                    <Invoice />
                </Route>

                /*Invoice Payment Routes*/
                <Route path={`${path}/invoicepayments`}>
                    <InvoicePaymentList />
                </Route>
                <Route exact path={`${path}/invoicepayment`}>
                    <InvoicePayment />
                </Route>
                <Route exact path={`${path}/invoicepayment/:id`}>
                    <InvoicePayment />
                </Route>

                /*Product Routes*/
                <Route path={`${path}/products`}>
                    <ProductList />
                </Route>
                <Route exact path={`${path}/product`}>
                    <Product />
                </Route>
                <Route exact path={`${path}/product/:id`}>
                    <Product />
                </Route>

                /*Product Delivery Routes*/
                <Route path={`${path}/productdeliveries`}>
                    <ProductDeliveryList />
                </Route>
                <Route exact path={`${path}/productdelivery`}>
                    <ProductDelivery />
                </Route>
                <Route exact path={`${path}/productdelivery/:id`}>
                    <ProductDelivery />
                </Route>

                /*Reporting Routes*/
                <Route path={`${path}/salesorderreport`}><SalesOrderReport /> </Route>
                <Route path={`${path}/deliveryreport`}><DeliveriesReport /></Route>
                <Route path={`${path}/invoicesreport`}> <InvoicesReport /></Route>
                <Route path={`${path}/outstandingsoreport`}> <OutstandingSOReport /></Route>
                <Route path={`${path}/outstandingdeliveryreport`}> <OutstandingDeliveryReport /></Route>
                <Route path={`${path}/outstandinginvoicesreport`}> <OutstandingInvoicesReport /></Route>


                {/* <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>
                <Route path={`${path}/reporting`}>
                    <Reporting />
                </Route>

                */}
                <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>

                <Route exact path={`${path}/delivered/:id`}>
                    <DeliveredProductList />
                </Route>
                <Route exact path={`${path}/invoiced/:id`}>
                    <InvoicedList />
                </Route>



                /*Inventory Report List Routes*/
                <Route path={`${path}/trialbalance`}>
                    <TrialBalance />
                </Route>

                /*Analysis*/
                <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>

                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>














            </Switch>


        </Container >
    )
}
