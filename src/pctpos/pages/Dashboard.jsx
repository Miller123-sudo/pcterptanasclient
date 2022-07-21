import './dashboard.css';
import { React, useContext, useEffect, useState } from 'react'
import { Button, Container, Form, Nav, Navbar, NavDropdown, FormControl, Row, Col, InputGroup } from 'react-bootstrap';
import { BsBell, BsGearFill, BsWifi, BsWifiOff, BsSearch, BsInfoCircle, BsBackspaceFill, BsArrowRightSquareFill, BsFillArrowRightCircleFill, BsPersonCircle } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
// import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from "react-router-dom";
// import { useHistory } from 'react-router';
// import { UserContext } from '../../states/contexts/UserContext';
// import ItemCard from '../Items/ItemCard';
// import CartItem from '../cart/CartItem';
import { formatNumber, infoNotification } from '../../helpers/Utils';
import { PropagateLoader } from "react-spinners";
// import { PaymentOptionContext } from '../../states/contexts/PaymentOptionContext';
import ApiService from '../../helpers/ApiServices';
import Keyboard from '../../components/Keyboard';
import { CartContext } from '../../components/states/contexts/CartContext';
import { CustomerContext } from '../../components/states/contexts/CustomerContext';
import CartList from '../components/CartList';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
// import { BsBoxArrowInUpRight, BsEyeFill, BsFillArrowRightCircleFill } from 'react-icons/bs'



export default function Dashboard() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [selectedKey, setSelectedKey] = useState('Qty');
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [items, setItems] = useState();
    const contextValues = useContext(CartContext);
    const [isCartItemSelected, setIsCartItemSelected] = useState(false);
    const [selectedCartItem, setSelectedCartItem] = useState({});
    const [inputQuantity, setInputQuantity] = useState(1);
    const [inputPrice, setInputPrice] = useState(0);
    const [inputDiscount, setInputDiscount] = useState(0);
    const [itemInfo, setItemInfo] = useState();
    const [inputSalesCode, setInputSalesCode] = useState('SC')
    const [increaseQuantity, setIncreaseQuantity] = useState();
    // const { cartItems, increase, addProduct } = useContext(CartContext);
    const { customer, updateCustomer } = useContext(CustomerContext);
    const [customerName, setCustomerName] = useState('Customer');
    const [keypadSign, setKeypadSign] = useState('+');

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();
    // const history = useHistory()
    // const { paymentOptions, addPaymentOptions, removePaymentOptions, updatePaymentOptionAmount, clearAllPaymentOptions } = useContext(PaymentOptionContext);

    console.log(customer);

    console.log(contextValues)

    useEffect(async () => {
        setLoderStatus("RUNNING");
        try {
            const response = await ApiService.get('product');
            console.log(response.data.documents)
            setItems(response.data.documents);
            setCustomerName(customer.name);
            console.log(customer);
            !customer?.name && updateCustomer({ name: 'Walk-In Customer' });
        } catch (err) {
            alert(err.response?.data.message)
            navigate("/")
        }
        // updateCustomer({ name: 'Walk-In Customer' });

        // const rupee = (1234567.89).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        // const rupee = 1234567.89;

        // const stage1 = (rupee / 1000.00);
        // const stage2 = (stage1 / 100.00);
        // const stage3 = (stage2 / 100.00);
        // const stage4 = (stage3 / 100.00);

        // const formatRupee = stage1.replace('.', ',')
        // console.log(rupee);

        setLoderStatus("SUCCESS");
    }, []);


    const handleItemInfo = e => {
        console.log(e)
        setItemInfo(e);
        setInfoPopupVisible(true);
    }

    const handleCartItemSelect = e => {
        console.log(e);
        setIsCartItemSelected(true);
        setSelectedCartItem(e);
        setInputPrice(0)
        setInputQuantity(0);
        setInputDiscount(0);
        setInputSalesCode('SC');
    }

    const handleItemClicked = (item) => {
        const isInCart = (contextValues.cartItems.find(cartItem => cartItem._id === item._id)) ? true : false;
        // const cartItemTemp = contextValues?.cartItems.filter(cartItem => cartItem._id === item._id);
        console.log(item)
        isInCart ? contextValues.increase(item) : contextValues.addProduct(item);
        setSelectedCartItem(item);
        setIsCartItemSelected(true);
        setInputPrice(0)
        setInputQuantity(0);
    }

    const handleProductsList = async (category) => {
        let response = [];
        category === 'All' ? response = await ApiService.get(`product`) : response = await ApiService.get(`product/search?category=${category}`);
        console.log(response.data.documents);
        setItems(response.data.documents)
    }

    const handleDeleteCartItem = (cartItem) => {
        console.log(cartItem);
        contextValues.removeProduct(cartItem);
        if (contextValues.cartItems.length !== 0) {
            setSelectedCartItem(contextValues.cartItems[contextValues.cartItems.length - 1]);
            setIsCartItemSelected(true);
        } else {
            setSelectedCartItem(null);
            setIsCartItemSelected(false);
        }

        console.log(contextValues.cartItems[contextValues.cartItems.length - 1])
        document.getElementById("posbarcode").focus()
    }

    useEffect(() => {

        document.getElementById("posbarcode").focus();

    });

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }


    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content-body p-0 m-0" fluid>
                <div className="PCTAppContent">
                    <div className="PCTAppLeftContent">
                        <div style={{ height: '100%', flex: 7, overflowY: 'scroll', overflowX: 'hidden', paddingTop: '3rem', paddingBottom: '1rem', position: 'relative' }}>
                            <div style={{ minWidth: '35rem', width: '100%', height: '3rem', backgroundColor: '#eee', position: 'absolute', zIndex: 1, marginTop: '-3rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem' }}>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>IMAGE</div>
                                <div style={{ flex: 3, textAlign: 'center', fontWeight: 600 }}>ITEM</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>RATE</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>QTY.</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>TAX(%)</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>DISC.(%)</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>AMOUNT</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>CODE</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}></div>
                            </div>
                            {contextValues.cartItems?.map(cartItem => <CartList cartItem={cartItem} onClick={handleCartItemSelect} selectedItem={selectedCartItem} handleDeleteCartItem={handleDeleteCartItem} />)}
                        </div>
                        {/* <div style={{ flex: 3 }}></div> */}
                    </div>
                    <div className="PCTAppRightContent">
                        {/* <div className="PCTProductList" id='PCTProductList'> */}
                        {/* <div className="PCTProductLine">
                                {contextValues.cartItems?.map(cartItem => <CartItem cartItem={cartItem} onClick={e => handleCartItemSelect(e)} selectedItem={selectedCartItem} />)}

                                <div className="PCTOrderSummary">
                                    <div className="line" >
                                        <div className="PCTOrderTotal">Total: {formatNumber(contextValues.totalWithTaxes)}</div>
                                        <div className="PCTOrderTaxes">Taxes: {formatNumber((contextValues.total / 100) * 5)}</div>
                                    </div>
                                </div>
                            </div> */}
                        {/* </div> */}
                        <div className="amountCalculation">
                            <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#eee', borderRadius: '5px 5px 0 0' }}>
                                <div className="count" style={{ fontSize: '1.25rem', fontWeight: 900 }}>ITEM COUNT: {contextValues?.cartItems?.length}</div>
                                <div className="total" style={{ fontSize: '1.25rem', fontWeight: 900 }}>TOTAL: {formatNumber(contextValues?.totalWithTaxes)}</div>
                            </div>
                            <div style={{ flex: 3, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', padding: '0 2rem' }}>
                                <div className='amountCalculationList'>
                                    <div style={{ flex: 1, textAlign: 'right' }}>Sub Total:</div>
                                    <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber(contextValues?.total)}</div>
                                </div>
                                <div className='amountCalculationList'>
                                    <div style={{ flex: 1, textAlign: 'right' }}>Discount:</div>
                                    <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber(contextValues?.totalDiscount)}</div>
                                </div>
                                {/* <div className='amountCalculationList'>
                                    <div style={{ flex: 1, textAlign: 'right' }}>Taxes:</div>
                                    <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber(contextValues?.taxes)}</div>
                                </div> */}
                                {
                                    !customer.isLocal && (

                                        <div className='amountCalculationList'>
                                            <div style={{ flex: 1, textAlign: 'right' }}>IGST:</div>
                                            <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber(contextValues?.taxes)}</div>
                                        </div>
                                    )
                                }

                                {
                                    customer.name == "Walk-In Customer" || customer.isLocal && (<>
                                        <div className='amountCalculationList'>
                                            <div style={{ flex: 1, textAlign: 'right' }}>UTGST:</div>
                                            <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber((contextValues?.taxes) / 2.00)}</div>
                                        </div>
                                        <div className='amountCalculationList'>
                                            <div style={{ flex: 1, textAlign: 'right' }}>SGST:</div>
                                            <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber((contextValues?.taxes) / 2.00)}</div>
                                        </div>
                                    </>
                                    )
                                }

                                <div className='amountCalculationList'>
                                    <div style={{ flex: 1, textAlign: 'right' }}>Total:</div>
                                    <div style={{ flex: 1, textAlign: 'right' }}>{formatNumber(contextValues?.totalWithTaxes)}</div>
                                </div>
                            </div>
                            {/* <div style={{ width: '25rem' }}>
                                <div className="amountCalculationList">
                                    <div className='amountCalculationList--label'>Sub Total:</div>
                                    <div className='amountCalculationList--label'>{formatNumber(contextValues.total)}</div>
                                </div>
                                <div className="amountCalculationList">
                                    <div className='amountCalculationList--label'>Discount:</div>
                                    <div className='amountCalculationList--label'>0.00</div>
                                </div>
                                <div className="amountCalculationList">
                                    <div className='amountCalculationList--label'>Taxes:</div>
                                    <div className='amountCalculationList--label'>{formatNumber((contextValues.total / 100) * 5)}</div>
                                </div>
                                <div className="amountCalculationList">
                                    <div className='amountCalculationList--label'>Grand Total:</div>
                                    <div className='amountCalculationList--label'>{formatNumber(contextValues.totalWithTaxes)}</div>
                                </div>
                            </div> */}
                        </div>
                        <div className='controlPad'>
                            <div className="controlPad__operation">
                                <Keyboard
                                    layout={[
                                        [
                                            'info',
                                            // 'Refund',
                                            'Order'
                                        ]
                                    ]}
                                    onKeyPress={e => {
                                        console.log(e);
                                        if (e === 'info') {
                                            if (isCartItemSelected) {
                                                handleItemInfo(selectedCartItem);
                                            }
                                        }

                                    }}
                                    link={[
                                        {
                                            fieldName: 'info',
                                            linkTo: '#'
                                        },
                                        {
                                            fieldName: 'Refund',
                                            linkTo: '/pos/refund'
                                        },
                                        {
                                            fieldName: 'Order',
                                            linkTo: '/pos/orders'
                                        }
                                    ]}
                                />
                            </div>
                            <div className="controlPad__input">
                                <div className="controlPad__input--left">
                                    <div className="controlPad__input--customer">
                                        <Keyboard
                                            layout={[
                                                [`${customer?.name ? customer?.name : 'Walk-In Customer'}`]
                                            ]}
                                            onKeyPress={e => {
                                                console.log(e)
                                            }}
                                            icons={[{
                                                fieldName: `${customer?.name ? customer?.name : 'Walk-In Customer'}`,
                                                icon: <BsPersonCircle />,
                                                iconSize: '25'
                                            }
                                            ]}
                                            link={[
                                                {
                                                    fieldName: `${customer?.name ? customer?.name : 'Walk-In Customer'}`,
                                                    linkTo: '/pos/customers?stack=dashboard'
                                                }
                                            ]}
                                        />
                                    </div>
                                    <div className="controlPad__input--payment">
                                        <Keyboard
                                            layout={[
                                                ['Pay By Cash']
                                            ]}
                                            onKeyPress={e => {
                                                console.log(e)

                                                if (contextValues.cartItems.length == 0) {
                                                    infoNotification("Please add an item to the cart first!")
                                                    // alert("Please add an item to the cart first!")
                                                } else {
                                                    navigate('/pos/paymentByCash');
                                                }
                                            }}
                                            icons={[{
                                                fieldName: 'Pay By Cash',
                                                icon: <BsFillArrowRightCircleFill />,
                                                iconSize: '50'
                                            }
                                            ]}
                                            styleKey={{
                                                fieldName: 'Pay By Cash',
                                                backgroundColor: '#fff',
                                                color: '#009999'
                                            }}
                                        // link={[
                                        //     {
                                        //         fieldName: 'Pay',
                                        //         linkTo: '/pos/payment'
                                        //     }
                                        // ]}
                                        />
                                    </div>
                                    <div className="controlPad__input--payment">
                                        <Keyboard
                                            layout={[
                                                ['Pay']
                                            ]}
                                            onKeyPress={e => {
                                                console.log(e)

                                                if (contextValues.cartItems.length == 0) {
                                                    infoNotification("Please add an item to the cart first!")
                                                    // alert("Please add an item to the cart first!")
                                                } else {
                                                    navigate('/pos/payment');
                                                }
                                            }}
                                            icons={[{
                                                fieldName: 'Pay',
                                                icon: <BsFillArrowRightCircleFill />,
                                                iconSize: '50'
                                            }
                                            ]}
                                            styleKey={{
                                                fieldName: 'Pay',
                                                backgroundColor: '#fff',
                                                color: '#009999'
                                            }}
                                        // link={[
                                        //     {
                                        //         fieldName: 'Pay',
                                        //         linkTo: '/pos/payment'
                                        //     }
                                        // ]}
                                        />
                                    </div>
                                </div>
                                <div className="controlPad__input--keypad">
                                    <Keyboard
                                        layout={[
                                            ['7', '8', '9'],
                                            ['4', '5', '6'],
                                            ['1', '2', '3'],
                                            [`${keypadSign}`, '0', '.']
                                        ]}
                                        activeKey={[
                                            { fieldName: `${keypadSign}` }
                                        ]}
                                        onKeyPress={e => {
                                            // console.log(selectedCartItem);
                                            if (e === '+') {
                                                setKeypadSign('-');
                                                setInputQuantity(0);
                                            } else if (e === '-') {
                                                setKeypadSign('+');
                                                setInputQuantity(0);
                                            }
                                            if (isCartItemSelected && contextValues.cartItems.length !== 0) {
                                                if (selectedKey === 'Qty') {
                                                    if (e === '+') {
                                                        contextValues.increaseByValue(selectedCartItem, 0)
                                                    } else if (e === '-') {
                                                        contextValues.increaseByValue(selectedCartItem, 0)
                                                    } else {
                                                        // const updatedInputQuantity = Math.trunc(inputQuantity);
                                                        const updatedInputQuantity = inputQuantity;
                                                        const value = (parseFloat(updatedInputQuantity + "" + e)).toFixed(2);
                                                        console.log(value);
                                                        const updatedValue = keypadSign === '+' ? value : 0 - value;
                                                        e !== '+' && e !== '-' && setInputQuantity(updatedInputQuantity + "" + e)
                                                        contextValues.increaseByValue(selectedCartItem, updatedValue);
                                                    }
                                                }
                                                // else if (selectedKey === 'Price') {
                                                //     const updatedInputPrice = inputPrice;
                                                //     const value = updatedInputPrice + "" + e;
                                                //     console.log(value)
                                                //     setInputPrice(value);
                                                //     contextValues.increaseByPrice(selectedCartItem, value);
                                                // }
                                                else if (selectedKey === 'Sales Code') {

                                                    if (inputSalesCode === 'N/A') {
                                                        const updatedInputSalesCode = 'SC';
                                                        const value = updatedInputSalesCode + "" + e;
                                                        console.log(value)
                                                        setInputSalesCode(value);
                                                        contextValues.setSalesCode(selectedCartItem, value);
                                                    } else {
                                                        const updatedInputSalesCode = inputSalesCode;
                                                        const value = updatedInputSalesCode + "" + e;
                                                        console.log(value)
                                                        setInputSalesCode(value);
                                                        contextValues.setSalesCode(selectedCartItem, value);
                                                    }
                                                }
                                                else if (selectedKey === 'Disc') {
                                                    const updatedInputDisc = inputDiscount;
                                                    const value = (parseFloat(updatedInputDisc + "" + e)).toFixed(2);
                                                    console.log(value);
                                                    if (value > 100) {
                                                        setInputDiscount(100);
                                                        contextValues.changeDiscountPercentage(selectedCartItem, 100);
                                                    } else {
                                                        setInputDiscount(updatedInputDisc + "" + e);
                                                        contextValues.changeDiscountPercentage(selectedCartItem, value);
                                                    }
                                                }
                                            } else {
                                                console.log(e)
                                            }
                                        }}
                                    />
                                </div>
                                <div className="controlPad__input--right">
                                    <div className="controlPad__input--right-1">
                                        <Keyboard
                                            layout={[
                                                ['Qty'],
                                                ['Disc'],
                                                // ['Price'],
                                                ['Sales Code'],
                                            ]}
                                            onKeyPress={e => {
                                                console.log(e)
                                                setSelectedKey(e)

                                                // if (e === 'Qty') {
                                                //     contextValues.increase(selectedCartItem)
                                                // }
                                            }}
                                            styleKey={{
                                                fieldName: `${selectedKey}`,
                                                backgroundColor: '#009999',
                                                color: '#fff'
                                            }}
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
                                                            if (contextValues.cartItems.length !== 0) {
                                                                setSelectedCartItem(contextValues.cartItems[contextValues.cartItems.length - 1]);
                                                                setIsCartItemSelected(true);
                                                            } else {
                                                                setSelectedCartItem(null);
                                                                setIsCartItemSelected(false);
                                                            }
                                                        } else {
                                                            console.log(inputQuantity)
                                                            let trimmedValue = 0;
                                                            if (inputQuantity.toString().length > 1) {
                                                                trimmedValue = (inputQuantity.toString()).slice(0, -1);
                                                            } else {
                                                                trimmedValue = 0;
                                                            }
                                                            const value = parseFloat(trimmedValue);
                                                            console.log(value)
                                                            contextValues.increaseByValue(selectedCartItem, value)
                                                            setInputPrice(0)
                                                            setInputQuantity(value);
                                                        }
                                                    }
                                                }
                                                // else if (selectedKey === 'Price') {
                                                //     contextValues.increaseByPrice(selectedCartItem, Math.trunc(inputPrice / 10));
                                                //     setInputPrice(Math.trunc(inputPrice / 10))
                                                // }
                                                else if (selectedKey === 'Sales Code') {
                                                    console.log(inputSalesCode);

                                                    if (inputSalesCode === 'SC') {
                                                        contextValues.setSalesCode(selectedCartItem, 'N/A');
                                                        setInputSalesCode('N/A');
                                                    } else if (inputSalesCode !== 'N/A') {
                                                        contextValues.setSalesCode(selectedCartItem, inputSalesCode.substring(0, 2) + inputSalesCode.slice(2, -1));
                                                        setInputSalesCode(inputSalesCode.substring(0, 2) + inputSalesCode.slice(2, -1));
                                                    }
                                                }
                                                else if (selectedKey === 'Disc') {
                                                    console.log(inputDiscount)
                                                    let trimmedValue = 0;
                                                    // const updatedInputDiscount = parseFloat(inputDiscount).toFixed(2);
                                                    if (inputDiscount.toString().length > 1) {
                                                        trimmedValue = (inputDiscount.toString()).slice(0, -1);
                                                    } else {
                                                        trimmedValue = 0;
                                                    }
                                                    const value = parseFloat(trimmedValue);
                                                    console.log(value)

                                                    contextValues.changeDiscountPercentage(selectedCartItem, value);
                                                    setInputDiscount(value)
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {infoPopupVisible && <div className="PCTAppContent__infoPopup">
                        <div className="PCTAppContent__infoPopup--box">
                            <div className="infoPopup__header">
                                <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <div className="buttonGroup__back">
                                        <Button variant='light' onClick={e => setInfoPopupVisible(false)}>Back</Button>
                                    </div>
                                    <div className="buttonGroup__title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                        <h3 style={{ color: '#fff' }}>Product Information</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="infoPopup__body">
                                <div className="infoPopup__body--productDetails">
                                    <div className="productDetails__name">{itemInfo.name}
                                        <div className="productDetails__subHead">Barcode: {itemInfo.barcode}</div>
                                        <div className="productDetails__subHead">Category: {itemInfo.category}</div>
                                        <div className="productDetails__subHead">kind Of Clothes: {itemInfo.kindOfLiquor}</div>
                                    </div>
                                    <div className="productDetails__rate">
                                        <div className="productDetails__rate--amount">Unit Price: {formatNumber(itemInfo.salesPrice)}</div>
                                        <div className="productDetails__subHead">Cost Price: {formatNumber(itemInfo.cost)}</div>
                                    </div>
                                </div>
                                <div className="infoPopup__body--productOthers">
                                    <div className="infoPopup__body--productOthers-left">
                                        <div className="infoPopup__body--productOthers-left-box">
                                            <div className="infoPopup__body--productOthers-heading">Inventory</div>
                                            <div className="infoPopup__body--productOthers-subHeading">Available unit: {itemInfo.available}</div>
                                            <div className="infoPopup__body--productOthers-subHeading">Forecasted unit: {itemInfo.forecasted}</div>
                                            <div className="infoPopup__body--productOthers-subHeading">On hand unit: {itemInfo.onHand}</div>
                                            <div className="infoPopup__body--productOthers-subHeading">Committed unit: {itemInfo.commited}</div>
                                        </div>
                                    </div>
                                    <div className="infoPopup__body--productOthers-right">
                                        <div className="infoPopup__body--productOthers-right-box">
                                            <div className="infoPopup__body--productOthers-heading">Order</div>
                                            <div className="infoPopup__body--productOthers-subHeading">Total Purchase Qty: {itemInfo.totalPurchasedQuantity}</div>
                                            <div className="infoPopup__body--productOthers-subHeading">Total Sold Qty: {itemInfo.totalSoldQuantity}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </Container>
        </Container >
    );
}
