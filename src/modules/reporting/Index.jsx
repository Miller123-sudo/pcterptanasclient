import { React, useContext } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import ReportingDashboard from './ReportingDashboard';
import InventoryStocksReport from './InventoryStocksReport';
import OutstandingInvoicesReport from './OutstandingInvoicesReport';
import OutstandingBillsReport from './OutstandingBillsReport';
import TrialBalance from './TrialBalance';






function ReportingRoutes() {
    const { user } = useContext(UserContext)
    let { path, url } = useRouteMatch();
    console.log(path)

    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}`}>Reporting</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                {/* <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/rfq`}>Requests for Quatation</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/orders`}>Purchase Orders</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/receivedproducts`}>Received Products</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/vendors`}>Vendors</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/bills`}>Vendor Bills</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Products</NavDropdown.Item>
                                </NavDropdown> */}
                                <NavDropdown title="Reports" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/reporting/inventorystocksreport`}>Inventory Stocks Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Outstanding Bills Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/reporting/outstandinginvoicesreport`}>Outstanding Invoices Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/reporting/trialbalance`}>Trial Balance</NavDropdown.Item>
                                    {/* <NavDropdown.Item as={Link} to={`/purchase/reporting`}>Purchase Analysis</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item> */}
                                </NavDropdown>
                                {/* <NavDropdown title="Configuration" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Settings</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/vendorsettingslist`}>Vendor Settings</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to={`/purchase/productcategories`}>Products Categories</NavDropdown.Item>
                                </NavDropdown> */}
                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: 'white', color: 'black', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <Nav.Link >{user.name}</Nav.Link>
                                <Nav.Link as={Link} to="/notification"><BsBell /></Nav.Link>
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>
                {/* <Route exact path={path}>
                    <Container className="pct-app-content-container p-0 m-0" fluid>
                        <Container className="pct-app-content" fluid>
                            <Container className="pct-app-content-header p-0 m-0" fluid>
                                <h1>Content Header</h1>
                            </Container>
                            <Container className="pct-app-content-body p-0 m-0" fluid>
                                <Button as={Link} to={`${path}/testing`}>Testing</Button>
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                                <h1>Content Body</h1><br />
                            </Container>
                        </Container>

                    </Container>
                </Route> */}

                <Route exact path={`${path}`}>
                    <ReportingDashboard />
                </Route>

                <Route exact path={`${path}/inventorystocksreport`}>
                    <InventoryStocksReport />
                </Route>


                <Route path={`${path}/outstandingbillsreport`}>
                    <OutstandingBillsReport />
                </Route>

                <Route path={`${path}/outstandinginvoicesreport`}>
                    <OutstandingInvoicesReport />
                </Route>
                <Route path={`${path}/trialbalance`}>
                    <TrialBalance />
                </Route>
                {/* 
                <Route exact path={`${path}/vendor/:id`}>
                    <AddEditViewVendor />
                </Route>
                <Route path={`${path}/products`}>
                    <ProductList />
                </Route>
                <Route exact path={`${path}/product`}>
                    <AddEditProduct />
                </Route>
                <Route exact path={`${path}/product/:id`}>
                    <AddEditViewProduct />
                </Route>

                <Route path={`${path}/orders`}>
                    <PurchaseOrderList />
                </Route>
                <Route exact path={`${path}/order`}>
                    <AddEditViewPurchaseOrder />
                </Route>
                <Route exact path={`${path}/order/:id`}>
                    <AddEditViewPurchaseOrder />
                </Route>

                <Route path={`${path}/receivedproducts`}>
                    <ReceivedProductList />
                </Route>
                <Route exact path={`${path}/receivedproduct/:id`}>
                    <AddEditViewReceivedProduct />
                </Route>
                <Route path={`${path}/vendorbills`}>
                    <BillList />
                </Route>
                <Route exact path={`${path}/bill`}>
                    <AddEditViewBill />
                </Route>
                <Route exact path={`${path}/bill/:id`}>
                    <AddEditViewBill />
                </Route>

                <Route path={`${path}/reporting`}>
                    <PurchaseReporting />
                </Route>
                <Route path={`${path}/dashboard`}>
                    <PurchaseDashboard />
                </Route>

                <Route path={`${path}/productcategories`}>
                    <ProductCategoryList />
                </Route>
                <Route exact path={`${path}/productcategory`}>
                    <AddEditViewProductCategory />
                </Route>
                <Route exact path={`${path}/productcategory/:id`}>
                    <AddEditViewProductCategory />
                </Route>

                <Route path={`${path}/vendorsettingslist`}>
                    <VendorSettingList />
                </Route>
                <Route exact path={`${path}/vendorsettings`}>
                    <AddEditViewVendorSetting />
                </Route>
                <Route exact path={`${path}/vendorsettings/:id`}>
                    <AddEditViewVendorSetting />
                </Route> */}

            </Switch>

        </Container >
    )
}

export { ReportingRoutes }
