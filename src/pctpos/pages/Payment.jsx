import './payment.css'
import { AgGridReact } from 'ag-grid-react';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
import { BsBackspaceFill, BsPersonCircle, BsXCircle, BsCheckCircle, BsPaintBucket, BsArrowDownCircle } from 'react-icons/bs';
import PaymentOptions from '../components/PaymentOptions';
// import { useHistory } from 'react-router-dom';
import { jsPDF } from "jspdf";
import Keyboard from '../../components/Keyboard';
import { CartContext } from '../../components/states/contexts/CartContext';
import { PaymentOptionContext } from '../../components/states/contexts/PaymentOptionContext';
import { CustomerContext } from '../../components/states/contexts/CustomerContext';
import { UserContext } from '../../components/states/contexts/UserContext';
import ApiService from '../../helpers/ApiServices';
import { formatNumber, infoNotification } from '../../helpers/Utils';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
require('jspdf-autotable');


const moment = require('moment');


export default function Payment() {
    const [state, setState] = useState();
    const [selectedPaymentOption, setSelectedPaymentOption] = useState();
    const [amountInputValue, setAmountInputValue] = useState(0);
    const [amountInputValue2, setAmountInputValue2] = useState(0);
    const [isAnyPaymentOptionSelected, setIsAnyPaymentOptionSelected] = useState(false);
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [changeAmount, setChangeAmount] = useState(0);
    const contextValues = useContext(CartContext);
    const [dueAmount, setDueAmount] = useState(contextValues.totalWithTaxes);
    const { paymentOptions, addPaymentOptions, removePaymentOptions, updatePaymentOptionAmount, clearAllPaymentOptions } = useContext(PaymentOptionContext);
    const [validateButtonType, setValidateButtonType] = useState('light');
    const { customer, updateCustomer } = useContext(CustomerContext);
    // const history = useHistory();
    const { user } = useContext(UserContext);
    const [keypadSign, setKeypadSign] = useState('+');
    const [paymentStatus, setPaymentStatus] = useState('incomplete');
    const [pageHeightState, setPageHeightState] = useState(4);
    const [employeeName, setEmployeeName] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();


    const createPaymentOptions = (mode, amount) => {
        return { _id: Date.now(), mode: mode, amount: amount };
    }

    const handlePaymentOptions = (mode) => {
        const amount = paymentOptions.length === 0 ? contextValues.totalWithTaxes : remainingAmount ? remainingAmount : 0;
        setAmountInputValue2(amount);
        setValidateButtonType('primary')
        // paymentOptions.length === 0 && setValidateButtonType('primary')
        const paymentOption = createPaymentOptions(mode, amount);
        setSelectedPaymentOption(paymentOption)
        addPaymentOptions(paymentOption)
        setIsAnyPaymentOptionSelected(true);
        setAmountInputValue(0);
        setRemainingAmount(0)

        console.log("hi");
        console.log(paymentOption);
    }

    const handleSelectPaymentOption = (paymentOption) => {
        console.log(paymentOption);
        setAmountInputValue2(paymentOption.amount);
        setSelectedPaymentOption(paymentOption);
        setAmountInputValue(0)
    }

    const handleDeletePaymentOptions = (paymentOption) => {
        removePaymentOptions(paymentOption);
        console.log(paymentOptions.length)
        paymentOptions.length <= 1 ? setIsAnyPaymentOptionSelected(false) : setIsAnyPaymentOptionSelected(true);
        paymentOptions.length <= 1 ? setValidateButtonType('light') : setValidateButtonType('primary');


        let paymentOptionTotalAmount = 0;
        const exceptSelectedPaymentOption = paymentOptions.filter(e => e._id !== paymentOption._id);
        console.log(exceptSelectedPaymentOption[exceptSelectedPaymentOption.length - 1]);
        setAmountInputValue2(exceptSelectedPaymentOption[exceptSelectedPaymentOption.length - 1] ? exceptSelectedPaymentOption[exceptSelectedPaymentOption.length - 1]?.amount : 0)
        setSelectedPaymentOption(exceptSelectedPaymentOption[exceptSelectedPaymentOption.length - 1] ? exceptSelectedPaymentOption[exceptSelectedPaymentOption.length - 1] : {})

        exceptSelectedPaymentOption.map(e => {
            paymentOptionTotalAmount += parseFloat(e.amount);
        });

        console.log(paymentOptionTotalAmount);

        if (paymentOptionTotalAmount === dueAmount) {
            setRemainingAmount(0);
            setChangeAmount(0);
            setValidateButtonType('primary')
        } else if (paymentOptionTotalAmount < dueAmount) {
            setChangeAmount(0)
            setRemainingAmount(dueAmount - paymentOptionTotalAmount);
            setValidateButtonType('light')
        } else if (paymentOptionTotalAmount > dueAmount) {
            setRemainingAmount(0)
            setChangeAmount(paymentOptionTotalAmount - dueAmount)
        }

        if (paymentOptions.length <= 1) {
            setRemainingAmount(0);
            setChangeAmount(0)
        }
    }

    const handleCustomer = () => {
        navigate("/pos/customers?stack=payment")
    }

    const handleValidateBtn = async () => {
        console.log(contextValues);
        console.log(user);
        console.log(customer);

        if (validateButtonType === 'primary') {
            let data = new Object();

            // console.log(customer);
            // console.log(user);

            let customerArr = [];
            let customerObj = {};
            customerObj.id = customer._id;
            customerObj.name = customer.name;
            customerArr.push(customerObj);
            data.customer = customerArr;

            let salesRepArr = [];
            let salesRepObj = {};
            salesRepObj.id = user._id;
            salesRepObj.name = user.name;
            salesRepArr.push(salesRepObj);
            data.salesRep = salesRepArr;

            // data.customer = customer._id;
            // data.salesRep = user._id;

            // data.date = "2022-02-05T18:30:00.000Z"
            const d = new Date();
            d.setHours(d.getHours() + 5);
            d.setMinutes(d.getMinutes() + 30);
            const date = d.toISOString();
            data.date = date;

            let products = [];
            contextValues.cartItems.map(e => {
                let product = {};

                let productArr = [];
                let productObj = {};
                productObj.id = e._id;
                productObj.name = e.name;
                productArr.push(productObj);

                console.log(productArr);

                product.product = productArr;
                product.name = e.name;
                product.description = e.description;
                product.quantity = e.quantity;
                // product.bottleSize = e.bottleSize;
                // product.kindOfLiquor = e.kindOfLiquor;
                // product.kindOfLiquorCode = e.kindOfLiquorCode;
                // product.brandName = e.brandName;
                // product.category = e.category;
                product.unitRate = e.salesPrice;
                product.discountPercentage = e.discountPercentage;
                product.mrp = e.salesPrice;
                product.subTotal = (e.quantity * e.salesPrice);
                product.grossAmount = (e.quantity * e.salesPrice);
                product.netAmount = ((e.quantity * e.salesPrice) - (((e.quantity * e.salesPrice) / 100) * e.discountPercentage));
                product.salesCode = e.salesCode;

                products.push(product);
            })
            data.products = products;

            let estimation = new Object();
            estimation.subTotal = parseFloat(contextValues.total).toFixed(2);
            estimation.discount = parseFloat(contextValues.totalDiscount).toFixed(2);
            estimation.cgst = (parseFloat((contextValues.taxes) / 2.00)).toFixed(2);
            estimation.sgst = (parseFloat((contextValues.taxes) / 2.00)).toFixed(2);
            estimation.igst = (parseFloat(contextValues.taxes)).toFixed(2);
            estimation.total = parseFloat(parseFloat(contextValues.totalWithTaxes)).toFixed(2);
            data.estimation = estimation;

            // const a = (((parseFloat(contextValues.total) / 100.00) * 5.0) * 2.0);
            // const b = parseFloat(contextValues.total);
            // const x = parseFloat(a + b).toFixed(2);
            // console.log(x)

            data.paymentMode = paymentOptions;

            console.log(data);

            ApiService.setHeader();
            const response = await ApiService.post('/cashSale', data);
            if (response.data.isSuccess) {
                console.log(response);

                const cashSaleRecord = response.data.document.products;

                cashSaleRecord?.map(product => {

                    console.log(product)
                    ApiService.get(`/product/${product.product[0].id}`).then(productResponse => {
                        console.log(productResponse.data.document);

                        let productToUpdate = productResponse.data.document;
                        productToUpdate.onHand = productToUpdate.onHand - product.quantity;
                        productToUpdate.totalSoldQuantity = productToUpdate.totalSoldQuantity + product.quantity;
                        productToUpdate.available = productToUpdate.onHand - productToUpdate.commited;
                        productToUpdate.incomeAccount = productToUpdate?.incomeAccount?.length > 0 ? productToUpdate?.incomeAccount : null;
                        productToUpdate.expenseAccount = productToUpdate?.expenseAccount?.length > 0 ? productToUpdate?.expenseAccount : null;
                        productToUpdate.assetAccount = productToUpdate?.assetAccount?.length > 0 ? productToUpdate?.assetAccount : null;
                        console.log(productToUpdate)

                        ApiService.patch(`/product/${product.product[0].id}`, productToUpdate).then(productUpdatedResponse => {
                            console.log(productUpdatedResponse);
                        }).catch(e => {
                            console.log(e);
                            alert(e.message);
                        })

                    }).catch(e => {
                        console.log(e);
                        alert(e.message);
                    })

                })

                setPaymentStatus('success');
                setState(response.data.document);
                // updateCustomer({ name: 'Walk-In Customer' });
                contextValues.clearCart();
                clearAllPaymentOptions();

                // handleInvoice(response.data.document);
                // handleReceipt(response.data.document);
            }
            // .then(response => {
            //     if (response.data.isSuccess) {
            //         // navigate("/pos");
            //     }
            // }).catch(e => {
            //     console.log(e);
            //     alert(e.message)
            // })

        } else {
            infoNotification("Not a valid payment process!")
            // alert("Not a valid payment process !!!")
        }

    }

    // const handleInvoice = (data) => {
    //     console.log(data);
    //     const doc = new jsPDF();
    //     var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    //     var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    //     doc.setFontSize(20);
    //     doc.setFont("helvetica", "bold");
    //     doc.text("POS ORDER", pageWidth / 2, 20, { align: 'center' });
    //     doc.save("pos.pdf")
    // }

    // const handleReceipt = (data) => {
    //     console.log(data);
    //     const doc = new jsPDF();
    //     var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    //     var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    //     doc.setFontSize(20);
    //     doc.setFont("helvetica", "bold");
    //     doc.text("POS ORDER RECEIPT", pageWidth / 2, 20, { align: 'center' });
    //     doc.save("pos.pdf")
    // }

    const handlePageHeightState = (height) => {
        setPageHeightState(height);
    }

    const handleReceipt = async (data) => {
        console.log(data);
        console.log(customer);
        console.log(user);

        var doc = new jsPDF({
            orientation: 'P',
            unit: 'in',
            format: [50, 2.5]
        });

        doc.setFontSize(8);

        const ress = await ApiService.patch(`product/getHsnByProduct`, data)
        console.log(ress?.data.document);
        let array = ress?.data.document;

        console.log(array);
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        console.log(pageHeightState)
        //let height = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("BAZIMAT F.L. SHOP", pageWidth / 2, 0.25, { align: 'center' });
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text("1A PARK STREET ROAD", pageWidth / 2, 0.35, { align: 'center' });
        doc.text("KOLKATA: 700016", pageWidth / 2, 0.45, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("CASH/BILL", pageWidth / 2, 0.70, { align: 'center' });

        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text("Sale ID: ", 0.2, 0.90, { align: 'left' });
        doc.text("00784", 0.55, 0.90, { align: 'left' });
        doc.text("Employee ID: ", 0.2, 1, { align: 'left' });
        doc.text("Cashier #0001", 0.75, 1, { align: 'left' });
        doc.text(`${data.date.substr(0, 10)}`, 2.3, 0.90, { align: 'right' });
        doc.text(`${data.date.substr(12, 19)}`, 2.3, 1, { align: 'right' });

        doc.setDrawColor(0, 0, 0);
        // doc.line(2.25, .025, .060, .025);

        let height = 0;
        doc.autoTable({
            // margin: { top: 280 },
            margin: { top: 1.1, left: 0.2, right: 0.2, bottom: 0 },
            // padding: { top: 0.1, left: 0.2, right: 0.2, bottom: 0 },
            styles: {
                fontSize: 6,
                fillColor: [255, 255, 255],
                halign: 'center',
            },
            columnStyles: {
                // europe: { halign: 'center' },
                0: { cellWidth: 1.25, fillColor: [255, 255, 255], halign: 'left' },
                1: { cellWidth: 0.75, fillColor: [255, 255, 255], halign: 'right' },
            },
            body: array,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: "black",
                // halign: "center",
                fontStyle: "bold",
                fontSize: 6,
            },
            columns: [
                { header: 'Items', dataKey: 'items', style: { halign: 'left' } },
                { header: 'Price', dataKey: 'price', style: { halign: 'right' } },
            ],
            didDrawPage: (d) => {
                height = d.cursor.y
            }, // calculate height of the autotable dynamically
        });

        doc.setFontSize(6);
        doc.text(`Subtotal: `, pageWidth - 0.50, height + 0.2, null, null, 'right');
        doc.text(`${data.estimation.subTotal}`, pageWidth - 0.25, height + 0.2, null, null, 'right');

        doc.text(`SGST: `, pageWidth - 0.50, height + 0.3, null, null, 'right');
        doc.text(`${data.estimation.sgst}`, pageWidth - 0.25, height + 0.3, null, null, 'right');

        doc.text(`CGST: `, pageWidth - 0.50, height + 0.4, null, null, 'right');
        doc.text(`${data.estimation.cgst}`, pageWidth - 0.25, height + 0.4, null, null, 'right');

        doc.setFont("normal", "bold");
        doc.setFontSize(8);
        doc.text(`Total: `, pageWidth - 0.50, height + 0.5, null, null, 'right');
        doc.text(`${data.estimation.total}`, pageWidth - 0.25, height + 0.5, null, null, 'right');

        doc.setFont("times", "italic");
        doc.setFontSize(6);
        doc.text("Payment mode", pageWidth - 0.25, height + 0.7, null, null, 'right');

        let paymentModeHeight = 0;
        data.paymentMode?.map((element, index) => {
            doc.text(`By ${element.mode}: `, pageWidth - 0.50, height + 0.8 + (index / 10), null, null, 'right');
            doc.text(`${parseFloat(element.amount)}`, pageWidth - 0.25, height + 0.8 + (index / 10), null, null, 'right');

            paymentModeHeight = height + 0.8 + (index / 10);
        });


        const x = doc.getLineHeight();
        console.log(x)

        console.log(height);
        console.log(pageHeightState);

        const newDocHeight = ((paymentModeHeight + 0.75) * 25.5);
        console.log(newDocHeight)

        var newDoc = new jsPDF({
            orientation: 'P',
            unit: 'mm',
            format: [newDocHeight, 63.5]
        });

        // let employeeName
        // ApiService.get(`employee/${data.salesRep}`).then(employeeResponse => {
        //     console.log(employeeResponse.data.document.name);
        //     employeeName = employeeResponse.data.document.name;
        // })


        var newPageHeight = newDoc.internal.pageSize.height || newDoc.internal.pageSize.getHeight();
        var newPageWidth = newDoc.internal.pageSize.width || newDoc.internal.pageSize.getWidth();
        //let height = newDoc.internal.pageSize.height || newDoc.internal.pageSize.getHeight();

        newDoc.setFont("helvetica", "bold");
        newDoc.setFontSize(8);
        newDoc.setTextColor(0, 0, 0);
        newDoc.text("TANAS CREATION LLP", newPageWidth / 2, 6.5, { align: 'center' });
        newDoc.setFontSize(6);
        newDoc.setFont("helvetica", "normal");
        newDoc.text("Aberdeen Bazar, Aberdeen, Port Blair", newPageWidth / 2, 9, { align: 'center' });
        newDoc.text("Andaman and Nicobar Islands 744101", newPageWidth / 2, 11.5, { align: 'center' });

        newDoc.setFontSize(10);
        newDoc.setFont("helvetica", "bold");
        newDoc.setTextColor(0, 0, 0);
        newDoc.text("CASH/BILL", newPageWidth / 2, 17.78, { align: 'center' });

        newDoc.setFontSize(6);
        newDoc.setFont("helvetica", "normal");
        newDoc.text("Employee: ", 3.5, 23, { align: 'left' });
        newDoc.text(`${user.name}`, 15, 22.86, { align: 'left' });
        newDoc.text("Customer: ", 3.5, 26, { align: 'left' });
        newDoc.text(`${customer?.name}`, 15, 26, { align: 'left' });
        newDoc.text("GSTIN: ", 3.5, 29, { align: 'left' });
        newDoc.text(`${customer?.gstin ? customer?.gstin : 'Not Available'}`, 13, 29, { align: 'left' });
        newDoc.text(`${data.date.substr(0, 10)}`, 60, 23, { align: 'right' });
        newDoc.text(`${data.date.substr(11, 8)}`, 60, 26, { align: 'right' });
        newDoc.text("Sale ID: ", 57.5, 29, { align: 'right' });
        newDoc.text(`${data.cashSaleId}`, 60, 29, { align: 'right' });

        console.log(customer);
        newDoc.setLineWidth(0.1);
        newDoc.setDrawColor(0, 0, 0);
        newDoc.setLineDash([1]);
        newDoc.line(3, 31, newPageWidth - 3, 31);

        newDoc.setFontSize(7);
        newDoc.setFont("helvetica", "bold");
        newDoc.text("Item Description", 3.5, 35, { align: 'left' });
        newDoc.text("Amount", 60, 35, { align: 'right' });

        newDoc.setLineWidth(0.1);
        newDoc.setDrawColor(0, 0, 0);
        newDoc.setLineDash([1]);
        newDoc.line(3, 38, newPageWidth - 3, 38);

        let newHeight = 0;
        newDoc.autoTable({
            // margin: { top: 280 },
            margin: { top: 39, left: 2.5, right: 2.5, bottom: 0 },
            styles: {
                fontSize: 6,
                fillColor: [255, 255, 255],
                halign: 'left',
                textColor: 'black'
            },
            columnStyles: {
                // europe: { halign: 'center' },
                0: { fillColor: [255, 255, 255] },
                1: { cellWidth: 20, fillColor: [255, 255, 255], halign: 'right' },
                // 0: { cellWidth},
                // 1: { cellWidth },
            },
            body: array,
            headStyles: {
                fillColor: [255, 255, 255],
            },
            columns: [
                { header: '', dataKey: 'items', halign: 'left', style: { halign: 'left' } },
                { header: '', dataKey: 'price', halign: 'right', style: { halign: 'right' } },
            ],
            didDrawPage: (d) => {
                newHeight = d.cursor.y
            }, // calculate newHeight of the autotable dynamically
        });

        newDoc.setLineWidth(0.1);
        newDoc.setDrawColor(0, 0, 0);
        newDoc.setLineDash([1]);
        newDoc.line(3, newHeight + 2, newPageWidth - 3, newHeight + 2);

        newDoc.setFont("helvetica", "normal");
        newDoc.setFontSize(6);
        newDoc.text(`Subtotal: `, newPageWidth - 18, newHeight + 6, null, null, 'right');
        newDoc.text(`${(data.estimation.subTotal).toFixed(2)}`, newPageWidth - 4, newHeight + 6, null, null, 'right');

        newDoc.text(`UTGST/SGST: `, newPageWidth - 18, newHeight + 9, null, null, 'right');
        newDoc.text(`${(data.estimation.sgst).toFixed(2)}`, newPageWidth - 4, newHeight + 9, null, null, 'right');

        newDoc.text(`CGST: `, newPageWidth - 18, newHeight + 12, null, null, 'right');
        newDoc.text(`${(data.estimation.cgst).toFixed(2)}`, newPageWidth - 4, newHeight + 12, null, null, 'right');

        newDoc.text(`IGST: `, newPageWidth - 18, newHeight + 15, null, null, 'right');
        newDoc.text(`${parseFloat(parseFloat((data.estimation.sgst).toFixed(2)) + parseFloat((data.estimation.cgst).toFixed(2))).toFixed(2)}`, newPageWidth - 4, newHeight + 15, null, null, 'right');

        newDoc.setFont("helvetica", "bold");
        newDoc.setFontSize(8);
        newDoc.text(`Total: `, newPageWidth - 18, newHeight + 19, null, null, 'right');
        newDoc.text(`${(data.estimation.total).toFixed(2)}`, newPageWidth - 4, newHeight + 19, null, null, 'right');

        newDoc.setLineWidth(0.1);
        newDoc.setDrawColor(0, 0, 0);
        newDoc.setLineDash([1]);
        newDoc.line((newPageWidth / 2) + 5, newHeight + 21, newPageWidth - 4, newHeight + 21);

        newDoc.setFont("times", "italic");
        newDoc.setFontSize(6);
        newDoc.text("Payment mode", newPageWidth - 4, newHeight + 24, null, null, 'right');
        console.log(data.paymentMode);

        let updatedPaymentOptionSelected = [];

        data.paymentMode?.map(element => {
            if (element.mode === 'Cash') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'Cash') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'Cash';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            } else if (element.mode === 'Card') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'Card') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'Card';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            } else if (element.mode === 'Cheque') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'Cheque') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'Cheque';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            } else if (element.mode === 'UPI') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'UPI') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'UPI';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            } else if (element.mode === 'Customer Account') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'Customer Account') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'Customer Account';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            } else if (element.mode === 'Discount') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'Discount') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'Discount';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            } else if (element.mode === 'Coupons') {
                let flag = false;
                updatedPaymentOptionSelected?.map(e => {
                    if (e?.mode === 'Coupons') {
                        e.amount += element.amount;
                        flag = true;
                    }
                })

                if (!flag) {
                    let paymentModeObj = new Object();
                    paymentModeObj.mode = 'Coupons';
                    paymentModeObj.amount = element.amount;
                    updatedPaymentOptionSelected.push(paymentModeObj)
                }

            }
        })

        console.log(updatedPaymentOptionSelected);

        let paymentMethodsHeight = 0;

        updatedPaymentOptionSelected?.map((element, index) => {
            newDoc.text(`By ${element.mode}: `, newPageWidth - 15, newHeight + 27 + (index * 3), null, null, 'right');
            newDoc.text(`${parseFloat(element.amount).toFixed(2)}`, newPageWidth - 4, newHeight + 27 + (index * 3), null, null, 'right');

            paymentMethodsHeight = newHeight + 27 + (index * 3);
        });

        newDoc.setFont("helvetica", "normal");
        newDoc.setFontSize(8);
        newDoc.text("THANK YOU", newPageWidth / 2, paymentMethodsHeight + 5, { align: 'center' });

        console.log(newHeight)
        // if (data.products.length == array.length) {

        newDoc.save('Receipt.pdf');
        // updateCustomer({ name: 'Walk-In Customer' });
        // }
    }

    const handleInvoice = (data) => {
        console.log(data);
        const doc = new jsPDF();
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        doc.setFontSize(20);
        // doc.setFont("sans-serif");
        doc.setFont("helvetica", "bold");
        doc.text("POS ORDER", pageWidth / 2, 20, { align: 'center' });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(17);
        doc.text(`INV/POS/0001`, 15, 40, { align: 'left' });
        doc.setFontSize(12);
        doc.setFont("bold");
        doc.text("Invoice Date:", 15, 45, { align: 'left' });
        doc.text(`${data.date?.split("T")[0]}`, 50, 50, { align: 'left' });
        doc.text("Due Date:", 15, 50, { align: 'left' });
        doc.text("Source:", pageWidth / 2, 45, { align: 'left' });
        doc.text("Reference:", pageWidth / 2, 50, { align: 'left' });
        let height = 200;
        console.log(data);
        let array = new Array();
        data?.products?.map((e) => {
            let obj = new Object();

            // obj.name = e.product[0].name;
            obj.description = e.description;
            obj.quantity = e.quantity;
            obj.hsn = e.hsn;

            obj.unitRate = e.salesPrice;
            obj.taxes = e.taxes + "%";
            obj.subTotal = e.total;
            array.push(obj);
        });
        console.log(array);
        doc.autoTable({

            // margin: { top: 280 },
            margin: { top: 60 },
            styles: {
                lineColor: [153, 153, 153],
                lineWidth: 0.5,
                // fillColor: [179, 179, 179],
            },
            columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 60 },
                2: { cellWidth: 20, halign: "center" },
                3: { cellWidth: 40, halign: "right" },
                4: { cellWidth: 40 },
                5: { cellWidth: 40, halign: "right" },
                6: { cellWidth: 40, halign: "left" },
            },
            // body: response.data.newinvoiceLines,
            body: array,
            columns: [
                // { header: "Product", dataKey: "productName" },
                { header: "Description", dataKey: "description" },
                { header: "Quantity", dataKey: "quantity", halign: "center" },
                { header: "Unit Rate", dataKey: "unitRate" },
                { header: "Taxes", dataKey: "taxes" },
                { header: "Amount", dataKey: "total" },
            ],
            didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
        });
        let h = height + 20;

        doc.line(100, h - 10, pageWidth - 15, h - 10);
        doc.setFontSize(12);
        doc.setFont("bold");
        doc.setTextColor(0, 0, 0);
        doc.setFont("bold");
        doc.text("Untaxed Amount", 100, h - 5, { align: 'left' });
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text("IGST:", 100, h);
        // doc.text(`${data.igstRate}`, 120, h);
        doc.text("SGST:", 100, h + 10);
        doc.line(100, h + 15, pageWidth - 15, h + 15);
        doc.setFont("bold");
        doc.text("Total", 100, h + 20, { align: 'left' });
        doc.line(100, h + 25, pageWidth - 15, h + 25);
        doc.text("Amount Due", 100, h + 30, { align: 'left' });
        doc.setFontSize(12);
        doc.text("Please use the following communication for your payment:", 15, h + 40,);
        doc.text(`${data.name}`, 118, h + 40,);
        doc.text("Total(In Words):", 15, h + 50,);
        doc.text(`${data.totalInWords}`, 118, h + 50,);
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`${pageCount}`, pageWidth - 15, h + 50, { align: 'right' });

        console.log(data);
        doc.save("pos.pdf")
    }

    const handleBack = () => {
        clearAllPaymentOptions();
        navigate('/pos');
    }

    useEffect(async () => {
        clearAllPaymentOptions();
    }, []);

    return <Container className="pct-app-content-container p-0 m-0" fluid>
        <Container className="pct-app-content-body p-0 m-0" fluid>
            <div className="PCTAppContent">
                {paymentStatus === 'success' ? <Container className="m-0 pb-2" fluid style={{
                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
                }}>
                    <Row className="justify-content-md-center" >
                        <Col style={{ textAlign: 'center' }}>
                            <BsCheckCircle style={{ fontSize: '10rem', color: '#009999', margin: '0 auto', paddingTop: '2rem', }} />
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <h3 style={{ color: 'rgb(103, 103, 103)' }}>Payment successfull!</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col></Col>
                        <Col style={{ textAlign: 'center' }}>
                            <Button className="button" onClick={() => handleInvoice(state)}>Download Invoice</Button>
                            <Button className="button" onClick={() => handleReceipt(state)}>Print Receipt</Button>
                        </Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col style={{ textAlign: 'center' }}>
                            <Button className="button" onClick={() => { updateCustomer({ name: 'Walk-In Customer' }); navigate('/pos') }} style={{ padding: '1rem', margin: '2rem' }}>CREATE NEW ORDER</Button>
                        </Col>
                    </Row>
                </Container> : <div className="paymentContainer">
                    <div className="paymentContainer__header">
                        <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <div className="buttonGroup__back">
                                <Button variant='light' onClick={handleBack}>Back</Button>
                            </div>
                            <div className="buttonGroup__title" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                <h3>Payment</h3>
                            </div>
                            <div className="buttonGroup__add" style={{ position: 'absolute', right: 0 }}>
                                <Button variant={`${validateButtonType}`} onClick={handleValidateBtn}>Validate & Print</Button>
                            </div>
                        </div>
                    </div>
                    <div className="paymentContainer__body">
                        <div className="paymentOptions">
                            <div className="paymentOptions__selected">
                                {paymentOptions?.map(paymentOption => <PaymentOptions paymentOption={paymentOption} onClick={handleSelectPaymentOption} selectedPaymentOption={selectedPaymentOption} handleDeletePaymentOptions={handleDeletePaymentOptions} />)}
                            </div>
                            <div className="paymentOptions__choice">
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('Discount')}>Discount</div>
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('Coupons')}>Coupons</div>
                            </div><br />
                            <div className="paymentOptions__choice">
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('Cash')}>Cash</div>
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('Card')}>Card</div>
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('Cheque')}>Cheque</div>
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('UPI')}>UPI</div>
                                <div className="paymentOptions__list paymentOptions__list-2" onClick={() => handlePaymentOptions('Customer Account')}>Customer Account</div>
                            </div>
                        </div>
                        <div className="paymentCalculate">
                            <div className="paymentCalculate__status">
                                {isAnyPaymentOptionSelected ? <><div className="paymentCalculate__remaining">
                                    <div className="paymentCalculate__status--label">Remaining</div>
                                    <div className="paymentCalculate__status--amount">{formatNumber(remainingAmount)}</div>
                                </div>
                                    <div className="paymentCalculate__change">
                                        <div className="paymentCalculate__status--label">Change</div>
                                        <div className="paymentCalculate__status--amount" style={{ color: '#000' }}>{formatNumber(changeAmount)}</div>
                                    </div>
                                    <div className="paymentCalculate__due">
                                        <div className="paymentCalculate__due--label">Total Due</div>
                                        <div className="paymentCalculate__due--amount">{formatNumber(dueAmount)}</div>
                                    </div></> :
                                    <div className="paymentCalculate__status--total">
                                        <div className="paymentCalculate__status--total-amount">{formatNumber(contextValues.totalWithTaxes)}</div>
                                        <div className="paymentCalculate__status--total-label">please select a payment method</div>
                                    </div>}
                            </div>
                            <div className="paymentCalculate__input">
                                <div className="keyboard">
                                    <Keyboard
                                        layout={[
                                            ['1', '2', '3', `${keypadSign}10`],
                                            ['4', '5', '6', `${keypadSign}20`],
                                            ['7', '8', '9', `${keypadSign}30`],
                                            [`${keypadSign}`, '0', '.', 'backspace']
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
                                        activeKey={[
                                            { fieldName: `${keypadSign}` }
                                        ]}
                                        onKeyPress={e => {
                                            console.log(e);
                                            console.log(selectedPaymentOption.mode);
                                            if (selectedPaymentOption.mode) {
                                                if (e === '+') {
                                                    setKeypadSign('-');
                                                    // console.log(amountInputValue2)
                                                    // const value = parseFloat(amountInputValue2);
                                                    // setAmountInputValue2(value);
                                                } else if (e === '-') {
                                                    setKeypadSign('+');
                                                    // console.log(amountInputValue2)
                                                    // const value = parseFloat(amountInputValue2);
                                                    // setAmountInputValue2(value);
                                                }

                                                if (selectedPaymentOption) {
                                                    console.log(selectedPaymentOption?.amount)
                                                    let value = selectedPaymentOption ? selectedPaymentOption?.amount : 0
                                                    if (e === '+10' || e === '+20' || e === '+30') {
                                                        const input = e.replace('+', '');
                                                        value = parseFloat(amountInputValue2) + parseFloat(input);
                                                        setAmountInputValue2(value);
                                                    } else if (e === '-10' || e === '-20' || e === '-30') {
                                                        const input = e.replace('-', '');
                                                        value = parseFloat(amountInputValue2) - parseFloat(input);
                                                        setAmountInputValue2(value);
                                                    } else {
                                                        if (e !== '+' && e !== '-') {
                                                            value = amountInputValue + "" + e;
                                                            setAmountInputValue2(value);
                                                        }
                                                    }

                                                    console.log(value)
                                                    setAmountInputValue(value);
                                                    updatePaymentOptionAmount(selectedPaymentOption, value);

                                                    let paymentOptionTotalAmount = parseFloat(value);
                                                    const exceptSelectedPaymentOption = paymentOptions.filter(paymentOption => selectedPaymentOption._id !== paymentOption._id);
                                                    exceptSelectedPaymentOption.map(paymentOption => {
                                                        paymentOptionTotalAmount += parseFloat(paymentOption.amount);
                                                    });

                                                    console.log(paymentOptionTotalAmount, dueAmount, remainingAmount);
                                                    if (paymentOptionTotalAmount >= dueAmount) {
                                                        setValidateButtonType('primary')
                                                        setRemainingAmount(0);
                                                    } else {
                                                        setValidateButtonType('light')
                                                    }

                                                    if (paymentOptionTotalAmount === dueAmount) {
                                                        console.log(paymentOptionTotalAmount, dueAmount);
                                                        setRemainingAmount(0);
                                                        setChangeAmount(0);
                                                    } else if (paymentOptionTotalAmount < dueAmount) {
                                                        setChangeAmount(0)
                                                        setRemainingAmount(dueAmount - paymentOptionTotalAmount);
                                                    } else if (paymentOptionTotalAmount > dueAmount) {
                                                        setRemainingAmount(0)
                                                        setChangeAmount(paymentOptionTotalAmount - dueAmount)
                                                    }


                                                    if (e === 'backspace') {
                                                        const value = Math.trunc(amountInputValue / 10);
                                                        setAmountInputValue(value)
                                                        let paymentOptionTotalAmount = parseFloat(value);
                                                        const exceptSelectedPaymentOption = paymentOptions.filter(paymentOption => selectedPaymentOption._id !== paymentOption._id);
                                                        exceptSelectedPaymentOption.map(paymentOption => {
                                                            paymentOptionTotalAmount += parseFloat(paymentOption.amount);
                                                        });

                                                        console.log(paymentOptionTotalAmount, dueAmount);
                                                        paymentOptionTotalAmount >= dueAmount ? setValidateButtonType('primary') : setValidateButtonType('light')

                                                        if (paymentOptionTotalAmount === dueAmount) {
                                                            setRemainingAmount(0);
                                                            setChangeAmount(0);
                                                        } else if (paymentOptionTotalAmount < dueAmount) {
                                                            setChangeAmount(0)
                                                            setRemainingAmount(dueAmount - paymentOptionTotalAmount);
                                                        } else if (paymentOptionTotalAmount > dueAmount) {
                                                            setRemainingAmount(0)
                                                            setChangeAmount(paymentOptionTotalAmount - dueAmount)
                                                        }

                                                        updatePaymentOptionAmount(selectedPaymentOption, value > 0 ? value : 0);
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="others">
                                    <div className="others__list selected" onClick={handleCustomer}><BsPersonCircle size={35} />&nbsp;&nbsp;{customer.name ? customer.name : 'Customer'}</div>
                                    {/* <div className={`${validateButtonType === 'primary' ? 'others__list selected' : 'others__list'}`} onClick={handleValidateBtn}><BsArrowDownCircle size={35} />&nbsp;&nbsp;Print</div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </Container>
    </Container >;
}
