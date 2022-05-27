import { React, useContext, useState, useEffect } from 'react';
import { BsTrash } from 'react-icons/bs';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, FormSelect } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import ApiService from '../../../helpers/ApiServices';
import { checkBlank, errorMessage, formatNumber } from '../../../helpers/Utils';
import swal from 'sweetalert2';
import { UserContext } from '../../../components/states/contexts/UserContext';
import { BarcodePDF, PurchaseOrderPDF } from '../../../helpers/PDF';
import JsBarcode from 'jsbarcode';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// const { Option } = Select;

const schema = Yup.object().shape({

    receiptDate: Yup.date().max(new Date()).required('Please enter date'),
    // products: Yup.array().of(
    //     Yup.object().shape({
    //         product: Yup.object().required("Please select a product"),
    //     })
    // ),
});


const options = [{ value: 'GST 5%' }, { value: 'GST 5% (RC)' }, { value: 'IGST 1%' }, { value: 'IGST 2%' }];

export default function AddEditPurchaseOrder() {
    const { user, dispatch } = useContext(UserContext)
    const [state, setstate] = useState({
        estimation: {
            untaxedAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0
        }
    });
    const [supplierList, setSupplierList] = useState([]);
    const [colleapse, setcolleapse] = useState(false);
    const [colleapseRange, setcolleapseRange] = useState(false);
    const [loderStatus, setLoderStatus] = useState("");
    const [productReceiptCount, setProductReceiptCount] = useState(0);
    const [billedCount, setBilledCount] = useState(0)
    const [productList, setProductList] = useState([])
    const [standaloneBillList, setstandaloneBillList] = useState([])
    const [MaxMinSizeList, setMaxMinSizeList] = useState([])
    const [lineProduct, setlineProduct] = useState(null)
    const [tabKey, setTabKey] = useState('products');
    const [productMasterList, setProductMasterList] = useState([])
    const [groupMasterList, setGroupMasterList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [firstCategoryList, setFirstCategoryList] = useState([])
    const [secondCategoryList, setSecondCategoryList] = useState([])
    const [sizeList, setSizeList] = useState([])
    const [billObj, setbillObj] = useState()
    const [show, setshow] = useState(false)
    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            vendor: null,
            total: 0,
            billingStatus: 'Nothing to Bill',
            orderDeadline: new Date().toISOString().split("T")[0],
            productMaster: null,
            groupMaster: null,
            brand: null,
            firstCategory: null,
            secondCategory: null,
            size: null,
            itemQty: 1
        },
        resolver: yupResolver(schema),
    });

    let totalPurchasedQuantity = 0;
    let totalBilledQuantity = 0;
    let totalReceivedQuantity = 0;
    let totalReceived = 0;
    let totalBilled = 0;

    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });

    const onSubmit = (formData) => {
        console.log(formData);
        formData.billId = billObj?._id

        let sum = 0;
        console.log(itemFields)
        itemFields.map((item, index) => {
            const subTotal = getValues(`products.${index}.subTotal`);
            sum += parseFloat(subTotal);
        })

        const billValue = parseInt(getValues('bill').split(" ")[1].slice(2, 8));
        console.log(billValue);

        if (sum == parseFloat(billValue)) {
            return isAddMode
                ? createDocument(formData)
                : updateDocument(id, formData);
        } else {
            alert('Not a valid Purchase Order process');
        }
        // return isAddMode
        //     ? createDocument(formData)
        //     : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/purchaseOrder/procedure', data).then(response => {
            if (response.data.isSuccess) {
                // history.push("/purchase/orders");
                navigate("/purchase/bill/" + billObj?._id)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/purchaseOrder/procedure/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate("/purchase/orders");
            }
        }).catch(e => {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/purchaseOrder/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                navigate("/purchase/orders");
            }
        }).catch(e => {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)
        })
    }

    const handleReceiveProducts = () => {
        console.log(state.productReceipt)
        navigate("/purchase/receiveproduct/" + state.productReceipt);
    }


    const handleCreateBill = async () => {

        state?.products?.map(e => {
            totalReceived += parseInt(e.received)
            totalBilled += parseInt(e.billed)
        })
        if (totalReceived === totalBilled) {
            alert("Please received product first!!!")
        } else {
            const response = await ApiService.post('bill', { sourceDocument: state.id });
            if (response.data.isSuccess) {
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
                    // console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                    // console.log("totalBilledQuantity: ", totalBilledQuantity);
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Fully Billed' }).then(async res => {
                        if (res.data.isSuccess) {
                            await ApiService.patch('purchaseOrder/increaseProductqty/' + res.data.document._id, res.data.document).then(r => {
                                if (r.data.isSuccess) {
                                    // history.push("/purchase/bill/" + response.data.document.id);
                                    navigate("/purchase/bills");
                                }
                            })
                        }
                    })
                } else if (totalPurchasedQuantity === totalReceivedQuantity) {
                    // console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                    // console.log("totalReceivedQuantity: ", totalReceivedQuantity);
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Fully Received / Partially billed' })
                } else {
                    // console.log("totalPurchasedQuantity: ", totalPurchasedQuantity);
                    // console.log("totalReceivedQuantity: ", totalReceivedQuantity);
                    // console.log("totalBilledQuantity: ", totalBilledQuantity);
                    await ApiService.patch('purchaseOrder/' + state.id, { billingStatus: 'Partially Received / Billed' })
                }

                // await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
                navigate("/purchase/bill/" + response.data.document.id);
            }
        }

    }

    const handleVendorBill = async () => {
        console.log(state)
        navigate("/purchase/bill/" + state.vendorBill);

    }

    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generatePurchaseOrderPDF(state.id);
        return;
    }

    const filterCategory = async (event) => {
        let responseData = await ApiService.get(`itemCategory/search?parent=${event.target.value}`)
        switch (event.target.id) {
            case 'productMaster':
                setGroupMasterList(responseData.data.document)
                break;
            case 'groupMaster':
                setBrandList(responseData.data.document)
                break;
            case 'brand':
                setFirstCategoryList(responseData.data.document)
                break;
            case 'firstCategory':
                setSecondCategoryList(responseData.data.document)
                break;
            case 'secondCategory':
                setSizeList(responseData.data.document)
                break;
            default:
                break;
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

        let itemName = createItemName(categoryObjArr);
        let itemId;
        if (itemName !== '') {
            await ApiService.get(`product/search/${itemName}`)
                .then(async response => {
                    if (response.data.isSuccess && response.data.document.length > 0) {
                        itemId = await response.data.document[0].id
                        await updateProductList();
                        if (itemId) {
                            swal({
                                title: "Item already present in database",
                                buttons: false
                            })
                        }
                    }
                    else {

                    }
                })
                .catch(err => {
                    console.log(err)
                    alert(err)
                })

            let productListLength = formData.products.length
            let itemAlreadyPresent = formData.products.findIndex(element => element.product === itemId);
            let categoryQty = formData.itemQty
            if (itemAlreadyPresent === -1) {
                // itemAppend({})
                // setValue(`products.${productListLength}.product`, itemId)

                // Generate items according to sizes and set in line
                if (parseInt(formData.minimunSize) && parseInt(formData.mazimumSize) && parseInt(formData.size)) {
                    alert("Either select only size or select max and min size")
                } else if (parseInt(formData.minimunSize) && parseInt(formData.mazimumSize)) {
                    console.log("min and max size present");
                    createAndSetItems(formData, itemName)
                } else {
                    console.log("min and max size not present");
                    console.log(formData);
                    console.log(formData.itemQty);
                    if (parseInt(formData.size)) {
                        try {
                            //find size
                            const sizeResponse = await ApiService.get(`itemCategory/${formData.size}`)
                            if (sizeResponse?.data.isSuccess) {
                                const r = await ApiService.post(`product/procedure`, {
                                    name: itemName,
                                    description: `${itemName}`,
                                    cost: formData.costPrice,

                                })
                                if (r.data.isSuccess) {
                                    itemId = await r.data.document.id;
                                    await updateProductList();

                                    let products = getValues('products')
                                    let obj = new Object()
                                    obj.product = itemId
                                    obj.quantity = parseInt(formData.itemQty)
                                    obj.size = parseInt(sizeResponse?.data.document.name)
                                    obj.unitPrice = 0
                                    obj.taxes = r?.data.document?.igstRate
                                    obj.subTotal = 0
                                    obj.received = 0
                                    obj.billed = 0
                                    products.push(obj)
                                    console.log(obj);
                                    setValue(`products`, products)
                                }
                            } else {
                                alert("can not get size data")
                            }

                        } catch (err) {
                            console.log(err);
                            alert(err.response.data.message)
                        }
                    } else {
                        alert("Please select size")
                    }
                }
                updateOrderLines();
            }
            else {
                swal({
                    title: "Item already present in line",
                    text: "Quantity will be added. Do you want to proceed?",
                    buttons: true
                }).then(data => {
                    if (data) {
                        let lineData = getValues(`products.${itemAlreadyPresent}`)
                        setValue(`products.${itemAlreadyPresent}.quantity`, parseFloat(formData.itemQty) + parseFloat(lineData.quantity))
                        setValue(`products.${itemAlreadyPresent}.subTotal`, (getValues(`products.${itemAlreadyPresent}.quantity`)) * parseInt(getValues(`products.${itemAlreadyPresent}.unitPrice`)));
                        updateOrderLines();
                    }
                })
            }
        }
        // updateOrderLines()
    }

    const createAndSetItems = async (formData, itemName) => {
        const products = getValues("products")
        let array = new Array();

        const tanasUtil = new TanasUtils();
        const rangeArray = tanasUtil.calculatePrice(parseInt(formData.minimunSize), parseInt(formData.mazimumSize), parseInt(formData.costPrice), 15, 8, 40, 5)
        console.log(rangeArray);

        rangeArray?.map(async e => {
            let obj = new Object()

            const response = await ApiService.get(`product/search/${itemName}_${e.size}`)
            if (response.data.document.length > 0) {
                swal({
                    title: "Item already present in database for max min",
                    buttons: false
                })
            } else {
                try {
                    const res = await ApiService.post(`product/procedure`, {
                        name: `${itemName}_${e.size}`,
                        description: `${itemName}_${e.size}`,
                        cost: formData.costPrice,
                        salesPrice: e.price
                    })

                    if (res.data.isSuccess) {
                        obj.product = res.data.document.id
                        obj.quantity = formData.itemQty
                        obj.size = parseInt(e.size)
                        obj.unitPrice = parseInt(formData.costPrice)
                        obj.taxes = res?.data.document?.igstRate
                        obj.salesPrice = parseInt(e.price)
                        obj.subTotal = parseInt(formData.costPrice) * parseInt(formData.itemQty)
                        obj.received = 0
                        obj.billed = 0
                        products.push(obj)

                        await updateProductList();
                        updateOrderLines()
                    }
                } catch (err) {
                    console.log(err);
                    alert(err.response.data.message)
                }

                // if (products.length == rangeArray.length + 1) {
                console.log("final array: ", products);
                setValue("products", products)
                // categoryQty ? setValue(`products.${productListLength}.quantity`, formData.itemQty) : setValue(`products.${productListLength}.quantity`, 0)
                // }
            }
        })
    }
    const createAndSetItemsForRange = async (itemName) => {
        const formData = getValues();

        const products = getValues("products")
        let array = new Array();

        const tanasUtil = new TanasUtils();
        const rangeArray = tanasUtil.calculatePrice(parseInt(formData.minimunSize), parseInt(formData.mazimumSize), parseInt(formData.costPrice), 15, 8, 40, 5)
        console.log(rangeArray);

        rangeArray?.map(async e => {
            let obj = new Object()

            const response = await ApiService.get(`product/search/${itemName}_${e.size}`)
            if (response.data.document.length > 0) {
                swal({
                    title: "Item already present in database for max min",
                    buttons: false
                })
            } else {
                try {
                    const res = await ApiService.post(`product/procedure`, {
                        name: `${itemName}_${e.size}`,
                        description: `${itemName}_${e.size}`,
                        cost: formData.costPrice,
                        salesPrice: e.price
                    })

                    if (res.data.isSuccess) {
                        obj.product = res.data.document.id
                        obj.quantity = 1
                        obj.size = parseInt(e.size)
                        obj.unitPrice = parseInt(formData.costPrice)
                        obj.salesPrice = parseInt(e.price)
                        obj.subTotal = parseInt(formData.costPrice) * parseInt(1)
                        obj.received = 0
                        obj.billed = 0
                        products.push(obj)

                        await updateProductList();
                    }
                } catch (err) {
                    console.log(err);
                    alert(err)
                }

                // if (products.length == rangeArray.length + 1) {
                console.log("final array: ", products);
                setValue("products", products)
                // categoryQty ? setValue(`products.${productListLength}.quantity`, formData.itemQty) : setValue(`products.${productListLength}.quantity`, 0)
                // }
            }
        })
    }

    const updateProductList = async () => {
        try {
            const productResponse = await ApiService.get('product');
            console.log(productResponse.data.documents)

            if (productResponse.data.isSuccess) {
                setProductList(productResponse.data.documents)
            }
        } catch (err) {
            console.log(err);
            alert(err.response.data.message)
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
        console.log("itemName: ", itemName);
        return itemName
    }

    const resetItemCategory = () => {
        reset({ ...getValues(), "productMaster": {}, "groupMaster": {}, "brand": {}, "firstCategory": {}, "secondCategory": {}, "size": {}, "itemQty": 0 })
    }

    const openTransferedProduct = () => {
        navigate("/purchase/received/" + state.id);
    }

    const updateOrderLines = (index) => {
        let cumulativeSum = 0, cgstSum = 0, sgstSum = 0, igstSum = 0;
        const products = getValues('products')
        console.log(products);
        products.map((val) => {
            console.log(val);
            cumulativeSum += parseFloat(val.subTotal);
            cgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
            sgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
            igstSum += parseFloat(((val.taxes) * val.subTotal) / 100);
        });

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            cgst: cgstSum,
            sgst: sgstSum,
            igst: igstSum,
            total: parseFloat(cumulativeSum + igstSum)
        });
        setstate(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: cumulativeSum,
                cgst: cgstSum,
                sgst: sgstSum,
                igst: igstSum,
                total: parseFloat(cumulativeSum + igstSum)
            }
        }));

    }

    const collapseCard = () => {
        setcolleapse(!colleapse)
    }

    const collapseCardForRange = () => {
        setcolleapseRange(!colleapseRange)
    }

    const hideBillAndReceipt = async (e) => {
        console.log(e.target.value);
        if (e.target.value != "Choose..") {
            const billName = e.target.value.split(" ")[0]
            try {
                const res = await ApiService.post(`/bill/getBillByName/`, { name: billName })
                if (res.data.isSuccess) {
                    setbillObj(res?.data.document)
                    setshow(true)
                }
            } catch (e) {
                console.log(e);
                alert(e.response.data.message)
            }
        } else {
            setshow(false)
            alert("Please select a value")
        }
    }

    const handleGoToBill = () => {
        console.log(billObj);
        navigate("/purchase/bill/" + billObj?._id)
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");

        try {
            const supplierResponse = await ApiService.get('vendor');
            console.log(supplierResponse.data.documents)
            if (supplierResponse.data.isSuccess) {
                setSupplierList(supplierResponse.data.documents)
            }

            const res = await ApiService.get('sizeList');
            console.log(res.data.documents)
            setMaxMinSizeList(res.data.documents)

            const productResponse = await ApiService.get('product');
            console.log(productResponse.data.documents)

            const standaloneBillResponse = await ApiService.get('bill/getStandalonebill');
            if (standaloneBillResponse?.data.isSuccess) {
                setstandaloneBillList(standaloneBillResponse?.data.documents)
            }

            if (productResponse.data.isSuccess) {
                setProductList(productResponse.data.documents)
            }
            const getAllProductMaster = async () => {
                await ApiService.get('itemCategory/search?type=productMaster')
                    .then(response => {
                        if (response.data.isSuccess) {
                            setProductMasterList(response.data.document)
                        }
                    }).catch(err => {
                        console.log(err);
                        alert(err.response.data.message)
                    })
            }

            getAllProductMaster()
            if (isAddMode) {
                setLoderStatus("SUCCESS");
            }

            if (!isAddMode) {
                ApiService.setHeader();
                const productReceiptResponse = await ApiService.get('productReceipt/searchByPO/' + id);
                if (productReceiptResponse.data.isSuccess) {
                    setProductReceiptCount(productReceiptResponse.data.results)
                }

                const billResponse = await ApiService.get('bill/searchByPO/' + id);
                if (billResponse.data.isSuccess) {
                    setBilledCount(billResponse.data.results)
                }

                ApiService.get(`purchaseOrder/${id}`).then(async response => {
                    const purchaseOrder = response.data.document;
                    setstate(purchaseOrder)
                    reset(purchaseOrder);
                    if (purchaseOrder.receiptDate) {
                        setValue('receiptDate', purchaseOrder.receiptDate.split("T")[0])
                        setValue('vendor', purchaseOrder.vendor)
                    }

                    const res = await ApiService.post(`/bill/getBillByName/`, { name: purchaseOrder?.bill.split(" ")[0] })
                    if (res.data.isSuccess) {
                        setbillObj(res?.data.document)
                        // setshow(true)
                    }

                    setLoderStatus("SUCCESS");
                }).catch(e => {
                    console.log(e.response.data.message);
                    errorMessage(e, dispatch)
                })


                setshow(true)
            }
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)

        }

    }, []);


    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col>
                            <h3>{isAddMode ? "Purchase Orders" : state.name}</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/purchase/orders" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && state.status == "Nothing to Bill" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">

                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>

                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mb-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && state?.bill == null && !state.isFullyReceived ? <Button variant="primary" onClick={handleReceiveProducts}>RECEIVE PRODUCTS</Button> : ""}
                                {!isAddMode && state?.bill == null && state.billingStatus !== "Fully Billed" ? <Button onClick={handleCreateBill} variant="primary">CREATE BILL</Button> : ""}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">LOCK</Button> */}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {show ? <Button size="sm" onClick={handleGoToBill} varient="primary">Go to Bill</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && billedCount > 0 ? <Button size="sm" onClick={handleVendorBill} varient="primary">{billedCount} Vendor Bills</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && productReceiptCount > 0 ? <Button size="sm" onClick={openTransferedProduct} varient="primary">{productReceiptCount} Receipt</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.billingStatus}</div>}
                            </div>
                        </Col>
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Purchase Order</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    disabled={true}
                                    {...register("name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Vendor Name</Form.Label>
                                <Form.Select className="selectpicker" id="vendor" name="vendor" {...register("vendor", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {supplierList.map((element, index) => {
                                        // return <option key={index} data-tokens={element.id}>{element.name}</option>
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                                <span style={{ color: 'red' }}>{errors.name?.message}</span>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="receiptDate"
                                    name="receiptDate"
                                    {...register("receiptDate")} />
                                <span style={{ color: 'red' }}>{errors.receiptDate?.message}</span>
                            </Form.Group>
                        </Row>
                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bill</Form.Label>
                                <Form.Select className="selectpicker" id="bill" name="bill" {...register("bill", { required: true })} disabled={!isAddMode ? true : false}
                                    onChange={(e) => hideBillAndReceipt(e)}
                                >
                                    <option value={null}>Choose..</option>
                                    {standaloneBillList.map((element, index) => {
                                        return <option key={index} value={`${element?.name} (${formatNumber(element?.estimation?.untaxedAmount)})`}>{`${element?.name} (${formatNumber(element?.estimation?.untaxedAmount)})`}</option>
                                    })}
                                </Form.Select>
                                <span style={{ color: 'red' }}>{errors.name?.message}</span>
                            </Form.Group>
                        </Row>

                        <Card className="card" style={{ marginLeft: 1, marginRight: 1, marginTop: 9 }}>
                            <Card.Header className="title" onClick={collapseCard} style={{ cursor: "pointer" }}>  Item Category</Card.Header>
                            {
                                colleapse && (
                                    <Card.Body>
                                        <Row>
                                            <Form.Group as={Col} md="4" className="mb-2">
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control type="text" id="itemName" name="itemName" {...register("itemName")} disabled />
                                            </Form.Group>
                                            <Form.Group as={Col} md="4" className="mb-2" >
                                                <Form.Label>Product Master</Form.Label>
                                                <FormSelect id="productMaster" name="productMaster" {...register("productMaster")} onChange={event => filterCategory(event)}  >
                                                    <option value={null} selected>Choose..</option>
                                                    {productMasterList && productMasterList.map((value, index) => {
                                                        return <option key={index} value={value.id}>{value.name}</option>
                                                    })}
                                                </FormSelect>
                                            </Form.Group>
                                            <Form.Group as={Col} md="4" className="mb-2">
                                                <Form.Label>Group Master</Form.Label>
                                                <FormSelect id="groupMaster" name="groupMaster" {...register("groupMaster")} onChange={event => filterCategory(event)} >
                                                    <option value={null} selected>Choose..</option>
                                                    {groupMasterList && groupMasterList.map((value, index) => {
                                                        return <option key={index} value={value.id}>{value.name}</option>
                                                    })}
                                                </FormSelect>
                                            </Form.Group>

                                        </Row>
                                        <Row>
                                            <Form.Group as={Col} md="4" className="mb-2">
                                                <Form.Label>Brand</Form.Label>
                                                <FormSelect id="brand" name="brand" {...register("brand")} onChange={event => filterCategory(event)} >
                                                    <option value={null} selected>Choose..</option>
                                                    {brandList && brandList.map((value, index) => {
                                                        return <option key={index} value={value.id}>{value.name}</option>
                                                    })}
                                                </FormSelect>
                                            </Form.Group>
                                            <Form.Group className="mb-2" as={Col} md="4">
                                                <Form.Label>First Category</Form.Label>
                                                <FormSelect id="firstCategory" name="firstCategory" {...register("firstCategory")} onChange={event => filterCategory(event)} >
                                                    <option value={null} selected>Choose..</option>
                                                    {firstCategoryList && firstCategoryList.map((value, index) => {
                                                        return <option key={index} value={value.id}>{value.name}</option>
                                                    })}
                                                </FormSelect>
                                            </Form.Group>
                                            <Form.Group className="mb-2" as={Col} md="4">
                                                <Form.Label>Second Category</Form.Label>
                                                <FormSelect id="secondCategory" name="secondCategory" {...register("secondCategory")} onChange={event => filterCategory(event)} >
                                                    <option value={null} selected>Choose..</option>
                                                    {secondCategoryList && secondCategoryList.map((value, index) => {
                                                        return <option key={index} value={value.id}>{value.name}</option>
                                                    })}
                                                </FormSelect>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group className="mb-2" as={Col} md="4">
                                                <Form.Label>Size</Form.Label>
                                                <FormSelect id="size" name="size" {...register("size")}
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
                                            <Form.Group className="mb-2" as={Col} md="4">
                                                <Form.Label>Quantity</Form.Label>
                                                <Form.Control type="number" defaultValue={0} min="0" id="itemQty" name="itemQty" {...register("itemQty")} />
                                            </Form.Group>
                                            <Form.Group className="mb-2" as={Col} md="4">
                                                <Form.Label>Age</Form.Label>
                                                <Form.Control type="number" min="0" id="age" name="age" {...register("age")} />
                                            </Form.Group>
                                        </Row>
                                        {
                                            !colleapseRange && (
                                                <Row>
                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label>Minimum Size</Form.Label>
                                                        <FormSelect id="minimunSize" name="minimunSize" {...register("minimunSize")} >
                                                            <option value={null} selected>Choose..</option>
                                                            {MaxMinSizeList && MaxMinSizeList.map((value, index) => {
                                                                return <option key={index} value={value.name}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>
                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label>Mazimum Size</Form.Label>
                                                        <FormSelect id="mazimumSize" name="mazimumSize" {...register("mazimumSize")} >
                                                            <option value={null} selected>Choose..</option>
                                                            {MaxMinSizeList && MaxMinSizeList.map((value, index) => {
                                                                return <option key={index} value={value.name}>{value.name}</option>
                                                            })}
                                                        </FormSelect>
                                                    </Form.Group>
                                                    <Form.Group className="mb-2" as={Col} md="4">
                                                        <Form.Label>Cost Price</Form.Label>
                                                        <Form.Control type="number" min="0" id="costPrice" name="costPrice" {...register("costPrice")} />
                                                    </Form.Group>
                                                </Row>
                                            )
                                        }

                                    </Card.Body>
                                )
                            }
                            {
                                colleapse && (
                                    <Card.Footer>
                                        <Button type="button" size="sm" onClick={generateItemName}>Add</Button>
                                        <Button type="button" variant="btn btn-outline-secondary" size="sm" onClick={resetItemCategory}>Reset</Button>
                                    </Card.Footer>
                                )
                            }


                        </Card>

                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="products" title="Products">
                                <Card style={{ marginLeft: 1, marginRight: 1 }}>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Size</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Received</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Billed</th>}
                                                    <th style={{ minWidth: "16rem" }}>Unit Rate</th>
                                                    <th style={{ minWidth: "16rem" }}>Sub Total</th>
                                                    <th style={{ minWidth: "16rem" }}>MRP</th>
                                                    {/* <th style={{ minWidth: "16rem" }}>Amount</th> */}
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}
                                                                    onBlur={async (e) => {
                                                                        if (e.target.value) {
                                                                            const product = await ApiService.get('product/' + e.target.value);
                                                                            setlineProduct(product?.data.document)
                                                                            setValue(`products.${index}.account`, product?.data.document.assetAccount);
                                                                            setValue(`products.${index}.name`, product?.data.document.name);
                                                                            setValue(`products.${index}.quantity`, 1);
                                                                            setValue(`products.${index}.taxes`, product?.data.document.igstRate);
                                                                            setValue(`products.${index}.description`, product?.data.document.description);
                                                                            setValue(`products.${index}.unitPrice`, product?.data.document.cost ? product?.data.document.cost : 0);
                                                                            setValue(`products.${index}.salesPrice`, product?.data.document.salesPrice);
                                                                            setValue(`products.${index}.index`, index);

                                                                            const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                            setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                            updateOrderLines(index)
                                                                        }
                                                                    }}>
                                                                    <option value={null}></option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                                {errors?.['products']?.[index]?.['product']?.['message'] && <p style={{ color: "red" }}>{errors?.['products']?.[index]?.['product']?.['message']}</p>}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`products.${index}.description`)} />
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="text"
                                                                    id="size"
                                                                    name="size"
                                                                    {...register(`products.${index}.size`)} />
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`products.${index}.quantity`)}
                                                                    onBlur={(e) => {
                                                                        // Set 1 if this field is blank
                                                                        checkBlank(e, index, "quantity", setValue)

                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                        setValue(`products.${index}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(values[1])).toFixed(2));

                                                                        updateOrderLines(index)
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        {!isAddMode && <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="received"
                                                                    name="received"
                                                                    {...register(`products.${index}.received`)} />
                                                            </Form.Group>
                                                        </td>}
                                                        {!isAddMode && <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="text"
                                                                    id="billed"
                                                                    name="billed"
                                                                    {...register(`products.${index}.billed`)} />
                                                            </Form.Group>
                                                        </td>}
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`products.${index}.unitPrice`)}
                                                                    onBlur={async (e) => {
                                                                        // Set 1 if this field is blank
                                                                        checkBlank(e, index, "unitPrice", setValue)

                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`, `products.${index}.product`])
                                                                        setValue(`products.${index}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(values[1])).toFixed(2))

                                                                        const product = await ApiService.get('product/' + values[2]);
                                                                        setValue(`products.${index}.account`, product.data.document.assetAccount);
                                                                        setValue(`products.${index}.name`, product.data.document.name);
                                                                        setValue(`products.${index}.description`, product.data.document.description)

                                                                        updateOrderLines(index)
                                                                    }}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`products.${index}.subTotal`)} />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="salesPrice"
                                                                    name="salesPrice"
                                                                    disabled
                                                                    {...register(`products.${index}.salesPrice`)} />
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    itemRemove(index)
                                                                    updateOrderLines(index)
                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={(e) => {
                                                                    const v = getValues("products")
                                                                    v?.map(e => {
                                                                        if (e.index == index) {
                                                                            console.log("hi");
                                                                            swal.fire({
                                                                                title: `Enter quantity`,
                                                                                text: "Enter quantity...",
                                                                                input: 'number',
                                                                                showCancelButton: true
                                                                            }).then(async (result) => {
                                                                                if (result.value == undefined) {
                                                                                    console.log("please enter something");
                                                                                    swal("please enter something in popup..")
                                                                                } else {
                                                                                    BarcodePDF.generateDefaultPurchaseOrderBarcodePDF(result.value, e)
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }}
                                                            >Get barcode</Button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ product: null, description: '', quantity: 1, unitPrice: 0, subTotal: 0, salesPrice: 0 })} >Add a product</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    </Container>
                    <Container className="mt-4 mb-4" fluid>
                        <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            <Col sm="12" md="4">
                                <Card style={{ marginRight: 1, marginTop: 1 }}>
                                    {/* <Card.Header as="h5">Featured</Card.Header> */}
                                    <Card.Body>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>Sub Total:</Col>
                                            <Col>{formatNumber(state?.estimation?.untaxedAmount)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>CGST:</Col>
                                            <Col>{formatNumber(state?.estimation?.cgst)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>SGST:</Col>
                                            <Col>{formatNumber(state?.estimation?.sgst)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state?.estimation?.total)}</Col>
                                        </Row>


                                    </Card.Body>
                                </Card>

                            </Col>
                        </Row>

                    </Container>
                    {/* <Container className="mt-4 mb-4" fluid>
                        <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            <Col sm="12" md="4">
                                <Card>
                                    <Card.Header as="h5">Featured</Card.Header>
                                    <Card.Body>

                                        <Row style={{ textAlign: 'right', fontSize: '20px' }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state.total)}</Col>
                                           
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container> */}
                </Container>
            </Form>
        </Container>
    )
}

function tagRender(props) {
    const colours = [{ value: 'gold' }, { value: 'lime' }, { value: 'green' }, { value: 'cyan' }];
    const random = Math.floor(Math.random() * colours.length);

    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = event => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <></>
        // <Tag
        //     color={colours[random].value}
        //     onMouseDown={onPreventMouseDown}
        //     closable={closable}
        //     onClose={onClose}
        //     style={{ marginRight: 3 }}>
        //     {label}
        // </Tag>
    );
}
