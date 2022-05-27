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
// import PurchaseOrderList from './purchaseOrder/PurchaseOrderList';
import VendorList from './vendor/VendorList';
import Vendor from './vendor/Vendor';
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import ProductList from './product/ProductList';
import Product from './product/Product';
import BillList from './bill/BillList';
import Bill from './bill/Bill';
// import Bill from './../accounting/standaloneBill/Bill';
import BillPaymentList from './billPayment/BillPaymentList';
// import BillPayment from './billPayment/BillPayment';
import BillPayment from './../accounting/billpayment/BillPayment';//It is account app's billpayment form. Here GL is shown in that payment form
import ProductReceiveList from './productReceive/ProductReceiveList';
import ProductReceive from './productReceive/ProductReceive';
// import Dashboard from './reporting/Dashboard';
import ReceivedProductList from './received/ReceivedProductList';
import BilledList from './billed/BilledList';
import TrialBalance from '../reporting/TrialBalance';
import Dashboard from './reporting/Dashboard';
import AddEditPurchaseOrder from "./../purchase/purchaseOrder/AddEditPurchaseOrder";
import NewAddEditPurchaseOrder from "./../purchase/purchaseOrder/NewAddEditPurchaseOrder";
// import PurchaseOrderList from "./../purchase/purchaseOrder/PurchaseOrderList (1)";
import PurchaseOrderList from "./../purchase/purchaseOrder/PurchaseOrderList";
import { AddEditProductmaster } from '../itemCategories/productMaster/AddEditProductmaster';
import { AddEditGroupMaster } from '../itemCategories/groupMaster/AddEditGroupMaster';
import { AddEditBrand } from '../itemCategories/Brand/AddEditBrand';
import { AddEditFirstCategory } from '../itemCategories/FirstCategory/AddEditFirstCategory';
import { AddEditSecondCategory } from '../itemCategories/secondCategory/AddEditSecondCategory';
import { AddEditSize } from '../itemCategories/size/AddEditSize';
import PriceChart from './priceChart/PriceChart';
import PriceChartList from './priceChart/PriceChartList';
import ProductMaster from './settings/productMaster/ProductMaster';
import GroupMaster from './settings/groupMaster/GroupMaster';
import SizeList from './settings/sizeList/SizeList';
import Brand from './settings/brand/Brand';
import Category1 from './settings/category1/Category1';
import Category2 from './settings/category2/Category2';
import Size from './settings/size/Size';
import PaymentList from './paymentList/PaymentList';


export default function PurchaseRoutes() {
    const { dispatch, user } = useContext(UserContext)
    const [isonline, setisonline] = useState()
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1]; // path of the module

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
                        <Navbar.Brand as={Link} to={`${rootPath}/orders`}>Purchase</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${rootPath}/orders`}>Purchase Orders</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${rootPath}/receivedproducts`}>Received Product</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Vendor" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${rootPath}/vendors`}>Vendor</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${rootPath}/bills`}>Vendor Bill</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${rootPath}/billpayments`}>Vendor Bill Payments</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Products</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/analysis`}>Purchase Analysis</NavDropdown.Item>
                                    {/* <NavDropdown.Item as={Link} to={`/purchase/trialbalance`}>Trial</NavDropdown.Item> */}
                                </NavDropdown>

                                <NavDropdown title="Price Chart" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/priceChartUpload`}>Price Chart Upload</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/priceCharts`}>Price Chart</NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown title="Settings" id="item_category">
                                    <NavDropdown.Item as={Link} to={`/purchase/productmaster`}>Product Master</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/groupmaster`} >Group Master</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/brand`} >Brand</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/firstcategory`} >Category 1</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/secondcategory`} >Category 2</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/size`} >Size</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/sizeLists`} >Size List</NavDropdown.Item>
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
                <Route path={`${rootPath}`} element={<PurchaseOrderList />} />

                {/* <Dashboard /> */}

                /*Purchase Order Routes*/
                <Route path={`${rootPath}/orders`} element={<PurchaseOrderList />} />
                {/* <PurchaseOrderList /> */}


                <Route path={`${rootPath}/order`} element={<AddEditPurchaseOrder />} />
                {/* <PurchaseOrder /> */}


                <Route path={`${rootPath}/order/:id`} element={<AddEditPurchaseOrder />} />
                {/* <PurchaseOrder /> */}




                /*Vendor Routes*/
                <Route path={`${rootPath}/vendors`} element={<VendorList />} />

                <Route path={`${rootPath}/vendor`} element={<Vendor />} />


                <Route path={`${rootPath}/vendor/:id`} element={<Vendor />} />




                /*Vendor Bills Routes*/
                <Route path={`${rootPath}/bills`} element={<BillList />} />


                <Route path={`${rootPath}/bill`} element={<Bill />} />


                <Route path={`${rootPath}/bill/:id`} element={<Bill />} />


                /*Vendor Bill Payment Routes*/
                <Route path={`${rootPath}/billpayments`} element={<BillPaymentList />} />

                <Route path={`${rootPath}/bill/billpayments/:id`} element={<PaymentList />} />
                <Route path={`${rootPath}/billpayment`} element={<BillPayment />} />
                <Route path={`${rootPath}/billpayment/:id`} element={<BillPayment />} />



                /*Product Routes*/
                <Route path={`${rootPath}/products`} element={<ProductList />} />

                <Route path={`${rootPath}/product`} element={<Product />} />

                <Route path={`${rootPath}/product/:id`} element={<Product />} />



                /*Product Receipt Routes*/
                <Route path={`${rootPath}/receivedproducts`} element={<ProductReceiveList />} />

                <Route path={`${rootPath}/receiveproduct`} element={<ProductReceive />} />

                <Route path={`${rootPath}/receiveproduct/:id`} element={<ProductReceive />} />



                /*Reporting Routes*/
                <Route path={`${rootPath}/analysis`} element={<Dashboard />} />


                <Route path={`${rootPath}/received/:id`} element={<ReceivedProductList />} />

                <Route path={`${rootPath}/billed/:id`} element={<BilledList />} />



                /*Item Category Routes*/
                <Route path={`${rootPath}/productmaster`} element={<ProductMaster />} />
                {/* <AddEditProductmaster /> */}

                <Route path={`${rootPath}/groupmaster`} element={<GroupMaster />} />

                <Route path={`${rootPath}/brand`} element={<Brand />} />

                <Route path={`${rootPath}/firstcategory`} element={<Category1 />} />

                <Route path={`${rootPath}/secondcategory`} element={<Category2 />} />

                <Route path={`${rootPath}/size`} element={<Size />} />

                <Route path={`${rootPath}/sizeLists`} element={<SizeList />} />




                /*Price Chart Routes*/
                <Route path={`${rootPath}/priceCharts`} element={<PriceChartList />} />
                <Route path={`${rootPath}/priceChartUpload`} element={<PriceChart />} />


                <Route path="*" element={<h1 className="text-center">Not Completed Yet!</h1>} />


            </Routes>


        </Container >
    )
}

