import { React, useContext } from 'react'
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
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import ProductList from './product/ProductList';
import Product from './product/Product';
import InventoryAdjustmentList from './inventoryAdjustment/InventoryAdjustmentList';
import InventoryAdjustment from './inventoryAdjustment/InventoryAdjustment';
import InventoryOverview from './Overview';
import InventoryStocksReport from './reporting/InventoryStocksReport';



export default function InventoryRoutes() {
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
    let { path, url } = useRouteMatch();


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}`}>Inventory</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                {/* <Nav.Link as={Link} to={`${url}`}>Overview</Nav.Link> */}
                                <NavDropdown title="Operations" id="basic-nav-dropdown">
                                    {/* <NavDropdown.Item as={Link} to={`${url}/rfqs`}>Requests for Quatation</NavDropdown.Item> */}
                                    <NavDropdown.Item as={Link} to={`${url}/transfer`}>Transfers</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/inventoryadjustments`}>Inventory Adjustments</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/products`}>Products</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/analysis`}>Inventory Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/inventory/inventorystocksreport`}>Inventory Stocks Report</NavDropdown.Item>

                                    {/* <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item> */}
                                </NavDropdown>
                                <NavDropdown title="Settings" id="basic-nav-dropdown">
                                    {/* <NavDropdown.Item as={Link} to={`/purchase/settings`}>Settings</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Vendor Settings</NavDropdown.Item>
                                    <NavDropdown.Divider /> */}
                                    <NavDropdown.Item href="#action/3.3">Products Categories</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <NavDropdown title={user.name} id="nav-dropdown">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link active><BsWifi /></Nav.Link>
                                {/* <Nav.Link><BsWifiOff /></Nav.Link> */}
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

                /*Default*/
                <Route exact path={`${path}`}>
                    <InventoryOverview />
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

                /*Product Routes*/
                <Route path={`${path}/inventoryadjustments`}>
                    <InventoryAdjustmentList />
                </Route>
                <Route exact path={`${path}/inventoryadjustment`}>
                    <InventoryAdjustment />
                </Route>
                <Route exact path={`${path}/inventoryadjustment/:id`}>
                    <InventoryAdjustment />
                </Route>


                /*Inventory Stocks Report*/
                <Route path={`${path}/inventorystocksreport`}>
                    <InventoryStocksReport />
                </Route>

                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>

            </Switch>


        </Container >
    )
}

