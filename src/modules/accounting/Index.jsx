import { React, useContext, useEffect, useState } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useParams,
    useLocation
} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import AccountList from './account/AccountList';
import Account from './account/Account';
import GeneralLedgerList from './generalLedger/GeneralLedgerList';
import Invoice from './standaloneInvoice/Invoice';
import InvoiceList from './standaloneInvoice/InvoiceList';
import InvoicePayment from './invoicepayment/InvoicePayment';
import InvoicePaymentList from './standaloneInvoice/InvoicePaymentList';
import BillList from './standaloneBill/BillList';
import Bill from './standaloneBill/Bill';
import BillPaymentList from './billpayment/BillPaymentList';
import BillPayment from './billpayment/BillPayment';
import TrialBalance from '../reporting/TrialBalance';
import Dashboard from '../sales/reporting/Dashboard';
import PaymentList from '../purchase/paymentList/PaymentList';



export default function AccountingRoutes() {
    const [isonline, setisonline] = useState()

    const { dispatch, user } = useContext(UserContext)
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    console.log(rootPath)

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

    }, [isonline]);


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow p-0 m-0" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${"accounting"}`}>Accounting</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">

                                <NavDropdown title="Customers" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/invoices`}>Invoices</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/invoicepayments`}>Payments</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Vendors" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/bills`}>Bills</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/billpayments`}>Payments</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Accounting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/gls`}>General Ledger</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/analysis`}>Inventory Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${"accounting"}/trialbalance`}>Inventory Report</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Settings" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/${"accountings"}/accounts`}>Chart of Accounts</NavDropdown.Item>
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
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Routes>

                /*Default*/
                <Route path={`${rootPath}`} element={<AccountList />} />



                /*Account Routes*/
                <Route path={`${rootPath}/accounts`} element={<h1>Hello</h1>} />


                <Route exact path={`${rootPath}/account`} element={<Account />} />


                <Route exact path={`${rootPath}/account/:id`} element={<Account />} />



                /*Standalone Invoice Routes*/
                <Route path={`${rootPath}/invoices`} element={<InvoiceList />} />


                <Route exact path={`${rootPath}/invoice`} element={<Invoice />} />


                <Route exact path={`${rootPath}/invoicepayments`} element={<InvoicePaymentList />} />


                <Route exact path={`${rootPath}/invoice/:id`} element={<Invoice />} />


                <Route exact path={`${rootPath}/invoicePayment/:id`} element={<InvoicePayment />} />



                /*Standalone Bill Routes*/
                <Route path={`${rootPath}/bills`} element={<BillList />} />


                <Route exact path={`${rootPath}/bill`} element={<Bill />} />


                <Route exact path={`${rootPath}/billpayments`} element={<BillPaymentList />} />


                <Route path={`${rootPath}/bill/billpayments/:id`} element={<PaymentList />} />


                <Route exact path={`${rootPath}/billpayment/:id`} element={<BillPayment />} />


                <Route exact path={`${rootPath}/bill/:id`} element={<Bill />} />



                /*General Ledger List Routes*/
                <Route path={`${rootPath}/gls`} element={<GeneralLedgerList />} />



                /*Inventory Report List Routes*/
                <Route path={`${rootPath}/trialbalance`} element={<TrialBalance />} />



                /*Analysis*/
                <Route path={`${rootPath}/analysis`} element={<Dashboard />} />




            </Routes>


        </Container >
    )
}


