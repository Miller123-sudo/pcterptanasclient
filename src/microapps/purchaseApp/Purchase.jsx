import { React, useState, useEffect, useContext } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Card, Form, Breadcrumb, FormSelect } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { BsArrowLeft, BsArrowRight, BsFillCreditCardFill, BsFillBarChartFill } from 'react-icons/bs';
import { DiGhostSmall } from "react-icons/di";
import { FiAlignJustify } from "react-icons/fi"
import { RiToggleFill, RiToggleLine } from "react-icons/ri";
import Switch from "react-switch";
import ApiService from '../../helpers/ApiServices'
import { errorMessage, infoNotification, isBillAmountEqualPurchaseAmount } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppFormTitle from '../../pcterp/components/AppFormTitle'
import SelectField from '../../pcterp/field/SelectField'
import TextArea from '../../pcterp/field/TextArea'
import TextField from '../../pcterp/field/TextField'
import DateField from '../../pcterp/field/DateField'
import Decimal128Field from '../../pcterp/field/Decimal128Field';
import LogHistories from '../../pcterp/components/LogHistories';
import CheckboxField from '../../pcterp/field/CheckboxField';
import { UserContext } from '../../components/states/contexts/UserContext';
import { PurchaseOrderPDF, BarcodePDF } from '../../helpers/PDF';
import AppContentLine from '../../pcterp/builder/AppContentLine';
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import AppLoader from '../../pcterp/components/AppLoader';
import AppContentHeaderPanel from '../../pcterp/builder/AppContentHeaderPanel';
import AppContentStatusPanel from '../../pcterp/builder/AppContentStatusPanel';
import swal from "sweetalert2"
import Calculator from '../../pcterp/components/Calculator';
import ManualEnterCostAndMrp from '../../pcterp/components/ManualEnterCostAndMRP';
import SearchByBarcodeAndUpdateCost from '../../pcterp/components/SearchByBarcodeAndUpdateCost';
import NumberField from '../../pcterp/field/NumberField';

export default function Purchase() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [productReceiptCount, setProductReceiptCount] = useState(0);
    const [billedCount, setBilledCount] = useState(0)
    const { user } = useContext(UserContext)
    const [allProductReceiptCount, setAllProductReceiptCount] = useState([])
    const [billObj, setbillObj] = useState(null)
    const [state, setState] = useState({
        estimation: {
            untaxedAmount: 0,
            tax: 0,
            total: 0
        }
    })
    const [productMasterList, setProductMasterList] = useState([])
    const [groupMasterList, setGroupMasterList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [firstCategoryList, setFirstCategoryList] = useState([])
    const [sizeList, setSizeList] = useState([])
    const [secondCategoryList, setSecondCategoryList] = useState([])
    const [calculatorObj, setcalculatorObj] = useState()
    const [manualEnterCostMRP, setmanualEnterCostMRP] = useState()
    const [updatedProductsCost, setupdatedProductsCost] = useState()
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [ShowManualModal, setShowManualModal] = useState(false);
    const [ShowCalclatorBtn, setShowCalclatorBtn] = useState(false);
    const [showSearchByBarcode, setshowSearchByBarcode] = useState(false);
    const [ShowChartBtn, setShowChartBtn] = useState(true);
    const [ShowManualBtn, setShowManualBtn] = useState(false);
    const [productGrade, setproductGrade] = useState([])
    const [productList, setProductList] = useState([])
    const [MaxMinSizeList, setMaxMinSizeList] = useState([])
    const [productGradeList, setproductGradeList] = useState([])
    const [pricingType, setpricingType] = useState(["Chart", "Calculator", "Manual"])
    const [vendors, setvendors] = useState([])
    const [colleapseRange, setcolleapseRange] = useState(false);
    const [toggle, settoggle] = useState(false);
    const [colleapse, setcolleapse] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();



    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            purchaseRep: [{ id: user?._id, name: user?.name }],
            vendor: null,
            total: 0,
            billingStatus: 'Nothing to Bill',
            date: new Date().toISOString().split("T")[0],
            receiptDate: new Date().toISOString().split("T")[0]
        }
    });

    const { append: productAppend, remove: productRemove, fields: productFields } = useFieldArray({ control, name: "products" });


    let totalPurchasedQuantity = 0;
    let totalBilledQuantity = 0;
    let totalReceivedQuantity = 0;
    let totalReceived = 0;
    let totalBilled = 0;

    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        formData.billId = billObj?._id
        // if (isBillAmountEqualPurchaseAmount(formData)) {
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
        // } else {
        //     infoNotification("Selected bill's total amount is must equal to purchase order's total amount")
        // }
    }

    const createDocument = (data) => {

        ApiService.setHeader();
        return ApiService.post('/purchaseOrder', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/purchases/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/purchaseOrder/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/purchases/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/purchaseOrder/${id}`).then(response => {
            if (response.status === 204) {
                navigate(`/${rootPath}/purchases/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/purchaseOrder/${id}`).then(async response => {
            const document = response?.data.document;
            console.log(document);
            setState(document)
            reset(document);
            setValue('date', document?.date?.split("T")[0]);
            setValue('receiptDate', document?.receiptDate?.split("T")[0]);
            setValue('vendor', document?.vendor);

            // const res = await ApiService.post(`/newBill/getBillByName/`, { name: document?.bill.split(" ")[0] })
            // if (res.data.isSuccess) {
            //     setbillObj(res?.data.document)
            //     // setshow(true)
            // }

            setLoderStatus("SUCCESS");

        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    // Helper Functions
    const handleVendorBill = async () => {
        if (state?.bill) {
            navigate(`/${rootPath}/bills/edit/` + state?.bill[0]._id);
        } else {
            navigate(`/${rootPath}/bills/billed/` + state?.id);
        }
    }

    const handlePrintOrder = async () => {
        console.log(state._id)
        PurchaseOrderPDF.generatePurchaseOrderPDF(state._id);
        return;
    }

    const handleReceiveProducts = () => {
        navigate("/purchase/receivedproducts/edit/" + state.productReceipt);

    }

    const createBillData = (document) => {
        if (!document) return;

        let data = {};

        data.sourceDocument = document._id;
        data.sourceDocumentArray = [{ id: document._id, name: document.name }]
        data.vendor = document.vendor[0].id;
        data.vendorArray = document.vendor;

        let invoiceLines = [];

        document.products.map(product => {
            const invoiceItem = {};
            console.log(product);
            invoiceItem.accountArray = product.account;
            invoiceItem.account = product.account[0].id;
            invoiceItem.productArray = product.product;
            invoiceItem.product = product.product[0].id;
            invoiceItem.label = product.description;
            invoiceItem.quantity = product.quantity;
            invoiceItem.unitPrice = product.unitPrice;
            invoiceItem.taxes = product.taxes;
            invoiceItem.subTotal = product.subTotal;
            invoiceItem.purchaseOrder = document._id;
            invoiceItem.unitArray = product.unit;
            invoiceItem.unit = product.unit[0].id;
            invoiceLines.push(invoiceItem);
        })

        data.invoiceLines = invoiceLines;
        data.estimation = document.estimation;

        return data;
    }


    const handleCreateBill = async () => {
        console.log("response - 1 ");
        console.log(state)
        const billData = await createBillData(state);
        console.log(billData);
        state?.products?.map(e => {
            totalReceived += parseInt(e.received)
            totalBilled += parseInt(e.billed)
        })
        if (totalReceived === totalBilled) {
            console.log("response - 2");
            alert("Please received product first!!!")
        } else {
            console.log("response - 3");
            const response = await ApiService.post('newBill', billData);
            console.log(response);
            if (response.data.isSuccess) {
                console.log(response);
                const PO = await ApiService.get('purchaseOrder/' + state.id);
                console.log(PO);
                PO.data.document?.products?.map(e => {
                    console.log(e);
                    totalPurchasedQuantity += parseInt(e.quantity);
                    totalBilledQuantity += parseInt(e.billed);
                    totalReceivedQuantity += parseInt(e.received);
                })
                console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                console.log("totalReceivedQuantity: ", totalReceivedQuantity);
                console.log("totalBilledQuantity: ", totalBilledQuantity);

                if (totalPurchasedQuantity === totalBilledQuantity) {

                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Fully Billed' }).then(async res => {
                        if (res.data.isSuccess) {
                            console.log(res)
                            await ApiService.patch('purchaseOrder/increaseProductqty/' + res.data.document._id, res.data.document).then(r => {
                                if (r.data.isSuccess) {
                                    navigate("/purchase/bills");
                                }
                            })
                        }
                    })
                } else if (totalPurchasedQuantity === totalReceivedQuantity) {
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Fully Received / Partially billed' })
                } else {
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Partially Received / Billed' })
                }

                navigate("/purchase/bills/edit/" + response.data.document.id);
            }
        }
    }
    const openTransferedProduct = () => {
        navigate("/purchase/received/" + state.id);
    }

    const updateOrderLines = (index) => {
        let cumulativeSum = 0, totalTax = 0;
        const products = getValues('products')
        console.log(products);
        products?.map((val) => {
            cumulativeSum += parseFloat(val?.subTotal);
            // totalTax += (parseFloat(val?.taxes[0]) * parseFloat(val?.subTotal)) / 100
            totalTax += (parseFloat(val?.taxes) * parseFloat(val?.subTotal)) / 100
        });


        setValue("estimation", {
            untaxedAmount: parseFloat(cumulativeSum).toFixed(2),
            tax: parseFloat(totalTax).toFixed(2),
            total: parseFloat(cumulativeSum + totalTax).toFixed(2)
        });

        setState(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: parseFloat(cumulativeSum).toFixed(2),
                tax: parseFloat(totalTax).toFixed(2),
                total: parseFloat(cumulativeSum + totalTax).toFixed(2)
            }
        }));
    }

    const calculatePRCount = async () => {
        ApiService.setHeader();
        const productReceiptResponse = await ApiService.get('productReceipt/searchByPO/' + id);
        if (productReceiptResponse.data.isSuccess) {
            setProductReceiptCount(productReceiptResponse.data.results)
        }

    }

    const calculateBilledCount = async () => {
        ApiService.setHeader();
        const billResponse = await ApiService.get('newBill/searchByPO/' + id);
        console.log(billResponse);
        if (billResponse.data.isSuccess) {
            setBilledCount(billResponse.data.results)
        }
    }

    const calculateAllPRCount = async () => {
        ApiService.setHeader();
        const AllproductReceiptResponse = await ApiService.get('productReceipt/searchAllPRByPO/' + id);
        if (AllproductReceiptResponse.data.isSuccess) {
            setAllProductReceiptCount(AllproductReceiptResponse.data.results)
        }
    }

    // Code for item category
    const filterCategory = async (event) => {
        let responseData;
        try {
            if (event.target.value != "productGrade")
                responseData = await ApiService.get(`itemCategory/search?parent=${event.target.value}`)


            switch (event.target.id) {
                case 'productMaster':
                    setGroupMasterList(responseData?.data.document)
                    break;
                case 'groupMaster':
                    setBrandList(responseData?.data.document)
                    break;
                case 'brand':
                    setFirstCategoryList(responseData?.data.document)
                    break;
                case 'firstCategory':
                    setSecondCategoryList(responseData?.data.document)
                    break;
                case 'secondCategory':
                    setSizeList(responseData?.data.document)
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log(e.response.data.message);
            errorMessage(e, null)
        }
    }

    const roundOff = 5;
    class TanasUtils {

        /**
         * This method is use to find the Price of each size in a pack.
         * 
         * @param {Number} min Minimum size in the pack
         * @param {*} max Maximum size in the pack.
         * @param {Number} basePrice Base Price
         * @param {Number} expense Expense
         * @param {Number} transportChargePer Transportation charge in number. eg. 8% is 8, 40% is 40
         * @param {Number} profitPer Profit Percentage in number. eg. 45% is 45, 75% is 75.
         * @param {Number} gst GST Percentage in number
         * @returns Object
         */
        calculatePrice(min, max, basePrice, expense, transportChargePer, profitPer, gst) {
            let arrayOfSize = new Array();

            const priceFactor = this.findPriceFactor(basePrice);
            const result = this.findMedian(min, max);

            if (result.median) {
                for (var i = min; i <= max; i += 2) {

                    let totalPrice = ((basePrice + (i - result.median) * (priceFactor) / 2) + expense);
                    //console.log(i, (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / 5)) * 5)
                    const eachSize = {
                        size: i,
                        price: (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / roundOff)) * roundOff
                    }

                    arrayOfSize.push(eachSize);
                }
                return arrayOfSize;
            } else {
                return "Something went wrong, please check the size you have provided!"
            }
        }


        /**
         * This method is use to find the median(the middle value) in a list ordered from smallest to largest.
         * 
         * @param {Number} min - Minimun size in the pack.
         * @param {Number} max - Maximum size in the pack.
         * @returns Object
         */
        findMedian(min, max) {
            let sumOfSize = (min + max) / 2;
            return { median: sumOfSize }
        }

        isOddNumberOfSize(min, max) {
            let sumOfSize = (min + max) / 2;
            if (sumOfSize % 2 == 0)
                return { isOdd: true, median: sumOfSize };
            else return { isOdd: false, median: sumOfSize };
        }


        /**
         * This method is use to find the price factor
         * Rules
         * price: 1 - 25 return 1
         * price: 26 - 50 return 2
         * price: 51 - 75 return 3
         * ..
         * ..
         * price: 501 - 525 return 21
         * @param {Number} price - Base price of the product.
         * @returns Number
         */
        findPriceFactor(price) {
            let result = price / 25;
            return Math.ceil(result);
        }
    }

    const createProduct = async (formData, itemName) => {
        // Create single product if max min size ia not present
        let sizeResponse, document, costPrice;
        console.log("min and max size not present");
        console.log(formData);
        console.log(formData.itemQty);
        // if (formData.size != "Choose..") {
        try {
            if (getValues("pricingType") == "Chart") {
                console.log("chart");
                const res = await ApiService.patch(`priceChartUpload/findMRP?search=${formData.costPrice}`)
                console.log(res);
                if (res.data.isSuccess) {
                    document = res.data.document
                    costPrice = formData.costPrice
                } else {
                    infoNotification("Given cost price is not in the range of price list. Please select 'Calculator' or 'Manual'")
                }
            } else if (getValues("pricingType") == "Calculator") {
                document = calculatorObj
                costPrice = calculatorObj.costPrice
            } else if (getValues("pricingType") == "Manual") {
                document = manualEnterCostMRP
                costPrice = manualEnterCostMRP.cost
            }
            // if (res.data.isSuccess) {

            //find size
            if (formData.size != "Choose..") {
                sizeResponse = await ApiService.get(`itemCategory/${formData.size}`)
            }
            // if (sizeResponse?.data.isSuccess) {
            const r = await ApiService.post(`product/procedure`, {
                name: `${itemName}_${costPrice}`,
                description: `${itemName}`,
                // cost: formData.costPrice,
                cost: costPrice,
                HSNSACS: getValues("hsn"),
                salesPrice: document.MRP,
                igstRate: document.MRP >= 1000 ? 12.00 : 5.00,
                sgstRate: document.MRP >= 1000 ? parseFloat(12 / 2).toFixed(2) : parseFloat(5 / 2).toFixed(2),
                utgstRate: document.MRP >= 1000 ? parseFloat(12 / 2).toFixed(2) : parseFloat(5 / 2).toFixed(2),
            })
            if (r.data.isSuccess) {
                // itemId = await r.data.document.id;
                await updateProductList();

                let products = getValues('products')
                let obj = new Object()
                obj.barcode = r?.data.document.barcode
                obj.product = [r.data.document]
                obj.quantity = 1
                obj.description = r.data.document?.description
                obj.unit = r.data.document?.uom
                obj.size = sizeResponse?.data.document.name ? sizeResponse?.data.document.name : ""
                obj.unitPrice = r.data?.document.cost
                obj.mrp = r.data?.document.salesPrice
                obj.taxes = r.data?.document.igstRate
                obj.subTotal = r.data?.document.cost
                obj.HSNSACS = r.data?.document.HSNSACS
                obj.received = 0
                obj.billed = 0
                obj.index = products.length
                products.push(obj)
                console.log(obj);
                setValue(`products`, products)

                // resetItemCategory() // test
            }
            // }

        } catch (e) {
            console.log(e);
            errorMessage(e, null)
        }
    }

    const generateItemName = async () => {

        const formData = getValues();
        console.log(formData);

        const categoryObjArr = [
            {
                categoryValue: formData.productMaster,
                listName: productMasterList
            },
            {
                categoryValue: formData.groupMaster,
                listName: groupMasterList
            },
            {
                categoryValue: formData.brand,
                listName: brandList
            },
            {
                categoryValue: formData.firstCategory,
                listName: firstCategoryList
            },
            {
                categoryValue: formData.secondCategory,
                listName: secondCategoryList
            },
            {
                categoryValue: formData.size,
                listName: sizeList
            }
        ]

        let itemId = "";
        let itemCostPrice = "";
        let cstPrice;
        let itemName = createItemName(categoryObjArr);
        // setValue("name", itemName)
        if (getValues("pricingType") == "Chart") {
            console.log("chart");
            cstPrice = getValues("costPrice")
        } else if (getValues("pricingType") == "Calculator") {
            cstPrice = calculatorObj.costPrice
        } else if (getValues("pricingType") == "Manual") {
            cstPrice = manualEnterCostMRP.cost
        }
        console.log(`${itemName}_${cstPrice}`);

        if (itemName !== '') {
            await ApiService.get(`product/search/${itemName}_${cstPrice}?costPrice=${getValues("costPrice")}`)
                .then(async response => {
                    if (response.data.isSuccess && response.data.document.length > 0) {
                        console.log(response.data.document);
                        itemId = response.data.document[0].id
                        itemCostPrice = response.data.document[0].costPrice
                        await updateProductList();
                        if (itemId) {
                            console.log("Item already present in database");
                            // swal.fire({
                            //     title: "Item already present in database",
                            //     buttons: false
                            // })

                            swal.fire({
                                title: response.data.isCostSame ? `Item already present in database and its cost(${response.data.document[0].cost}) is same` : `Item already present in database and its cost(${response.data.document[0].cost}) is not same`,
                                text: "Do you want to change the cost price of this product ? (If yes then give new price and click 'OK' otherwise 'Cancel')",
                                input: 'number',
                                showCancelButton: true
                            }).then(async (result) => {
                                console.log(result.value);
                                if (result.value == undefined || result.value == '') {
                                    infoNotification("please enter something on the popup");
                                    setInLine(response.data.document[0]);
                                } else {
                                    // Upadte cost and MRP of that product 
                                    await ApiService.patch(`priceChartUpload/findMRP?search=${result.value}`).then(async r => {
                                        if (r.data.isSuccess) {
                                            let cost = parseFloat(result.value).toFixed(2)
                                            let salesPrice = parseFloat(r.data.document.MRP).toFixed(2)
                                            let igstRate = r.data.document.MRP >= 1000 ? 12.00 : 5.00
                                            let sgstRate = r.data.document.MRP >= 1000 ? 6.00 : 2.50

                                            await ApiService.patch(`product/${response.data.document[0]._id}`, { cost: cost, salesPrice: salesPrice, igstRate: igstRate, sgstRate: sgstRate, utgstRate: sgstRate }).then(res => {
                                                if (res.data.isSuccess) {
                                                    infoNotification("Cost update successfull")
                                                    setValue("costPrice", result.value)
                                                    setInLine(res.data.document);

                                                } else {
                                                    infoNotification("Can't update cost")
                                                }
                                            })
                                        }
                                    })
                                    // await ApiService.patch(`product/${response.data.document[0]._id}`, { cost: parseFloat(result.value).toFixed(2) }).then(res => {
                                    //     if (res.data.isSuccess) {
                                    //         infoNotification("Cost update successfull")
                                    //         setValue("costPrice", result.value)
                                    //     } else {
                                    //         infoNotification("Can't update cost")
                                    //     }
                                    // })
                                }
                            })

                        } else {
                            infoNotification("cost price is not same. so create product new cost price")
                            createProduct(formData, itemName)
                        }
                    }
                    else {

                    }
                })
                .catch(e => {
                    console.log(e.response?.data.message);
                    // errorMessage(e, dispatch)
                })

            let productListLength = formData.products?.length
            let itemAlreadyPresent = formData.products?.findIndex(element => (element.product[0]._id === itemId && element.unitPrice == itemCostPrice));
            let categoryQty = formData.itemQty
            if (itemAlreadyPresent === -1) {
                // itemAppend({})
                // setValue(`products.${productListLength}.product`, itemId)

                // Generate items according to sizes and set in line
                if (parseInt(formData.minimunSize) && parseInt(formData.mazimumSize) && parseInt(formData.size)) {
                    infoNotification("Either select only size or select max and min size")
                } else if (parseInt(formData.minimunSize) && parseInt(formData.mazimumSize)) {
                    console.log("min and max size present");
                    const itmName = createItemNameForRange(categoryObjArr)
                    console.log(itmName);
                    createAndSetItems(formData, itmName)
                } else {
                    // Create single product if max min size ia not present
                    let sizeResponse, document, costPrice, gst;
                    console.log("min and max size not present");
                    console.log(formData);
                    console.log(formData.itemQty);
                    // if (formData.size != "Choose..") {
                    try {
                        if (getValues("pricingType") == "Chart") {
                            console.log("chart");
                            const res = await ApiService.patch(`priceChartUpload/findMRP?search=${formData.costPrice}`)
                            console.log(res);
                            if (res.data.isSuccess) {
                                document = res.data.document
                                costPrice = formData.costPrice
                            } else {
                                infoNotification("Given cost price is not in the range of price list. Please select 'Calculator' or 'Manual'")
                            }
                        } else if (getValues("pricingType") == "Calculator") {
                            document = calculatorObj
                            costPrice = calculatorObj.costPrice
                            gst = calculatorObj.gst
                        } else if (getValues("pricingType") == "Manual") {
                            document = manualEnterCostMRP
                            costPrice = manualEnterCostMRP.cost
                        }
                        // if (res.data.isSuccess) {

                        //find size
                        if (formData.size != "Choose..") {
                            sizeResponse = await ApiService.get(`itemCategory/${formData.size}`)
                        }
                        // if (sizeResponse?.data.isSuccess) {
                        const r = await ApiService.post(`product/procedure`, {
                            name: `${itemName}_${costPrice}`,
                            description: `${itemName}`,
                            // cost: formData.costPrice,
                            cost: costPrice,
                            HSNSACS: getValues("hsn"),
                            salesPrice: document.MRP,
                            igstRate: getValues("pricingType") == "Calculator" ? gst : document.MRP >= 1000 ? 12.00 : 5.00,
                            sgstRate: getValues("pricingType") == "Calculator" ? parseFloat(parseFloat(gst) / 2).toFixed(2) : document.MRP >= 1000 ? parseFloat(12 / 2).toFixed(2) : parseFloat(5 / 2).toFixed(2),
                            utgstRate: getValues("pricingType") == "Calculator" ? parseFloat(parseFloat(gst) / 2).toFixed(2) : document.MRP >= 1000 ? parseFloat(12 / 2).toFixed(2) : parseFloat(5 / 2).toFixed(2),
                        })
                        if (r.data.isSuccess) {
                            itemId = await r.data.document.id;
                            await updateProductList();

                            let products = getValues('products')
                            let obj = new Object()
                            obj.barcode = r?.data.document.barcode
                            obj.product = [r.data.document]
                            obj.quantity = 1
                            obj.description = r.data.document?.description
                            obj.unit = r.data.document?.uom
                            obj.size = sizeResponse?.data.document.name ? sizeResponse?.data.document.name : ""
                            obj.unitPrice = r.data?.document.cost
                            obj.mrp = r.data?.document.salesPrice
                            obj.taxes = r.data?.document.igstRate
                            obj.subTotal = r.data?.document.cost
                            obj.HSNSACS = r.data?.document.HSNSACS
                            obj.received = 0
                            obj.billed = 0
                            obj.index = products.length
                            products.push(obj)
                            console.log(obj);
                            setValue(`products`, products)

                            // resetItemCategory() // test
                        }
                        // }

                    } catch (e) {
                        console.log(e);
                        // errorMessage(e, dispatch)
                    }
                    // } else {
                    //     infoNotification("Please select size")
                    // }
                }
                updateOrderLines();
            } else {
                swal.fire({
                    title: "Item already present in line",
                    text: "Quantity will be added by 1. Do you want to proceed?",
                    buttons: true
                }).then(data => {
                    if (data) {
                        let lineData = getValues(`products.${itemAlreadyPresent}`)
                        console.log(parseFloat(formData));
                        console.log(parseFloat(formData.itemQty) + parseFloat(lineData.quantity));
                        setValue(`products.${itemAlreadyPresent}.quantity`, 1 + parseFloat(lineData.quantity))
                        setValue(`products.${itemAlreadyPresent}.subTotal`, (getValues(`products.${itemAlreadyPresent}.quantity`)) * parseInt(getValues(`products.${itemAlreadyPresent}.unitPrice`)));
                        updateOrderLines();
                    }
                })
            }
        }
        updateOrderLines()
        // resetItemCategory()


    }

    const createAndSetItems = async (formData, itemName) => {
        const products = getValues("products")
        let array = new Array();
        let sizeResponse, document, costPrice;

        if (getValues("pricingType") == "Chart") {
            console.log("chart");
            const res = await ApiService.patch(`priceChartUpload/findMRP?search=${formData.costPrice}`)
            console.log(res);
            if (res.data.isSuccess) {
                document = res.data.document
                costPrice = formData.costPrice
            } else {
                infoNotification("Given cost price is not in the range of price list. Please select 'Calculator' or 'Manual'")
            }
        } else if (getValues("pricingType") == "Calculator") {
            document = calculatorObj
            costPrice = calculatorObj.costPrice
        } else if (getValues("pricingType") == "Manual") {
            document = manualEnterCostMRP
            costPrice = manualEnterCostMRP.cost
        }

        const tanasUtil = new TanasUtils();
        const rangeArray = tanasUtil.calculatePrice(parseInt(formData.minimunSize), parseInt(formData.mazimumSize), parseInt(formData.costPrice), 15, 8, 40, 5)
        console.log(rangeArray);

        rangeArray?.map(async e => {
            let obj = new Object()
            console.log(itemName + e.size + productGrade);

            try {
                const response = await ApiService.get(`product/search/${itemName}_${e.size}_${costPrice}`)
                if (response.data.document.length > 0) {
                    infoNotification("Item already present in database for max min")
                } else {
                    const res = await ApiService.post(`product/procedure`, {
                        name: `${itemName}_${e.size}_${costPrice}`,
                        description: `${itemName}_${e.size}`,
                        // cost: formData.costPrice,
                        cost: costPrice,
                        salesPrice: e.price,
                        HSNSACS: getValues("hsn"),
                        igstRate: e.price >= 1000 ? 12.00 : 5.00,
                        sgstRate: e.price >= 1000 ? parseFloat(12 / 2).toFixed(2) : parseFloat(5 / 2).toFixed(2),
                        utgstRate: e.price >= 1000 ? parseFloat(12 / 2).toFixed(2) : parseFloat(5 / 2).toFixed(2),
                    })

                    if (res.data.isSuccess) {
                        obj.barcode = res.data.document.barcode
                        obj.product = [res.data.document]
                        obj.quantity = 1
                        obj.description = res.data.document?.description
                        obj.unit = res.data.document?.uom
                        obj.size = parseInt(e.size)
                        obj.unitPrice = parseInt(formData.costPrice)
                        obj.mrp = parseInt(e.price)
                        obj.taxes = res?.data.document?.igstRate
                        // obj.salesPrice = parseInt(e.price)
                        obj.subTotal = parseInt(formData.costPrice)
                        obj.HSNSACS = res.data?.document.HSNSACS
                        obj.received = 0
                        obj.billed = 0
                        obj.index = products.length
                        products.push(obj)

                        await updateProductList();
                        updateOrderLines()
                        // resetItemCategory() // test
                    }

                    // if (products.length == rangeArray.length + 1) {
                    console.log("final array: ", products);
                    setValue("products", products)
                    // categoryQty ? setValue(`products.${productListLength}.quantity`, formData.itemQty) : setValue(`products.${productListLength}.quantity`, 0)
                    // }
                }
            } catch (e) {
                console.log(e.response.data.message);
                // errorMessage(e, dispatch)
            }
        })
    }

    const setInLine = (productData) => {
        let products = getValues('products')
        let obj = new Object()
        obj.barcode = productData.barcode
        obj.product = [productData]
        obj.quantity = 1
        obj.size = productData?.name.split("_")[productData?.name.split("_").length - 2]
        obj.unitPrice = productData.cost
        obj.mrp = productData.salesPrice
        obj.taxes = productData.igstRate
        obj.subTotal = productData.cost
        obj.HSNSACS = productData.HSNSACS
        obj.received = 0
        obj.billed = 0
        obj.index = products.length
        products.push(obj)
        console.log(obj);
        setValue(`products`, products)
        return updateOrderLines();
    }

    const updateProductList = async () => {
        try {
            const productResponse = await ApiService.get('product');
            console.log(productResponse.data.documents)

            if (productResponse.data.isSuccess) {
                setProductList(productResponse.data.documents)
            }
        } catch (e) {
            console.log(e.response.data.message);
            // errorMessage(e, dispatch)
        }
    }

    const createItemName = (data) => {
        let itemName = '';
        data && data.map((value) => {
            let propertyName = value.listName.filter(element => element.id === value.categoryValue)
            if (propertyName.length > 0) {
                itemName += propertyName[0].name + '_';
            }
        })

        itemName = itemName.substring(0, itemName.length - 1)
        // console.log(productGrade);
        // console.log("itemName: ", `${itemName}_${productGrade}`);
        // itemName = `${itemName}_${productGrade}`
        itemName = `${itemName}`
        return itemName
    }

    const createItemNameForRange = (data) => {
        let itemName = '';
        data && data.map((value) => {
            let propertyName = value.listName.filter(element => element.id === value.categoryValue)
            if (propertyName.length > 0) {
                itemName += propertyName[0].name + '_';
            }
        })

        itemName = itemName.substring(0, itemName.length - 1)
        // console.log(productGrade);
        // console.log("itemName: ", `${itemName}_${productGrade}`);
        // itemName = `${itemName}_${productGrade}`
        return itemName
    }

    const resetItemCategory = () => {
        // reset({
        //     ...getValues(), "productMaster": {}, "groupMaster": {}, "brand": {}, "firstCategory": {}, "secondCategory": {}, "size": {}, "itemQty": 0, "costPrice": "", "productGrade": ""
        // })
        // setProductMasterList([])
        setGroupMasterList([])
        setBrandList([])
        setFirstCategoryList([])
        setSecondCategoryList([])
        setSizeList([])
        setValue("productMaster", "Choose..")
        setValue("productGrade", "Choose..")
        setValue("costPrice", "")

    }

    const collapseCard = () => {
        setcolleapse(!colleapse)
        settoggle(false)
    }

    const toggleMaxMinSize = () => {
        settoggle(!toggle)
        setValue("size", "")
        setValue("mazimumSize", "")
        setValue("minimunSize", "")
    }

    //
    const formatLineProductField = (data) => {
        let array = new Array()
        let obj = new Object()

        obj._id = data._id
        obj.name = data.name
        array.push(obj)

        return array
    }

    const handleShow = (value) => {
        setShowAddressModal(value);
    }

    const handleManualShow = (value) => {
        setShowManualModal(value);
    }

    const handleSearchByBarcodeModalShow = (value) => {
        setshowSearchByBarcode(value);
    }

    /**
     * Get data from calculator modal and according to that data get MRP
     */
    const setCalObj = (data) => {
        console.log(data);
        // const tanasUtil = new TanasUtils();
        // const rangeArray = tanasUtil.calculatePrice(parseInt(1), parseInt(1), parseInt(data.cost), parseInt(data.expence), parseInt(data.transport), parseInt(data.profit), parseInt(data.gst))
        // console.log(rangeArray);

        // const obj = new Object()
        // obj.MRP = rangeArray[0].price
        // obj.costPrice = data.cost
        setcalculatorObj(data)

        handleShow(false)
    }


    /**
     * Get data from manual modal
     */
    const setManualObj = (data) => {
        console.log(data);
        setmanualEnterCostMRP(data)

        handleManualShow(false)
    }

    /**
     * Get data from search by barcode modal for cost update
     */
    const setUpdatedProductObj = async (data) => {
        console.log(data);
        // Get product by barcode
        const response = await ApiService.get(`product/barcode/${data.barcode}`)
        console.log(response);

        // Get MRP by given cost from priceChart
        const res = await ApiService.patch(`priceChartUpload/findMRP?search=${data.cost}`)
        console.log(res);

        // Update products costPrice, salesprice(MRP), gst, sgst and utgst
        let cost = parseFloat(data.cost).toFixed(2)
        let salesPrice = parseFloat(res.data.document.MRP).toFixed(2)
        let igstRate = res.data.document.MRP >= 1000 ? 12.00 : 5.00
        let sgstRate = res.data.document.MRP >= 1000 ? 6.00 : 2.50

        await ApiService.patch(`product/${response.data.document._id}`, { cost: cost, salesPrice: salesPrice, igstRate: igstRate, sgstRate: sgstRate, utgstRate: sgstRate }).then(r => {
            if (r.data.isSuccess) {
                infoNotification("Cost update successfull")
                setInLine(r.data.document);
            } else {
                infoNotification("Can't update cost")
            }
        })

        // setupdatedProductsCost(data)

        setshowSearchByBarcode(false)
    }


    useEffect(async () => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()

            calculatePRCount();
            calculateAllPRCount();
            calculateBilledCount();
        }

        // Get all product master
        const getAllProductMaster = async () => {
            await ApiService.get('itemCategory/search?type=productMaster')
                .then(response => {
                    if (response.data.isSuccess) {
                        setProductMasterList(response.data.document)
                    }
                }).catch(e => {
                    console.log(e);
                    errorMessage(e.response?.data.message);
                })
        }
        getAllProductMaster()

        const res = await ApiService.get('sizeList');
        console.log(res.data.documents)
        setMaxMinSizeList(res.data.documents)

        // Get all productGrade
        const productGrades = await ApiService.get('productGrade');
        console.log(productGrades.data.documents)
        setproductGradeList(productGrades.data.documents)

        const vendorResponse = await ApiService.get('vendor');
        console.log(vendorResponse.data.documents)
        setvendors(vendorResponse.data.documents)

    }, []);

    console.log(calculatorObj);

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>

                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}>   <div className='breadcrum-label'>PURCHASE ORDERS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {productReceiptCount > 0 ? "" : <Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/purchases/list`} variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && productReceiptCount == 0 && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}
                <Row className="p-0 mb-2 m-0">
                    <Col className='p-0 ps-2'>
                        <ButtonGroup size="sm">
                            {/* {!isAddMode && !state?.isFullyReceived ? <Button variant="primary" onClick={handleReceiveProducts}>RECEIVE PRODUCTS</Button> : ""}
                            {!isAddMode && state?.billingStatus !== "Fully Billed" ? <Button onClick={handleCreateBill} variant="primary">CREATE BILL</Button> : ""} */}
                            {!isAddMode && <Button variant="secondary" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                        </ButtonGroup>

                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && billedCount > 0 ? <Button size="sm" onClick={handleVendorBill} varient="primary">{billedCount} Vendor Bills</Button> : ""}
                            {!isAddMode && state?.bill ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bill</Button> : ""}
                        </div>
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && productReceiptCount > 0 ? <Button size="sm" onClick={openTransferedProduct} varient="primary">{productReceiptCount} Receipt</Button> : ""}
                        </div>
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.billingStatus}</div>}
                        </div>
                    </Col>
                </Row>

                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: true,
                                description: "Purchase Order Id#",
                                label: "PURCHASE ORDER",
                                fieldId: "name",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "CHOOSE BILL",
                                fieldId: "bill",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please select bill!",
                                selectRecordType: "newBill/getunusedBill",
                                multiple: false
                            }}
                            changeHandler={async (e, data) => {
                                console.log(data);
                                if (!data.value) return

                                if (!data.value.length) {
                                    setValue("vendor", "")
                                    setValue("billStatus", "")
                                    setValue("amountOfSelectedBill", "")
                                    console.log("empty");
                                }

                                if (data.value) {
                                    setValue("vendor", data.value?.vendor)
                                    setValue("amountOfSelectedBill", data.value?.estimation?.total.toFixed(2))
                                    setbillObj(data.value)
                                }
                                if (data.value?.paymentStatus == "Paid") {
                                    // infoNotification("Selected bill's amount is paid")
                                    setValue("billStatus", "Paid")
                                } else if (data.value?.paymentStatus == "Not Paid") {
                                    setValue("billStatus", "Not Paid")
                                }
                            }}
                            blurHandler={null}
                        />

                        {/* <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Vendor",
                                label: "VENDOR",
                                fieldId: "vendor",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the vendor name!",
                                selectRecordType: "vendor",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}
                        <Form.Group as={Col} md="4" className="mb-2" >
                            <Form.Label className="m-0">VENDOR</Form.Label>
                            <FormSelect size='sm' style={{ maxWidth: '400px' }} id="vendor" name="vendor" disabled {...register("vendor")} onChange={event => filterCategory(event)}  >
                                <option value={null} selected>Choose..</option>
                                {vendors && vendors.map((value, index) => {
                                    return <option key={index} value={value.id}>{value.name}</option>
                                })}
                            </FormSelect>
                        </Form.Group>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: true,
                                description: "",
                                label: "BILL STATUS",
                                fieldId: "billStatus",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <Decimal128Field
                            register={register}
                            errors={errors}
                            field={{
                                disabled: true,
                                description: "",
                                label: "AMOUNT OF BILL",
                                fieldId: "amountOfSelectedBill",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <DateField
                            disabled={true}
                            register={register}
                            errors={errors}
                            field={{
                                description: "Date of Purchase Order Creation.",
                                label: "DATE",
                                fieldId: "date",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <DateField
                            disabled={true}
                            register={register}
                            errors={errors}
                            field={{
                                description: "Date of Purchase Order Creation.",
                                label: "RECEIPT DATE",
                                fieldId: "receiptDate",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Purchase Representative",
                                label: "PURCHASE REPRESENTATIVE",
                                fieldId: "purchaseRep",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "employee",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Remark",
                                label: "REMARK",
                                fieldId: "remark",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        {/* <TextField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: false,
                                description: "LR number",
                                label: "LR NUMBER",
                                fieldId: "lrNumber",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: false,
                                description: "Transporter name",
                                label: "TRANSPORTER NAME",
                                fieldId: "transporterName",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}

                    </Row>
                </Container>

                <Container className='mt-2' fluid>
                    <Row style={{ display: "flex", justifyContent: "center", paddingBottom: 7 }}>
                        {
                            isAddMode ?
                                <Card className="card" style={{ marginTop: 1 }}>
                                    <Card.Header className="title" onClick={collapseCard} style={{ cursor: "pointer" }}><DiGhostSmall style={{ width: '24px', height: '24px' }} /><span > ITEM CATEGORY</span></Card.Header>
                                    {
                                        colleapse && (
                                            <Card.Body>
                                                <Row>
                                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                        {/* <Switch onChange={toggleMaxMinSize} checked={toggle}
                                                            height={24}
                                                        /> */}
                                                        <Form>
                                                            <Form.Check
                                                                checked={toggle}
                                                                onChange={toggleMaxMinSize}
                                                                size="sm"
                                                                type="switch"
                                                                id="custom-switch"
                                                            />
                                                        </Form>
                                                        <span class="badge bg-info text-dark" onClick={() => {
                                                            handleSearchByBarcodeModalShow(true)
                                                        }}>Search by barcode</span>
                                                    </div>
                                                </Row>
                                                <Row>
                                                    {/* <Form.Group as={Col} md="4" className="mb-2">
                                                        <Form.Label>Name</Form.Label>
                                                        <Form.Control type="text" id="itemName" name="itemName" {...register("itemName")} disabled />
                                                    </Form.Group> */}
                                                    <Form.Group as={Col} md="4" className="mb-2" >
                                                        <Form.Label className="m-0">PRODUCT MASTER</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="productMaster" name="productMaster" {...register("productMaster")} onChange={event => filterCategory(event)}  >
                                                            <option value={null} selected>Choose..</option>
                                                            {productMasterList && productMasterList.map((value, index) => {
                                                                return <option key={index} value={value.id}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md="4" className="mb-2">
                                                        <Form.Label className="m-0">GROUP MASTER</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="groupMaster" name="groupMaster" {...register("groupMaster")} onChange={event => filterCategory(event)} >
                                                            <option value={null} selected>Choose..</option>
                                                            {groupMasterList && groupMasterList.map((value, index) => {
                                                                return <option key={index} value={value.id}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>

                                                    <Form.Group as={Col} md="4" className="mb-2">
                                                        <Form.Label className="m-0">BRAND</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="brand" name="brand" {...register("brand")} onChange={event => filterCategory(event)} >
                                                            <option value={null} selected>Choose..</option>
                                                            {brandList && brandList.map((value, index) => {
                                                                return <option key={index} value={value.id}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>
                                                </Row>
                                                <Row>

                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label className="m-0">FIRST CATEGORY</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="firstCategory" name="firstCategory" {...register("firstCategory")} onChange={event => filterCategory(event)} >
                                                            <option value={null} selected>Choose..</option>
                                                            {firstCategoryList && firstCategoryList.map((value, index) => {
                                                                return <option key={index} value={value.id}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>
                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label className="m-0">SECOND CATEGORY</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="secondCategory" name="secondCategory" {...register("secondCategory")} onChange={event => filterCategory(event)} >
                                                            <option value={null} selected>Choose..</option>
                                                            {secondCategoryList && secondCategoryList.map((value, index) => {
                                                                return <option key={index} value={value.id}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>

                                                    {!toggle &&
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label className="m-0">SIZE</Form.Label>
                                                            <FormSelect size='sm' style={{ maxWidth: '400px' }} id="size" name="size" {...register("size")}
                                                                onChange={(e) => {
                                                                    console.log(e.target.value);
                                                                    if (e.target.value) {
                                                                        setcolleapseRange(true)
                                                                        setValue("minimunSize", "")
                                                                        setValue("mazimumSize", "")
                                                                        setValue("costPrice", "")
                                                                    } else {
                                                                        setcolleapseRange(false)
                                                                    }
                                                                    if (e.target.value !== "Choose..") {
                                                                        setcolleapseRange(true)
                                                                    } else {
                                                                        setcolleapseRange(false)
                                                                    }
                                                                }}
                                                            >
                                                                <option value={null} selected>Choose..</option>
                                                                {sizeList && sizeList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                    }

                                                    {/* <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label className="m-0">PRODUCT GRADE</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="productGrade" name="productGrade" {...register("productGrade")}
                                                            onChange={(e) => {
                                                                console.log(e.target.value);
                                                                setproductGrade(e.target.value)
                                                            }}
                                                        >
                                                            <option value={null} selected>Choose..</option>
                                                            {productGradeList && productGradeList.map((value, index) => {
                                                                return <option key={index} value={value.name}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group> */}
                                                </Row>
                                                <Row>

                                                    {/*<Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label>Quantity</Form.Label>
                                                        <Form.Control type="number" defaultValue={0} min="0" id="itemQty" name="itemQty" {...register("itemQty")} />
                                                    </Form.Group>
                                                     <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Age</Form.Label>
                                                            <Form.Control type="number" min="0" id="age" name="age" {...register("age")} />
                                                        </Form.Group> */}
                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label className="m-0">PRICEING TYPE</Form.Label>
                                                        <FormSelect size='sm' style={{ maxWidth: '400px' }} id="pricingType" name="pricingType" {...register("pricingType")}
                                                            onClick={(e) => {
                                                                if (e.target.value == "Calculator") {
                                                                    setShowCalclatorBtn(true)
                                                                    setShowManualBtn(false)
                                                                    setShowChartBtn(false)
                                                                } else if (e.target.value == "Manual") {
                                                                    setShowManualBtn(true)
                                                                    setShowCalclatorBtn(false)
                                                                    setShowChartBtn(false)
                                                                } else if (e.target.value == "Chart") {
                                                                    setShowChartBtn(true)
                                                                    setShowCalclatorBtn(false)
                                                                    setShowManualBtn(false)
                                                                } else {
                                                                    setShowCalclatorBtn(false)
                                                                    setShowManualBtn(false)
                                                                    setShowChartBtn(false)
                                                                }
                                                            }}
                                                        >
                                                            {/* <option value={null} selected>Chart</option> */}
                                                            {pricingType && pricingType.map((value, index) => {
                                                                return <option key={index} value={value} defaultValue="Chart">{value}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>

                                                    {
                                                        ShowCalclatorBtn &&
                                                        <Form.Group className="mb-2" as={Col} md="4" style={{ marginTop: 20 }}>
                                                            <Button type="button" size="sm"
                                                                onClick={() => {
                                                                    handleShow(true)
                                                                }}>OPEN CALCULATOR</Button>
                                                        </Form.Group>
                                                    }
                                                    {
                                                        ShowManualBtn &&
                                                        <Form.Group className="mb-2" as={Col} md="4" style={{ marginTop: 20 }}>
                                                            <Button type="button" size="sm"
                                                                onClick={() => {
                                                                    handleManualShow(true)
                                                                }}>MANUAL COST ENTRY</Button>
                                                        </Form.Group>
                                                    }

                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label className="m-0">HSN</Form.Label>
                                                        <Form.Control size='sm' style={{ maxWidth: '400px' }} type="text" min="0" id="hsn" name="hsn" {...register("hsn")} />
                                                    </Form.Group>
                                                </Row>

                                                <Row>
                                                    {
                                                        // !colleapseRange &&
                                                        toggle &&
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label className="m-0">MINIMUM SIZE</Form.Label>
                                                            <FormSelect size='sm' style={{ maxWidth: '400px' }} id="minimunSize" name="minimunSize" {...register("minimunSize")} >
                                                                <option value={null} selected>Choose..</option>
                                                                {MaxMinSizeList && MaxMinSizeList.map((value, index) => {
                                                                    return <option key={index} value={value.name}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>

                                                    }

                                                    {
                                                        // !colleapseRange &&
                                                        toggle &&
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label className="m-0">MAXIMUM SIZE</Form.Label>
                                                            <FormSelect size='sm' style={{ maxWidth: '400px' }} id="mazimumSize" name="mazimumSize" {...register("mazimumSize")} >
                                                                <option value={null} selected>Choose..</option>
                                                                {MaxMinSizeList && MaxMinSizeList.map((value, index) => {
                                                                    return <option key={index} value={value.name}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>

                                                    }

                                                    {
                                                        ShowChartBtn ?
                                                            <Form.Group className="mb-2" as={Col} md="4">
                                                                <Form.Label className="m-0">COST PRICE</Form.Label>
                                                                <Form.Control size='sm' style={{ maxWidth: '400px' }} type="number" min="0" id="costPrice" name="costPrice" {...register("costPrice")} required />
                                                            </Form.Group> : ""
                                                    }
                                                </Row>


                                            </Card.Body>
                                        )
                                    }
                                    {
                                        colleapse && (
                                            <Card.Footer>
                                                <Button type="button" size="sm" onClick={generateItemName}>Add</Button>
                                                <Button type="button" size="sm" onClick={resetItemCategory}>Reset</Button>
                                            </Card.Footer>
                                        )
                                    }
                                </Card> : ""
                        }
                    </Row>

                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey='products'>
                        <Tab eventKey="products" title="PRODUCTS">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}>#</th>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "20rem" }}>BARCODE</th>
                                            <th style={{ minWidth: "20rem" }}>PRODUCT</th>
                                            <th style={{ minWidth: "20rem" }}>HSN</th>
                                            <th style={{ minWidth: "16rem" }}>DESCRIPTION</th>
                                            <th style={{ minWidth: "16rem" }}>UOM</th>
                                            <th style={{ minWidth: "16rem" }}>QUANTITY</th>
                                            <th style={{ minWidth: "16rem" }}>SIZE</th>
                                            {!isAddMode && <th style={{ minWidth: "16rem" }}>RECEIVED</th>}
                                            {!isAddMode && <th style={{ minWidth: "16rem" }}>BILLED</th>}
                                            <th style={{ minWidth: "16rem" }}>UNIT RATE</th>
                                            <th style={{ minWidth: "16rem" }}>MRP</th>
                                            <th style={{ minWidth: "16rem" }}>TAXES (%)</th>
                                            <th style={{ minWidth: "16rem" }}>SUB TOTAL</th>
                                            {/* <th></th> */}

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            swal.fire({
                                                                title: `Delete warning`,
                                                                text: "Do you really want to delete this line?",
                                                                // input: 'number',
                                                                showCancelButton: true
                                                            }).then(async (result) => {
                                                                if (result.value == undefined) {
                                                                    // infoNotification("please enter something in popup..")
                                                                } else {
                                                                    productRemove(index)
                                                                    updateOrderLines(index)
                                                                }
                                                            })

                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>

                                                <td>
                                                    <Button size="sm" variant="light"
                                                        onClick={(ele) => {
                                                            const v = getValues("products")
                                                            console.log(v);
                                                            console.log(ele);

                                                            v?.map(async e => {
                                                                if (e.product == null) {
                                                                    infoNotification("please select an item for the selected line")
                                                                } else {
                                                                    if (e.index == index) {
                                                                        swal.fire({
                                                                            title: `Enter quantity`,
                                                                            text: "Enter quantity...",
                                                                            input: 'number',
                                                                            showCancelButton: true
                                                                        }).then(async (result) => {
                                                                            if (result.value == undefined) {
                                                                                console.log("please enter something");
                                                                                console.log("please enter something in popup..")
                                                                            } else {
                                                                                await ApiService.get("setup").then(async (res) => {
                                                                                    if (res.data.isSuccess) {
                                                                                        res.data.documents?.map(async (com) => {
                                                                                            if (com.setupType == "COMPANY_SETUP") {
                                                                                                await ApiService.get("product/" + e.product[0]._id).then(r => {
                                                                                                    if (r.data.isSuccess) {
                                                                                                        swal.fire({
                                                                                                            title: `Enter sticker type`,
                                                                                                            text: "Enter 1 for sticker1 and 2 for sticker2",
                                                                                                            input: 'number',
                                                                                                            showCancelButton: true
                                                                                                        }).then(async (res) => {
                                                                                                            if (res.value) {
                                                                                                                console.log(res.value);
                                                                                                                console.log(result.value);
                                                                                                                BarcodePDF.generateDefaultPurchaseOrderBarcodePDF(result.value, e, com, r?.data.document, res.value)
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        });
                                                                                    } else {
                                                                                        infoNotification("Can not get company details")
                                                                                    }
                                                                                });

                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }}
                                                    ><FiAlignJustify /></Button>
                                                </td>

                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "barcode",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={(e, data) => {
                                                            setValue(`products.${index}.name`, "");
                                                            setValue(`products.${index}.product`, [{ _id: "", name: "" }]);
                                                            setValue(`products.${index}.description`, "");
                                                            setValue(`products.${index}.unit`, [{ _id: "", name: "" }]);
                                                            setValue(`products.${index}.quantity`, 0);
                                                            setValue(`products.${index}.taxes`, "");
                                                            setValue(`products.${index}.unitPrice`, 0.00);
                                                            setValue(`products.${index}.mrp`, "");
                                                            setValue(`products.${index}.size`, "");
                                                            setValue(`products.${index}.subTotal`, "");
                                                            setValue(`products.${index}.account`, "");
                                                            setValue(`products.${index}.index`, "");
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={async (e, data) => {
                                                            if (!e.target.value) return

                                                            ApiService.setHeader();
                                                            ApiService.get('product/barcode/' + e.target.value).then(response => {
                                                                const productObj = response.data.document;
                                                                console.log(productObj);

                                                                // format value for line product field
                                                                const prod = formatLineProductField(productObj)

                                                                if (productObj) {
                                                                    setValue(`products.${index}.name`, productObj.name);
                                                                    setValue(`products.${index}.product`, prod);
                                                                    setValue(`products.${index}.description`, productObj.description);
                                                                    setValue(`products.${index}.unit`, productObj.uom);
                                                                    setValue(`products.${index}.quantity`, 1);
                                                                    setValue(`products.${index}.taxes`, productObj?.igstRate);
                                                                    setValue(`products.${index}.unitPrice`, productObj.cost);
                                                                    setValue(`products.${index}.mrp`, productObj.salesPrice);
                                                                    setValue(`products.${index}.size`, productObj.name.split("_")[productObj.name.split("_").length - 2]);
                                                                    setValue(`products.${index}.subTotal`, (parseFloat(productObj.cost) * 1).toFixed(2));
                                                                    setValue(`products.${index}.account`, productObj.assetAccount);
                                                                    setValue(`products.${index}.index`, index);
                                                                    updateOrderLines(index)
                                                                } else {
                                                                }
                                                            }).catch(err => {
                                                                /** If there is no product with that barcode show notification and set barcode and product field to blank */
                                                                infoNotification("No product with that barcode")
                                                                setValue(`products.${index}.barcode`, "")
                                                                setValue(`products.${index}.product`, [{ name: "" }])
                                                                console.log("ERROR", err)
                                                            })
                                                        }}
                                                    />

                                                </td>

                                                <td>
                                                    <LineSelectField
                                                        control={control}
                                                        model={"products"}
                                                        field={{

                                                            fieldId: "product",
                                                            placeholder: "",
                                                            selectRecordType: "product",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={(e, data) => {
                                                            console.log(data);
                                                            if (data.value.length == 0) {
                                                                setValue(`products.${index}.name`, "");
                                                                setValue(`products.${index}.barcode`, "");
                                                                setValue(`products.${index}.product`, [{ _id: "", name: "" }]);
                                                                setValue(`products.${index}.description`, "");
                                                                setValue(`products.${index}.unit`, [{ _id: "", name: "" }]);
                                                                setValue(`products.${index}.quantity`, 0);
                                                                setValue(`products.${index}.taxes`, "");
                                                                setValue(`products.${index}.HSNSACS`, "");
                                                                setValue(`products.${index}.unitPrice`, 0.00);
                                                                setValue(`products.${index}.mrp`, "");
                                                                setValue(`products.${index}.size`, "");
                                                                setValue(`products.${index}.subTotal`, "");
                                                                setValue(`products.${index}.account`, "");
                                                                setValue(`products.${index}.index`, "");
                                                                updateOrderLines(index)
                                                            }
                                                        }}
                                                        blurHandler={async (event, data) => {
                                                            console.log(data);

                                                            if (!data?.okay) return
                                                            const productId = data?.okay[0]?._id;

                                                            if (productId) {
                                                                ApiService.setHeader();
                                                                ApiService.get('product/' + productId).then(response => {
                                                                    const productObj = response.data.document;
                                                                    console.log(productObj);
                                                                    if (productObj) {
                                                                        setValue(`products.${index}.name`, productObj.name);
                                                                        setValue(`products.${index}.barcode`, productObj.barcode);
                                                                        setValue(`products.${index}.description`, productObj.description);
                                                                        setValue(`products.${index}.unit`, productObj.uom);
                                                                        setValue(`products.${index}.quantity`, 1);
                                                                        setValue(`products.${index}.taxes`, productObj?.igstRate);
                                                                        setValue(`products.${index}.HSNSACS`, productObj?.HSNSACS);
                                                                        setValue(`products.${index}.unitPrice`, productObj.cost);
                                                                        setValue(`products.${index}.mrp`, productObj.salesPrice);
                                                                        setValue(`products.${index}.size`, productObj.name.split("_")[productObj.name.split("_").length - 2]);
                                                                        setValue(`products.${index}.subTotal`, (parseFloat(productObj.cost) * 1).toFixed(2));
                                                                        setValue(`products.${index}.account`, productObj.assetAccount);
                                                                        setValue(`products.${index}.index`, index);
                                                                        updateOrderLines(index)
                                                                    }
                                                                }).catch(err => {
                                                                    console.log("ERROR", err.response.data)
                                                                })
                                                            } else {

                                                                infoNotification("Product not found. Please select product fron dropdown")
                                                            }
                                                        }}
                                                    />

                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "HSNSACS",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "description",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                                <td>
                                                    <LineSelectField
                                                        control={control}
                                                        model={"products"}
                                                        field={{

                                                            fieldId: "unit",
                                                            placeholder: "",
                                                            selectRecordType: "uom",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                    {/* <Form.Group >
                                                        <Form.Control size='sm'
                                                            type="text"
                                                            id="batchNumber"
                                                            name="batchNumber"
                                                            {...register(`products.${index}.batchNumber`)} />
                                                    </Form.Group> */}
                                                </td>
                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "quantity",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {

                                                            let quantity = data?.value;
                                                            let unitPrice = getValues(`products.${index}.unitPrice`);
                                                            let taxes = getValues(`products.${index}.taxes`);
                                                            let netAmount = (parseFloat(quantity) * parseFloat(unitPrice));
                                                            setValue(`products.${index}.subTotal`, parseFloat(netAmount).toFixed(2));
                                                            updateOrderLines(index)

                                                        }}
                                                        blurHandler={null}
                                                    />
                                                    {/* <Form.Group >
                                                        <Form.Select id="purchaseUoM" name="purchaseUoM" {...register(`products.${index}.purchaseUoM`)} size="sm"
                                                            onChange={(e) => {
                                                                console.log(e.target.value)
                                                                const caseQuantity = getValues(`products.${index}.caseQuantity`);
                                                                if (caseQuantity) {
                                                                    const unitRate = getValues(`products.${index}.unitPrice`);
                                                                    const actualQuantity = parseInt(caseQuantity) * parseInt(e.target.value.slice(0, 2));
                                                                    setValue(`products.${index}.quantity`, actualQuantity);
                                                                    //setValue(`products.${index}.quantity`, parseFloat(actualQuantity) * parseFloat(unitRate));
                                                                    setValue(`products.${index}.netAmount`, parseFloat(actualQuantity) * parseFloat(unitRate));
                                                                    setValue(`products.${index}.grossAmount`, parseFloat(actualQuantity) * parseFloat(unitRate));
                                                                    updateOrderLines(index)

                                                                }
                                                            }}>
                                                            <option value="Select">Select...</option>
                                                            <option value="60PCS/CASE">60PCS/CASE</option>
                                                            <option value="48PCS/CASE">48PCS/CASE</option>
                                                            <option value="36PCS/CASE">36PCS/CASE</option>
                                                            <option value="24PCS/CASE">24PCS/CASE</option>
                                                            <option value="12PCS/CASE">12PCS/CASE</option>
                                                            <option value="1PCS">1PCS</option>

                                                        </Form.Select>
                                                    </Form.Group> */}
                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "size",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                                {!isAddMode && <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "received",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>}
                                                {!isAddMode && <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "billed",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>}
                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "unitPrice",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            console.log(event, data)
                                                            let unitPrice = data?.value;
                                                            let quantity = getValues(`products.${index}.quantity`);
                                                            let taxes = getValues(`products.${index}.taxes`);
                                                            //let taxAmount = ((parseFloat(unitPrice) * parseFloat(quantity)) * parseFloat(taxes[0])) / 100;
                                                            setValue(`products.${index}.subTotal`, (parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2))
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            fieldId: "mrp",
                                                            placeholder: "",
                                                            disabled: true
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "taxes",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />

                                                    {/* <LineSelectField
                                                        control={control}
                                                        model={"products"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "taxes",
                                                            placeholder: "",
                                                            selectRecordType: null,
                                                            multiple: true
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    /> */}

                                                </td>
                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "subTotal",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                    {/* <Form.Group >

                                                        <Form.Control size='sm'
                                                            type="number"
                                                            id="quantity"
                                                            name="quantity"
                                                            disabled={productReceiptCount > 0 ? true : false}
                                                            {...register(`products.${index}.quantity`)}
                                                            onChange={(e) => {
                                                                const unitRate = getValues(`products.${index}.unitPrice`);
                                                                const actualQuantity = getValues(`products.${index}.quantity`);
                                                                //const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                setValue(`products.${index}.netAmount`, parseFloat(unitRate) * parseFloat(actualQuantity));
                                                                setValue(`products.${index}.grossAmount`, parseFloat(unitRate) * parseInt(actualQuantity));
                                                                updateOrderLines(index)
                                                            }}
                                                        />
                                                        {errors?.['products']?.[index]?.['quantity']?.['message'] && <p style={{ color: "red" }}>{errors?.['products']?.[index]?.['quantity']?.['message']}</p>}
                                                    </Form.Group> */}
                                                </td>






                                            </tr>
                                            )
                                        })}
                                        <tr>
                                            <td colSpan="14">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => productAppend({
                                                    product: null,
                                                    description: '',
                                                    quantity: 1,
                                                    received: 0,
                                                    billed: 0,
                                                    taxes: 0,
                                                    unitPrice: 0,
                                                    subTotal: 0
                                                })} >Add a product</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>

                            </AppContentLine >
                            <Container className="mt-2" fluid>
                                <Row>
                                    <Col sm="12" md="8">
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                            <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                        </Form.Group>
                                    </Col>
                                    <Col sm="12" md="4">
                                        <Card>
                                            {/* <Card.Header as="h5">Featured</Card.Header> */}
                                            <Card.Body>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>UNTAXED TOTAL:</Col>
                                                    <Col>
                                                        <input step="0.001"
                                                            type="number" id='untaxedAmount' name="untaxedAmount"   {...register(`estimation.untaxedAmount`)} readOnly style={{ border: "none", backgroundColor: 'transparent', resize: 'none', outline: "none" }} />
                                                    </Col>
                                                </Row>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>TAX:</Col>
                                                    <Col>

                                                        <input step="0.001"
                                                            type="number" id='tax' name="tax"   {...register(`estimation.tax`)} readOnly style={{ border: "none", backgroundColor: 'transparent', resize: 'none', outline: "none" }} />

                                                    </Col>
                                                </Row>

                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>TOTAL:</Col>
                                                    <Col style={{ borderTop: '1px solid black' }}>

                                                        <input step="0.001"
                                                            type="number" id='subTotal' name="subTotal"   {...register(`estimation.total`)} readOnly style={{ border: "none", backgroundColor: 'transparent', resize: 'none', outline: "none" }} />

                                                    </Col>
                                                </Row>


                                            </Card.Body>
                                        </Card>

                                    </Col>
                                </Row>
                            </Container>
                        </Tab >
                        {/* {!isAddMode && <Tab eventKey="auditTrail" title="Audit Trail">
                            <Container className="mt-2" fluid>
                                {!isAddMode && <LogHistories documentPath={"purchaseOrder"} documentId={id} />}
                            </Container>
                        </Tab>} */}


                    </Tabs >

                    <Calculator state={state}
                        isEditMode={!isAddMode}
                        show={showAddressModal}
                        handleShow={(e) => handleShow(e)}
                        setCalObj={(e) => setCalObj(e)}
                    />

                    <ManualEnterCostAndMrp state={state}
                        setManualObj={(e) => setManualObj(e)}
                        isEditMode={!isAddMode}
                        show={ShowManualModal}
                        handleManualShow={(e) => handleManualShow(e)}
                    />

                    <SearchByBarcodeAndUpdateCost
                        setUpdatedProductObj={(e) => setUpdatedProductObj(e)}
                        isEditMode={!isAddMode}
                        show={showSearchByBarcode}
                        handleSearchByBarcodeModalShow={(e) => handleSearchByBarcodeModalShow(e)}
                    />

                </Container >

            </AppContentBody >
        </AppContentForm >
    )
}
