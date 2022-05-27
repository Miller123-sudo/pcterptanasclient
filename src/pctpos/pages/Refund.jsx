// import './refund.css';
import { React, useContext, useEffect, useState } from 'react'
import { Button, Container, Form, Nav, Navbar, NavDropdown, FormControl, InputGroup, Row, Col, FormSelect, Alert } from 'react-bootstrap';
import { BsBell, BsGearFill, BsWifi, BsWifiOff, BsSearch, BsInfoCircle, BsPersonCircle, BsBackspaceFill, BsArrowRightSquareFill, BsFillArrowRightCircleFill } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
// import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from "react-router-dom";
import { AgGridReact } from 'ag-grid-react';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import { formatNumber } from '../../helpers/Utils';
import Keyboard from '../../components/Keyboard';
import ApiService from '../../helpers/ApiServices';
import CartItem from '../components/CartItem';
import { CustomerContext } from '../../components/states/contexts/CustomerContext';
import { CartContext } from '../../components/states/contexts/CartContext';
import AppLoader from '../../pcterp/components/AppLoader';
// import { useHistory } from 'react-router-dom';
// import { Alert } from 'bootstrap';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
const moment = require('moment');


export default function Refund() {
    const [state, setState] = useState([]);
    const [loderStatus, setLoderStatus] = useState(null);
    const [selectedKey, setSelectedKey] = useState('Qty');
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [selectedPosOrder, setSelectedPosOrder] = useState();
    const [selectedCartItem, setSelectedCartItem] = useState(null);
    const { customer } = useContext(CustomerContext);
    const contextValues = useContext(CartContext);
    const [inputQuantity, setInputQuantity] = useState(1);
    const [inputPrice, setInputPrice] = useState(0);
    const [inputDiscount, setInputDiscount] = useState(0);
    const [isCartItemSelected, setIsCartItemSelected] = useState(false);
    // const history = useHistory();
    const [refundCart, setRefundCart] = useState([]);
    const [checkIsInValidRefundQuantity, setCheckIsInValidRefundQuantity] = useState(false);
    const [isRefundQuantitySet, setIsRefundQuantitySet] = useState(true);
    const [itemInfo, setItemInfo] = useState();
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    useEffect(async () => {
        setLoderStatus("RUNNING");
        ApiService.setHeader();
        const response = await ApiService.get('/cashSale');
        if (response.data.isSuccess) {
            console.log(response.data.documents);
            // setState(response.data.documents);
        }
        contextValues.clearCart();
        setLoderStatus("SUCCESS");
    }, []);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }

    const handleSearch = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const columns = [
        // { headerName: '#', field: 'id', sortable: false, filter: false },
        { headerName: 'Cash Sale ID', field: 'cashSaleId' },
        { headerName: 'Customer', field: 'customer', valueGetter: (params) => params.data?.customer?.name ? params.data?.customer?.name : 'Not Available' },
        { headerName: 'Employee', field: 'salesRep', valueGetter: (params) => params.data?.salesRep?.name ? params.data?.salesRep?.name : 'Not Available' },
        { headerName: 'Date', field: `date`, valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("MM/DD/YYYY ") : "Not Available" },
    ]

    const renderStatus = (value) => {
        switch (value) {
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Billed': {
                return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
        }
    }



    const handleRowSelection = e => {
        setIsRefundQuantitySet(true)
        contextValues.clearCart();
        console.log(e.data)
        setSelectedPosOrder(e.data)
        e.data.products.map(cartItem => contextValues.addProduct(cartItem));

        // let refundCartItems = [];
        // e.data.products.map(cartItem => {
        //     let refundCartItemObj = new Object();
        //     refundCartItemObj.available = cartItem.available
        //     refundCartItemObj.cgstRate = cartItem.cgstRate
        //     refundCartItemObj.commited = cartItem.commited
        //     refundCartItemObj.delivered = cartItem.delivered
        //     refundCartItemObj.description = cartItem.description
        //     refundCartItemObj.discount = cartItem.discount
        //     refundCartItemObj.forecasted = cartItem.forecasted
        //     refundCartItemObj._id = cartItem._id
        //     refundCartItemObj.igstRate = cartItem.igstRate
        //     refundCartItemObj.invoiced = cartItem.invoiced
        //     refundCartItemObj.name = cartItem.name
        //     refundCartItemObj.onHand = (cartItem.onHand + 1);
        //     refundCartItemObj.product = cartItem.product
        //     refundCartItemObj.quantity = (0 - cartItem.refundQuantity)
        //     refundCartItemObj.salesPrice = cartItem.salesPrice
        //     refundCartItemObj.sgstRate = cartItem.sgstRate
        //     refundCartItemObj._id = cartItem._id

        //     refundCartItems.push(refundCartItemObj);
        // });

        // setRefundCart(refundCartItems);

        // contextValues.clearCart();
        // setIsChangeCustomerBtnVisible(true)
        // console.log(e.data);
        // setSelectedCustomer(e.data);
        // clearCustomer();
        // addCustomer(e.data);
        // console.log(customer)
    }

    const handleCartItemSelect = (e) => {
        console.log(e);
        setSelectedCartItem(e)
        setIsCartItemSelected(true);
        setInputQuantity(0);
        setInputPrice(0);
        setInputDiscount(0);
    }


    // const selectedCartItem = (e) => {
    //     console.log(e)
    // }
    const handleItemInfo = e => {
        console.log(e)
        setItemInfo(e);
        setInfoPopupVisible(true);
    }

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return <Container className="pct-app-content-container p-0 m-0" fluid>
        <Container className="pct-app-content-body p-0 m-0" fluid>
            <div className="PCTAppContent">
                <div className="PCTAppLeftContent">
                    <div className="PCTAppLeftContent__refundList">
                        <div className="PCTAppLeftContent__header">
                            <Row>
                                <Col><h3 style={{ marginLeft: 10 }}>Refund</h3></Col>
                            </Row>
                            <Row>
                                <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <div className="buttonGroup__back">
                                        <Link to={`/pos`} className="link">
                                            <Button variant='light'>Back</Button>
                                        </Link>
                                    </div>
                                    <div className="buttonGroup__add">
                                        <Button variant='primary'>New Order</Button>
                                    </div>
                                    <div className='buttonGroup__search'>
                                        <input type="text" className="search__panel" placeholder="Search here..." onChange={handleSearch}></input>
                                    </div>
                                </div>
                            </Row>
                        </div>
                        <div className="PCTAppLeftContent__content">
                            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                                <AgGridReact
                                    onGridReady={onGridReady}
                                    rowData={state}
                                    columnDefs={columns}
                                    onCellClicked={handleRowSelection}
                                    defaultColDef={{
                                        editable: false,
                                        sortable: true,
                                        flex: 1,
                                        minWidth: 100,
                                        filter: true,
                                        resizable: true,
                                        minWidth: 200
                                    }}
                                    pagination={true}
                                    paginationPageSize={50}
                                    // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                                    overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="PCTAppRightContent">
                    {!isRefundQuantitySet && <div style={{ width: '100%', height: 'max-content', backgroundColor: '#ffe6e6', color: '#990000', textAlign: 'center', padding: 5, position: 'absolute', top: 0, zIndex: 10 }}><span>Select the product(s) to refund and set the quantity</span></div>}
                    <div className="PCTProductList">
                        <div className="PCTProductLine" style={{ marginBottom: `${isRefundQuantitySet ? '0' : '2.5rem'}` }}>
                            {contextValues.cartItems?.map(cartItem => <CartItem cartItem={cartItem} onClick={e => handleCartItemSelect(e)} selectedItem={selectedCartItem} />)}
                            <div className="PCTOrderSummary">
                                <div className="line">
                                    <div className="PCTOrderTotal">Total: {formatNumber(contextValues?.total ? contextValues?.total : 0.00)}</div>
                                    <div className="PCTOrderTaxes">Taxes:54.63</div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className='controlPad'>
                        <div className="controlPad__operation">
                            <Keyboard
                                layout={[
                                    ['Invoice', 'Print Receipt']
                                ]}
                                onKeyPress={e => {
                                    console.log(e)
                                    if (isCartItemSelected) {
                                        handleItemInfo(selectedCartItem);
                                    }
                                }}
                                link={[
                                    {
                                        fieldName: 'Invoice',
                                        linkTo: '#'
                                    },
                                    {
                                        fieldName: 'Print Receipt',
                                        linkTo: '#'
                                    }
                                ]}
                            />
                        </div>
                        <div className="controlPad__input">
                            <div className="controlPad__input--left">
                                <div className="controlPad__input--customer">
                                    <Keyboard
                                        layout={[
                                            [`${customer ? customer.name : 'Walk-In Customer'}`]
                                        ]}
                                        onKeyPress={e => {
                                            console.log(e)
                                        }}
                                        icons={[{
                                            fieldName: `${customer ? customer.name : 'Walk-In Customer'}`,
                                            icon: <BsPersonCircle />,
                                            iconSize: '25'
                                        }
                                        ]}
                                        link={[
                                            {
                                                fieldName: `${customer ? customer.name : 'Walk-In Customer'}`,
                                                linkTo: '/pos/customers?stack=refund'
                                            }
                                        ]}
                                    />
                                </div>
                                <div className="controlPad__input--payment">
                                    <Keyboard
                                        layout={[
                                            ['Refund']
                                        ]}
                                        onKeyPress={e => {
                                            console.log(e)

                                            if (e === 'Refund') {
                                                console.log(contextValues);

                                                let flag = true;
                                                contextValues.cartItems.map(cartItem => {
                                                    if (cartItem.refundQuantity <= 0) {
                                                        flag = false;
                                                    }
                                                })

                                                if (flag) {
                                                    setIsRefundQuantitySet(true)
                                                    let refundCartItems = [];
                                                    contextValues.cartItems.map(cartItem => {
                                                        let refundCartItemObj = new Object();
                                                        refundCartItemObj.available = cartItem.available
                                                        refundCartItemObj.cgstRate = cartItem.cgstRate
                                                        refundCartItemObj.commited = cartItem.commited
                                                        refundCartItemObj.delivered = cartItem.delivered
                                                        refundCartItemObj.description = cartItem.description
                                                        refundCartItemObj.discount = cartItem.discount
                                                        refundCartItemObj.forecasted = cartItem.forecasted
                                                        refundCartItemObj._id = cartItem._id
                                                        refundCartItemObj.igstRate = cartItem.igstRate
                                                        refundCartItemObj.invoiced = cartItem.invoiced
                                                        refundCartItemObj.name = cartItem.name
                                                        refundCartItemObj.onHand = (cartItem.onHand + 1);
                                                        refundCartItemObj.product = cartItem.product
                                                        refundCartItemObj.quantity = (0 - cartItem.refundQuantity)
                                                        refundCartItemObj.salesPrice = cartItem.salesPrice
                                                        refundCartItemObj.sgstRate = cartItem.sgstRate
                                                        refundCartItemObj._id = cartItem._id

                                                        refundCartItems.push(refundCartItemObj);
                                                    });

                                                    console.log(refundCartItems)
                                                    contextValues.clearCart();
                                                    refundCartItems.map(cartItem => {
                                                        contextValues.addProduct(cartItem)
                                                    })

                                                    navigate('/pos');
                                                } else {
                                                    setIsRefundQuantitySet(false)
                                                }
                                            }
                                        }}
                                        icons={[{
                                            fieldName: 'Refund',
                                            icon: <BsFillArrowRightCircleFill />,
                                            iconSize: '50'
                                        }
                                        ]}
                                        styleKey={{
                                            fieldName: 'Refund',
                                            backgroundColor: '#fff',
                                            color: '#009999'
                                        }}
                                    // link={[
                                    //     {
                                    //         fieldName: 'Refund',
                                    //         linkTo: '/pos'
                                    //     }
                                    // ]}
                                    />
                                </div>
                            </div>
                            <div className="controlPad__input--keypad">
                                <Keyboard
                                    layout={[
                                        ['1', '2', '3'],
                                        ['4', '5', '6'],
                                        ['7', '8', '9'],
                                        ['+/-', '0', '.']
                                    ]}
                                    disabledKeys={[
                                        { fieldName: '+/-' }
                                    ]}
                                    onKeyPress={e => {
                                        // console.log(selectedCartItem)
                                        if (isCartItemSelected && contextValues.cartItems.length !== 0) {
                                            if (selectedKey === 'Qty') {
                                                const updatedInputQuantity = Math.trunc(inputQuantity);
                                                const value = parseInt(updatedInputQuantity + "" + e);
                                                console.log(value)
                                                setInputQuantity(updatedInputQuantity + "" + e)
                                                //"Are you mad you try to return more quantity than you bought that"
                                                console.log(value, selectedCartItem.quantity);
                                                if (value > selectedCartItem.quantity) {
                                                    alert("Are you mad you try to return more quantity than you bought");
                                                    setInputQuantity(0);
                                                } else {
                                                    contextValues.changeRefundQuantity(selectedCartItem, value);
                                                }
                                            } else if (selectedKey === 'Price') {
                                                const updatedInputPrice = inputPrice;
                                                const value = updatedInputPrice + "" + e;
                                                setInputPrice(value);
                                                contextValues.increaseByPrice(selectedCartItem, value);
                                            } else if (selectedKey === 'Disc') {
                                                const updatedInputDisc = inputDiscount;
                                                const value = updatedInputDisc + "" + e;
                                                setInputDiscount(value);
                                                contextValues.changeDiscountPercentage(selectedCartItem, value);
                                            }
                                        } else {
                                            console.log(e)
                                        }
                                    }}

                                // disabledKeys={[
                                //     { fieldName: '1' }
                                // ]}
                                />
                            </div>
                            <div className="controlPad__input--right">
                                <div className="controlPad__input--right-1">
                                    <Keyboard
                                        layout={[
                                            ['Qty'],
                                            ['Disc'],
                                            ['Price'],
                                        ]}
                                        onKeyPress={e => {
                                            console.log(e)
                                            setSelectedKey(e)
                                        }}
                                        styleKey={{
                                            fieldName: `${selectedKey}`,
                                            backgroundColor: '#009999',
                                            color: '#fff'
                                        }}
                                        disabledKeys={[
                                            { fieldName: 'Disc' },
                                            { fieldName: 'Price' }
                                        ]}
                                    />
                                </div>
                                <div className="controlPad__input--right-2">
                                    <Keyboard
                                        layout={[
                                            ['backspace'],
                                        ]}
                                        styleKey={{
                                            fieldName: 'backspace',
                                            isLabelHidden: true
                                        }}
                                        icons={[{
                                            fieldName: 'backspace',
                                            icon: <BsBackspaceFill />,
                                            iconSize: '25'
                                        }
                                        ]}

                                        onKeyPress={e => {
                                            console.log(e)

                                            if (selectedKey === 'Qty') {
                                                if (isCartItemSelected) {
                                                    if (inputQuantity === 0) {
                                                        contextValues.removeProduct(selectedCartItem);
                                                        setSelectedCartItem(contextValues.cartItems[contextValues.cartItems.length - 1])
                                                        setIsCartItemSelected(true);
                                                    } else {
                                                        contextValues.changeRefundQuantity(selectedCartItem, Math.trunc(inputQuantity / 10))
                                                        setInputPrice(0)
                                                        setInputQuantity(Math.trunc(inputQuantity / 10));
                                                    }
                                                }
                                            } else if (selectedKey === 'Price') {
                                                contextValues.increaseByPrice(selectedCartItem, Math.trunc(inputPrice / 10));
                                                setInputPrice(Math.trunc(inputPrice / 10))
                                            } else if (selectedKey === 'Disc') {
                                                contextValues.changeDiscountPercentage(selectedCartItem, Math.trunc(inputDiscount / 10));
                                                setInputDiscount(Math.trunc(inputDiscount / 10))
                                            }
                                        }}
                                    />

                                </div>

                            </div>
                        </div>
                    </div>
                    {/* <div className='controlPad'>
                        <div className="controlButtons">
                            <div className="controlButton">
                                <Link to={`/pos/refund`} className="link">
                                    <Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>Discount</Button>
                                </Link>
                            </div>
                            <div className="controlButton">
                                <Link to={`/pos/refund`} className="link">
                                    <Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>Refund</Button>
                                </Link>
                            </div>
                            <div className="controlButton">
                                <Link to={`/pos/order`} className="link">
                                    <Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>Orders</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="keysContainer">
                            <div className="keysContainerLeft">
                                <div className="customerControl">
                                    <Link to={`/pos/customer`} className="link">
                                        <Button size="lg" style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}><CgProfile style={{ marginTop: '-4px' }} /> Customer</Button>
                                    </Link>
                                </div>
                                <div className="paymentControl"><Button size="lg" style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}><BsFillArrowRightCircleFill style={{ marginTop: '-4px', fontSize: '60px' }} /> <br /> Payment</Button></div>
                            </div>
                            <div className="keysContainerRight">
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>7</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>8</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>9</Button></div>
                                <div className="controlPadNumKey"><Button variant={'light'} style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>Qty</Button></div>

                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>4</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>5</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>6</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>Disc</Button></div>

                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>1</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>2</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>3</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>Price</Button></div>

                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>+/-</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>0</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}>.</Button></div>
                                <div className="controlPadNumKey"><Button style={{ borderRadius: 0, margin: 0, width: '100%', height: '100%' }}><BsBackspaceFill style={{ marginTop: '-4px' }} /></Button></div>
                            </div>
                        </div>

                    </div> */}
                </div>
                {infoPopupVisible && <div className="PCTAppContent__infoPopup">
                    <div className="PCTAppContent__infoPopup--box">
                        <div className="infoPopup__header">
                            <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <div className="buttonGroup__back">
                                    <Button variant='light' onClick={e => setInfoPopupVisible(false)}>Back</Button>
                                </div>
                                <div className="buttonGroup__title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                    <h3>Product Information</h3>
                                </div>
                            </div>
                        </div>
                        <div className="infoPopup__body">
                            <div className="infoPopup__body--productDetails">
                                <div className="productDetails__name">{itemInfo.name}
                                    <div className="productDetails__subHead">Unit Price: $999.00</div>
                                </div>
                                <div className="productDetails__rate">
                                    <div className="productDetails__rate--amount">Amount: {formatNumber(itemInfo.salesPrice)}</div>
                                    <div className="productDetails__subHead">SGST 2.5%: $25.00</div>
                                    <div className="productDetails__subHead">CGST 2.5%: $25.00</div>
                                </div>
                            </div>
                            <div className="infoPopup__body--productOthers">
                                <div className="infoPopup__body--productOthers-left">
                                    <div className="infoPopup__body--productOthers-left-box">
                                        <div className="infoPopup__body--productOthers-heading">Inventory</div>
                                        <div className="infoPopup__body--productOthers-subHeading">Available unit: 150</div>
                                        <div className="infoPopup__body--productOthers-subHeading">Forecasted unit: 150</div>
                                    </div>
                                </div>
                                <div className="infoPopup__body--productOthers-right">
                                    <div className="infoPopup__body--productOthers-right-box">
                                        <div className="infoPopup__body--productOthers-heading">Order</div>
                                        <div className="infoPopup__body--productOthers-subHeading">Total Price excl. VAT: $999.00</div>
                                        <div className="infoPopup__body--productOthers-subHeading">Total Cost: $299.00</div>
                                        <div className="infoPopup__body--productOthers-subHeading">Total Cost: $699.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </Container>
    </Container>;
}
