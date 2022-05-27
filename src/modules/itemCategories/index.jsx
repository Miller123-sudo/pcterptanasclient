import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { React, useContext, useEffect, useState } from 'react'
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsBell, BsGearFill } from 'react-icons/bs'
import { AddEditProductmaster } from './productMaster/AddEditProductmaster';
import { ProductMasterList } from './productMaster/ProductMasterList';
import { AddEditGroupMaster } from './groupMaster/AddEditGroupMaster';
import { GroupMasterList } from './groupMaster/GroupMasterList';
import { AddEditBrand } from './Brand/AddEditBrand';
import { BrandList } from './Brand/BrandList';
import { AddEditFirstCategory } from './FirstCategory/AddEditFirstCategory';
import { FirstCategoryList } from './FirstCategory/FirstCategoryList';
import { AddEditSecondCategory } from './secondCategory/AddEditSecondCategory';
import { SecondCategoryList } from './secondCategory/SecondCategoryList';
import { AddEditSize } from './size/AddEditSize';
import { SizeList } from './size/SizeList';
import PurchaseOrderList from "./../purchase/purchaseOrder/PurchaseOrderList";
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';

const ItemCategoryRoutes = () => {
    const [isonline, setisonline] = useState()
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
    let { path, url } = useRouteMatch();

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
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`/purchase/orders`}>Purchase</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/orders`}>Purchase Orders</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/receivedproducts`}>Received Product</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Vendor" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/vendors`}>Vendor</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/bills`}>Vendor Bill</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/billpayments`}>Vendor Bill Payments</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Products</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/analysis`}>Purchase Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/trialbalance`}>Purchase Reporting</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Item Category" id="item_category">

                                    <NavDropdown.Item as={Link} to={`/itemcategory/productmaster`}>Product Master</NavDropdown.Item>

                                    <NavDropdown.Item as={Link} to={`/itemcategory/groupmaster`} >Group Master</NavDropdown.Item>

                                    <NavDropdown.Item as={Link} to={`/itemcategory/brand`} >Brand</NavDropdown.Item>

                                    <NavDropdown.Item as={Link} to={`/itemcategory/firstcategory`} >Category 1</NavDropdown.Item>

                                    <NavDropdown.Item as={Link} to={`/itemcategory/secondcategory`} >Category 2</NavDropdown.Item>

                                    <NavDropdown.Item as={Link} to={`/itemcategory/size`} >Size</NavDropdown.Item>

                                </NavDropdown>
                                {/* <NavDropdown title="Settings" id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to={`/sales/products`}>Settings</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to={`/sales/products`}>Sales Teams Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.3">Units of Measure Categories</NavDropdown.Item>
                            </NavDropdown> */}
                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: 'white', color: 'black', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <Nav.Link >{user.name}</Nav.Link>
                                {

                                    isonline ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>

                                }
                                <Nav.Link as={Link} to="/notification"><BsBell /></Nav.Link>
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

            /*Default*/
                <Route exact path={`${path}`}>
                    <PurchaseOrderList />
                    {/* <Dashboard /> */}
                </Route>

            /*Purchase Order Routes*/
                {/* <Route path={`${path}/orders`}>
                    
                    <PurchaseOrderList />
                </Route>
                <Route exact path={`${path}/order`}>
                    
                    <AddEditPurchaseOrder />
                </Route>
                <Route exact path={`${path}/order/:id`}>
                    
                    <AddEditPurchaseOrder />
                </Route>  */}

                /*Vendor Routes*/
                {/* <Route path={`${path}/vendors`}>
                    <VendorList />
                </Route>
                <Route exact path={`${path}/vendor`}>
                    <Vendor />
                </Route>
                <Route exact path={`${path}/vendor/:id`}>
                    <Vendor />
                </Route> */}

            /*Vendor Bills Routes*/
                {/* <Route path={`${path}/bills`}>
                    <BillList />
                </Route>
                <Route exact path={`${path}/bill`}>
                    <Bill />
                </Route>
                <Route exact path={`${path}/bill/:id`}>
                    <Bill />
                </Route> */}

            /*Vendor Bill Payment Routes*/
                {/* <Route path={`${path}/billpayments`}>
                    <BillPaymentList />
                </Route>
                <Route exact path={`${path}/billpayment`}>
                    <BillPayment />
                </Route>
                <Route exact path={`${path}/billpayment/:id`}>
                    <BillPayment />
                </Route> */}



            /*Product Routes*/
                {/* <Route path={`${path}/products`}>
                    <ProductList />
                </Route>
                <Route exact path={`${path}/product`}>
                    <Product />
                </Route>
                <Route exact path={`${path}/product/:id`}>
                    <Product />
                </Route> */}

            /*Product Receipt Routes*/
                {/* <Route path={`${path}/receivedproducts`}>
                    <ProductReceiveList />
                </Route>
                <Route exact path={`${path}/receiveproduct`}>
                    <ProductReceive />
                </Route>
                <Route exact path={`${path}/receiveproduct/:id`}>
                    <ProductReceive />
                </Route> */}

            /*Reporting Routes*/
                {/* <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>
                <Route path={`${path}/trialbalance`}>
                    <TrialBalance />
                </Route> */}

                /* Item categoty routes */
                {/* <Route exact path={`${path}/productmaster`}>
                    < AddEditProductmaster />
                </Route> */}


                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>

                {/* <Route exact path={`${path}/received/:id`}>
                    <ReceivedProductList />
                </Route>
                <Route exact path={`${path}/billed/:id`}>
                    <BilledList />
                </Route>

                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route> */}

            </Switch>


        </Container >

        // <div>
        //     <div id="productMasterRoutes">
        //         <Route exact path='/itemcategory/productmaster'><AddEditProductmaster /></Route>
        //         <Route exact path='/itemcategory/productmasterlist'><ProductMasterList /></Route>
        //         <Route exact path='/itemcategory/productmaster/id:'><AddEditProductmaster /></Route>
        //     </div>
        //     <div id="groupMasterRoutes">
        //         <Route exact path='/itemcategory/groupmaster'><AddEditGroupMaster /></Route>
        //         <Route exact path='/itemcategory/groupmasterlist'><GroupMasterList /></Route>
        //         <Route exact path='/itemcategory/groupmaster/id:'><AddEditGroupMaster /></Route>
        //     </div>
        //     <div id="brandRoutes">
        //         <Route exact path='/itemcategory/brand'><AddEditBrand /></Route>
        //         <Route exact path='/itemcategory/brandlist'><BrandList /></Route>
        //         <Route exact path='/itemcategory/brand/id:'><AddEditBrand /></Route>
        //     </div>
        //     <div id="firstCategoryRoutes">
        //         <Route exact path='/itemcategory/firstcategory'><AddEditFirstCategory /></Route>
        //         <Route exact path='/itemcategory/firstcategorylist'><FirstCategoryList /></Route>
        //         <Route exact path='/itemcategory/firstcategory/id:'><AddEditFirstCategory /></Route>
        //     </div>
        //     <div id="secondCategoryRoutes">
        //         <Route exact path='/itemcategory/secondcategory'><AddEditSecondCategory /></Route>
        //         <Route exact path='/itemcategory/secondcategorylist'><SecondCategoryList /></Route>
        //         <Route exact path='/itemcategory/secondcategory/id:'><AddEditSecondCategory /></Route>
        //     </div>
        //     <div id="sizeRoutes">
        //         <Route exact path='/itemcategory/size'><AddEditSize /></Route>
        //         <Route exact path='/itemcategory/sizelist'><SizeList /></Route>
        //         <Route exact path='/itemcategory/size/id:'><AddEditSize /></Route>
        //     </div>
        // </div>
    )
}

export default ItemCategoryRoutes

