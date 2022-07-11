
import { React, useState, useEffect } from 'react'
import { BsTrash } from 'react-icons/bs';
import { BiEditAlt } from "react-icons/bi";
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Breadcrumb, Card, Form } from 'react-bootstrap'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage, formatNumber, infoNotification } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import SelectField from '../../pcterp/field/SelectField'
import TextField from '../../pcterp/field/TextField'
import TextArea from '../../pcterp/field/TextArea'
import DateField from '../../pcterp/field/DateField'
import NumberField from '../../pcterp/field/NumberField'
import AppLoader from '../../pcterp/components/AppLoader'
import LogHistories from '../../pcterp/components/LogHistories'
import AppContentLine from '../../pcterp/builder/AppContentLine'
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import { PurchaseOrderPDF } from '../../helpers/PDF';
import CheckboxField from '../../pcterp/field/CheckboxField';
import swal from "sweetalert2"
import InputGroupWithButton from '../../pcterp/field/InputGroupWithButton';
import { Typeahead } from 'react-bootstrap-typeahead';

export default function Invoice() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [isPOSelected, setIsPOSelected] = useState(false)
    const [addDiscount, setaddDiscount] = useState(false)
    const [showDiscountAmountAndSaveBtn, setshowDiscountAmountAndSaveBtn] = useState(false)
    const [vendorObj, setvendorObj] = useState()
    const [vendorData, setvendorData] = useState()
    const [Products, setProducts] = useState([])
    const [CustomIndex, setCustomIndex] = useState(0)

    const [lineSelectProductObj, setlineSelectProductObj] = useState()
    const [state, setState] = useState({
        estimation: {
            fredgeCost: 0.00,
            untaxedAmount: 0.00,
            tax: 0.00,
            total: 0.00
        }
    })
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();
    const [billList, setbillList] = useState([])

    const { register, control, reset, handleSubmit, getValues, setValue, setFocus, watch, formState: { errors } } = useForm({
        defaultValues: {
            recepientAccountArray: null,
            sourceDocumentArray: null,
            fredgeCost: 0.00,
            discountCharge: 0.00,
            discountAmount: 0.00,
            boxLess: 0.00,
            perMeterLess: 0.00,
            perPcsLess: 0.00,
            discountPercentLess: 0.00,
        }
    });

    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: deductionAndAditionAppend, remove: deductionAndAditionRemove, fields: deductionAndAditionFields } = useFieldArray({ control, name: "deductionAndAditions" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    let totalPurchasedQuantity = 0;
    let totalBilledQuantity = 0;
    let totalReceivedQuantity = 0;
    let totalReceived = 0;
    let totalBilled = 0;

    // Functions
    console.log(rootPath);
    const onSubmit = async (formData) => {
        formData.estimation = state.estimation
        formData.discountPercentLess = vendorData?.discountPercentLess
        formData.boxLess = vendorData?.boxLess
        formData.perPcsLess = vendorData?.perPcsLess
        formData.perMeterLess = vendorData?.perMeterLess

        console.log(formData);

        // await ApiService.patch("newBill/findDuplicatereferenceNumber", { referenceNumber: getValues("referenceNumber") }).then(res => {
        //     console.log(res);
        //     if (res.data.isFindBill) {
        //         infoNotification("There is another bill with same reference number ❕. Please enter different reference number")
        //     } else {

        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);

        // }
        // }).catch (e => {
        //     console.log(e);
        // })
        // return isAddMode
        //     ? createDocument(formData)
        //     : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        console.log(data);
        console.log("PROCESSING")

        await ApiService.patch("newBill/findDuplicatereferenceNumber", { referenceNumber: getValues("referenceNumber") }).then(res => {
            console.log(res);
            if (res.data.isFindBill) {
                infoNotification("There is another bill with same reference number ❕. Please enter different reference number")
            } else {


                if (state?.paymentStatus === "Paid") {
                    alert("You can't Update this record")
                } else {
                    ApiService.setHeader();
                    // ApiService.post('newBill', data).then(async (response) => {
                    ApiService.post('newBill/stansaloneBill', data).then(async (response) => {
                        console.log("RESPONSE", response);
                        if (response.data.isSuccess) {
                            // if (response.data.document.sourceDocumentArray !== null) {
                            if (response.data.document.sourceDocumentArray.length) {
                                console.log(response);
                                const PO = await ApiService.get('purchaseOrder/' + response.data.document.sourceDocument);
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

                                    await ApiService.patch('purchaseOrder/' + response.data.document.sourceDocument, { billingStatus: 'Fully Billed' }).then(async res => {
                                        if (res.data.isSuccess) {
                                            console.log(res)
                                            await ApiService.patch('purchaseOrder/increaseProductqty/' + res.data.document._id, res.data.document).then(r => {
                                                if (r.data.isSuccess) {
                                                    navigate(`/${rootPath}/bills/list`)
                                                }
                                            })
                                        }
                                    })
                                } else if (totalPurchasedQuantity === totalReceivedQuantity) {
                                    await ApiService.patch('purchaseOrder/' + response.data.document.sourceDocument, { billingStatus: 'Fully Received / Partially billed' })
                                } else {
                                    await ApiService.patch('purchaseOrder/' + response.data.document.sourceDocument, { billingStatus: 'Partially Received / Billed' })
                                }

                            }
                            navigate(`/${rootPath}/bills/list`);
                        }
                    }).catch(e => {
                        console.log(e);
                        errorMessage(e, null)
                    })
                }
            }
        })
    }

    const updateDocument = (id, data) => {

        // if (state.status === "Posted") {
        //     alert("You can't Update this record")
        // } else {
        ApiService.setHeader();
        return ApiService.patch(`/newBill/${id}`, data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/bills/list`)
            }
        }).catch(e => {
            console.log(e);
        })
        // }

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/newBill/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/bills/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = async () => {
        ApiService.setHeader();
        return ApiService.get(`/newBill/${id}`).then(async response => {
            const document = response?.data.document;
            console.log(document);
            setState(document)
            reset(document);
            if (document.billDate) {
                setValue('billDate', document.billDate.split("T")[0])
            }

            //
            // Find all bill payments related to each record
            const allBills = await ApiService.get(`billPayment/findBillsById/${response?.data.document?._id}`)
            if (allBills?.data.isSuccess) {
                console.log(allBills?.data.documents);
                setbillList(allBills?.data.documents)
            } else {
                errorMessage(allBills.data.message, null)
            }
            //

            setLoderStatus("SUCCESS");
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    const handleConfirmButton = async () => {
        console.log(state)
        await ApiService.patch('newBill/' + state.id, { status: "Posted", referenceNumber: getValues('referenceNumber') }).then(response => {
            console.log(response)
            if (response.data.isSuccess) {
                const itemReceipt = response.data.document;
                setState(itemReceipt)
                reset(itemReceipt);
                if (itemReceipt.billDate) {
                    setValue('billDate', itemReceipt.billDate.split("T")[0]);
                }
            }
            console.log(rootPath)
            navigate(`/${rootPath}/bills/edit/${id}`)
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const handleRegisterPaymentButton = async () => {
        // setShowRegisterPaymentModal(true);
        // history.push("/purchase/billpayment/" + state.id);
        console.log(state);
        await ApiService.post("/billPayment/createStandaloneBillPayment", state).then((res) => {
            if (res.data.isSuccess) {
                console.log(res.data);
                navigate(`/${rootPath}/billpayment/edit/` + res.data.document._id)
            }
        });
    }

    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generateBillPDF(state.id);
        return;
    }

    const handleBillPayment = () => {
        console.log(billList);
        navigate(`/${rootPath}/billpayment/${id}`)
    }


    const calculateBillCount = async () => {
        ApiService.setHeader();
        const allBills = await ApiService.get(`billPayment/findBillsById/${id}`)
        if (allBills.data.isSuccess) {
            console.log(allBills?.data.documents);
            setbillList(allBills?.data.documents)
        }
    }

    const updateOrderLines = () => {
        let cumulativeSum = 0, totalTax = 0, discountOraddition = 0;
        const products = getValues('invoiceLines')
        const disAndAdd = getValues('deductionAndAditions')
        console.log(disAndAdd);
        console.log(getValues("fredgeCost"));
        console.log(getValues("discountCharge"));
        products?.map((val) => {
            cumulativeSum += parseFloat(val?.subTotal);
            totalTax += (parseFloat(val?.taxes) * parseFloat(val?.subTotal)) / 100
        });

        disAndAdd?.map((val) => {
            discountOraddition += parseFloat(val?.amount);
        });
        console.log(discountOraddition);

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            tax: totalTax,
            total: parseFloat(cumulativeSum + totalTax) + parseFloat((getValues("fredgeCost") ? getValues("fredgeCost") : 0) + parseFloat(getValues("discountCharge") ? getValues("discountCharge") : 0) + parseFloat(discountOraddition == 0 ? 0 : parseFloat(discountOraddition)))
        });

        setState(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: cumulativeSum,
                fredgeCost: !isAddMode ? state?.estimation.fredgeCost : parseFloat((getValues("fredgeCost"))),
                discountCharge: !isAddMode ? state?.estimation.discountCharge : parseFloat((getValues("discountCharge"))),
                tax: totalTax,
                // total: parseFloat(cumulativeSum + totalTax)
                total: parseFloat(cumulativeSum + totalTax) + parseFloat((getValues("fredgeCost") ? parseFloat(getValues("fredgeCost")) : 0) + parseFloat(getValues("discountCharge") ? getValues("discountCharge") : 0) + parseFloat(discountOraddition == 0 ? 0 : parseFloat(discountOraddition)))
            }
        }));
    }

    const updateOrderLinesWithDiscount = () => {
        let cumulativeSum = 0, totalTax = 0;

        let discount = parseFloat(getValues("discount")).toFixed(2)
        console.log(discount);

        let valueAfterDiscount = (parseFloat(state?.estimation.total * discount) / 100).toFixed(2)
        console.log(valueAfterDiscount);
        console.log(state?.estimation.total - valueAfterDiscount);

        const products = getValues('invoiceLines')
        console.log(products);
        products?.map((val) => {
            cumulativeSum += parseFloat(val?.subTotal);
            totalTax += (parseFloat(val?.taxes) * parseFloat(val?.subTotal)) / 100
        });

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            tax: totalTax,
            total: parseFloat(state?.estimation.total - valueAfterDiscount).toFixed(2)
        });

        setState(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: cumulativeSum,
                tax: totalTax,
                total: parseFloat(state?.estimation.total - valueAfterDiscount).toFixed(2)
            }
        }));
    }

    const updateCurrentLine = (index) => {

    }

    const createInvoiceItems = (document) => {
        if (!document) return;

        setValue('vendorArray', document?.vendor)
        console.log(document)
        const documentArray = [];

        document?.products?.map(product => {
            const invoiceItem = {};
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
            documentArray.push(invoiceItem)
        })

        setValue("invoiceLines", documentArray)
    }

    const fredgeCostCalculation = (e) => {

        console.log(getValues("fredgeCost"));
        console.log(typeof parseFloat((getValues("fredgeCost"))));

        let total;
        if (getValues("fredgeCost") !== "") {
            console.log("in");
            setValue("estimation", {
                untaxedAmount: state.estimation.untaxedAmount,
                tax: state.estimation.tax,
                total: parseFloat(state.estimation.untaxedAmount) + parseFloat(state.estimation.tax) + parseFloat((getValues("fredgeCost")))
            });

            setState(prevState => ({
                ...prevState,    // keep all other key-value pairs
                estimation: {
                    fredgeCost: parseFloat((getValues("fredgeCost"))),
                    untaxedAmount: state.estimation.untaxedAmount,
                    tax: state.estimation.tax,
                    total: parseFloat(state.estimation.untaxedAmount) + parseFloat(state.estimation.tax) + parseFloat((getValues("fredgeCost")))
                }
            }));
        } else {
            updateOrderLines()
        }
    }

    const discountChargesCalculation = () => {
        let total;
        if (getValues("discountCharge") !== "") {
            console.log("in");
            setValue("estimation", {
                untaxedAmount: state.estimation.untaxedAmount,
                tax: state.estimation.tax,
                total: parseFloat(state.estimation.total) + parseFloat((getValues("discountCharge")))
            });

            setState(prevState => ({
                ...prevState,    // keep all other key-value pairs
                estimation: {
                    fredgeCost: parseFloat((getValues("fredgeCost"))),
                    discountCharge: parseFloat((getValues("discountCharge"))),
                    untaxedAmount: state.estimation.untaxedAmount,
                    tax: state.estimation.tax,
                    total: parseFloat(state.estimation.total) + parseFloat((getValues("discountCharge")))
                }
            }));
        } else {
            updateOrderLines()
        }
    }

    const setStatusToPaid = async () => {
        console.log("in");
        await ApiService.patch("newBill/" + state?._id, { status: "Posted", paymentStatus: "Paid" }).then(res => {
            if (res.data.isSuccess) {
                console.log(res.data.document);
                navigate(`/${rootPath}/bills/list`)
            }
        })
    }

    useEffect(async () => {

        const response = await ApiService.get(`/product/list`);
        console.log(response.data.documents)
        setProducts(response.data.documents)

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()
            calculateBillCount();
        }
    }, []);

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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/bills/list` }}>   <div className='breadcrum-label'>BILLS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {(!isAddMode && state?.isUsed) || state.status == "Posted" ? "" : <Button type="submit" variant="primary" size="sm">SAVE</Button>}{" "}
                            {showDiscountAmountAndSaveBtn ? <Button type="submit" variant="primary" size="sm">SAVE</Button> : ""}{" "}
                            <Button as={Link} to={`/${rootPath}/bills/list`} variant="secondary" size="sm">DISCARD</Button>
                            {(!isAddMode && state?.isUsed) || state.status == "Posted" ? "" : <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                            {state.status == "Posted" ? "" : <Button variant="primary" size="sm" onClick={setStatusToPaid}>CONFIRM PAYMENT</Button>}
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}
                <Row className="p-0 mt-2 m-0">
                    <Col >
                        <ButtonGroup size="sm">

                            {/* {state?.status === "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""} */}
                            {(state.status == "Posted" && state.paymentStatus == "Not Paid") || (state.status == "Posted" && state.paymentStatus == "Partially Paid") ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
                        </ButtonGroup>
                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>
                        {/* <div className="me-1 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> */}

                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && billList?.length ? <Button size="sm" onClick={handleBillPayment} varient="primary">Bill Payments</Button> : ""}
                        </div>

                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && <div className='' style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
                        </div>
                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && <div className='' style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.paymentStatus}</div>}
                        </div>
                    </Col>
                </Row>


                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>
                        {/* <Col><BiEditAlt onClick={() => {
                            navigate("/accounting/vendor/add")
                        }} /></Col> */}
                        {
                            (!isAddMode || addDiscount) &&
                            <>
                                <Col><b>DISCOUNT % LESS : </b>{addDiscount ? vendorData?.discountPercentLess : state?.discountPercentLess} %</Col>
                                <Col><b>BOX LESS : </b>{addDiscount ? formatNumber(vendorData?.boxLess) : formatNumber(state?.boxLess)}</Col>
                                <Col><b>PER METER LESS : </b>{addDiscount ? formatNumber(vendorData?.perMeterLess) : formatNumber(state?.perMeterLess)}</Col>
                                <Col><b>PER PCS LESS : </b>{addDiscount ? formatNumber(vendorData?.perPcsLess) : formatNumber(state?.perPcsLess)}</Col>
                            </>
                        }
                    </Row>
                    <Row style={{ marginTop: "15px" }}>

                        {
                            rootPath !== "accounting" ?
                                <SelectField
                                    control={control}
                                    errors={errors}
                                    field={{
                                        disabled: true,
                                        description: "",
                                        label: "SOURCE DOCUMENT",
                                        fieldId: "sourceDocument",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the department name!",
                                        // selectRecordType: "purchaseOrder/unbilled"
                                    }}
                                    changeHandler={async (event, data) => {
                                        if (!data) return
                                        setValue("sourceDocument", data?.value?.id)
                                    }}
                                    blurHandler={async (event, data) => {
                                        if (!event) return;
                                        if (!data) return;

                                        if (data?.value) {
                                            if (!data?.value[0]?.id) return
                                            setIsPOSelected(true)
                                            // console.log(data.value[0].id)
                                            const response = await ApiService.get('purchaseOrder/' + data?.value[0]?.id)
                                            if (response.data.isSuccess) {
                                                console.log(response.data.document);
                                                createInvoiceItems(response.data.document)
                                                updateOrderLines();

                                            }
                                        }
                                    }}
                                /> : ""
                        }

                        {/* <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "VENDOR",
                                fieldId: "vendorArray",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "vendor"

                            }}
                            changeHandler={async (event, data) => {
                                console.log(data.value);
                                if (!data.value) return

                                if (!data.value.length) {
                                    setaddDiscount(false)
                                }
                                if (data.value) {
                                    setValue("referenceNumber", `${data?.value?.name}-`)
                                    setValue("vendor", data?.value?.id)
                                    setvendorObj(data.value)

                                    const vendor = await ApiService.get("vendor/" + data.value._id)
                                    if (vendor.data.isSuccess) {
                                        console.log(vendor.data.document);
                                        setvendorData(vendor.data.document)
                                        if (vendor.data.document.boxLess == 0 && vendor.data.document.perMeterLess == 0 && vendor.data.document.perPcsLess == 0 && vendor.data.document.discountPercentLess == 0) {
                                            setaddDiscount(false)
                                        } else {
                                            setaddDiscount(true)
                                        }
                                    } else {
                                        return
                                    }
                                } else {
                                    setaddDiscount(false)
                                }
                            }}
                            blurHandler={(e, data) => {
                                console.log(data.value);
                                if (data.value == "undefined") {
                                    setValue("referenceNumber", "")
                                } else if (data.value?.length == 0) setValue("referenceNumber", "")
                            }}
                        /> */}

                        <InputGroupWithButton
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "VENDOR",
                                fieldId: "vendorArray",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "vendor",
                                createRecordType: "vendor",
                                isVisible: isAddMode ? true : false,
                                disabled: isAddMode ? false : true
                            }}
                            changeHandler={async (e, data) => {
                                console.log(data.value);
                                console.log(e);
                                if (!data.value) return

                                if (!data.value.length) {
                                    setaddDiscount(false)
                                    setValue("referenceNumber", "")
                                }
                                if (data.value && e.length) {
                                    setValue("referenceNumber", `${data?.value?.name}-`)
                                    setValue("vendor", data?.value?.id)
                                    setvendorObj(data.value)

                                    const vendor = await ApiService.get("vendor/" + data.value._id)
                                    if (vendor.data.isSuccess) {
                                        console.log(vendor.data.document);
                                        setvendorData(vendor.data.document)
                                        if (vendor.data.document.boxLess == 0 && vendor.data.document.perMeterLess == 0 && vendor.data.document.perPcsLess == 0 && vendor.data.document.discountPercentLess == 0) {
                                            setaddDiscount(false)
                                        } else {
                                            setaddDiscount(true)
                                        }
                                    } else {
                                        return
                                    }
                                } else {
                                    setaddDiscount(false)
                                }
                            }}
                            blurHandler={(e, data) => {
                                console.log(data.value);
                                if (data.value == undefined) {
                                    setValue("referenceNumber", "")
                                } else if (data.value?.length == 0) setValue("referenceNumber", "")
                            }}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "SUB VENDOR",
                                fieldId: "subVendor",
                                placeholder: "",
                                disabled: isAddMode ? false : true
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                console.log(e.target.value);
                                if (e.target.value) {
                                    setValue("referenceNumber", `${vendorObj?.name}-${e.target.value}-`)
                                } else {
                                    setValue("referenceNumber", `${vendorObj?.name}-`)
                                }
                            }}
                        />

                        <DateField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "BILL DATE",
                                fieldId: "billDate",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the bill's created date!",
                                disabled: isAddMode ? false : true
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        {/* <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Recipient Bank",
                                label: "RECIPIENT BANK",
                                fieldId: "recepientAccountArray",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "account",
                                multiple: false,
                                disabled: isAddMode ? false : true
                            }}
                            changeHandler={async (event, data) => {
                                if (!data) return
                                setValue("recepientAccount", data?.value?.id)
                            }}
                            blurHandler={null}
                        /> */}
                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "REFERENCE NUMBER",
                                fieldId: "referenceNumber",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                                disabled: isAddMode ? false : true
                            }}
                            changeHandler={null}
                            blurHandler={async (e) => {
                                if (!e.target.value) return;
                                if (e.target.value) {
                                    await ApiService.patch("newBill/findDuplicatereferenceNumber", { referenceNumber: e.target.value }).then(res => {
                                        if (res.data.isFindBill) {
                                            infoNotification("There is another bill with same reference number ❕. Please enter different reference number")
                                        }
                                    }).catch(e => {
                                        console.log(e);
                                    })
                                }
                            }}
                        />

                        {/* {
                            (!isAddMode || addDiscount) &&
                            <CheckboxField
                                register={register}
                                errors={errors}
                                field={{
                                    description: "",
                                    label: "ADD DISCOUNT",
                                    fieldId: "addDiscount",
                                    placeholder: "",
                                    // required: true,
                                    // validationMessage: "Please enter the Account Number!"
                                }}
                                changeHandler={null}
                                blurHandler={async (e, data) => {
                                    let totalLess = 0;
                                    let total = 0;
                                    console.log(data);
                                    if (data.value) {
                                        totalLess = vendorData.boxLess + vendorData.perMeterLess + vendorData.perPcsLess
                                        if (vendorData.discountPercentLess != 0) {
                                            total = (parseFloat(state.estimation?.untaxedAmount) - ((parseFloat(state.estimation?.untaxedAmount - totalLess) * vendorData.discountPercentLess) / 100))
                                        } else {
                                            total = parseFloat(state.estimation?.untaxedAmount - totalLess)
                                        }


                                        setState(prevState => ({
                                            ...prevState,    // keep all other key-value pairs
                                            estimation: {
                                                untaxedAmount: total,
                                                tax: state.estimation.tax,
                                                total: state.estimation.tax + total
                                            }
                                        }));
                                        console.log(state);
                                    } else {
                                        updateOrderLines()
                                    }

                                }}
                            />
                        } */}

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "REMAINING AMOUNT",
                                fieldId: "remainAmountToPay",
                                placeholder: "",
                                disabled: true
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        {
                            (showDiscountAmountAndSaveBtn || !isAddMode) &&
                            <TextField
                                register={register}
                                errors={errors}
                                field={{
                                    description: "",
                                    label: "DISCOUNT AMOUNT",
                                    fieldId: "discountAmount",
                                    placeholder: "",
                                    disabled: false
                                    // required: true,
                                    // validationMessage: "Please enter the Account Number!"
                                }}
                                changeHandler={null}
                                blurHandler={(e) => {
                                    if (e.target.value) {
                                        setValue("remainAmountToPay", (parseFloat(state?.remainAmountToPay) - parseFloat(e.target.value)).toFixed(2))
                                    } else {
                                        setValue("remainAmountToPay", state?.remainAmountToPay)
                                    }
                                }}
                            />
                        }

                        {
                            state?.paymentStatus == "Partially Paid" &&
                            <CheckboxField
                                register={register}
                                errors={errors}
                                field={{
                                    description: "",
                                    label: "APPLY DISCOUNT",
                                    fieldId: "applyDiscount",
                                    placeholder: "",
                                    disabled: false
                                    // required: true,
                                    // validationMessage: "Please enter the Account Number!"
                                }}
                                changeHandler={null}
                                blurHandler={(e, data) => {
                                    console.log(e);
                                    console.log(data);
                                    if (data.value) {
                                        setshowDiscountAmountAndSaveBtn(true)
                                    } else {
                                        setshowDiscountAmountAndSaveBtn(false)
                                        setValue("remainAmountToPay", state?.remainAmountToPay)
                                        setValue("discountAmount", 0)

                                    }
                                }}
                            />
                        }

                        <TextField
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
                                disabled: isAddMode ? false : true
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
                                disabled: isAddMode ? false : true
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />


                    </Row>
                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey='invoiceLines'>
                        <Tab eventKey="invoiceLines" title="INVOICE ITEMS">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            {!isPOSelected && isAddMode && <th style={{ minWidth: "2rem" }}>#</th>}
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "20rem" }}>PRODUCT</th>
                                            <th style={{ minWidth: "16rem" }}>DESCRIPTION</th>
                                            <th style={{ minWidth: "16rem" }}>UOM</th>
                                            <th style={{ minWidth: "16rem" }}>HSN</th>
                                            <th style={{ minWidth: "16rem" }}>ACCOUNT</th>
                                            <th style={{ minWidth: "16rem" }}>QUANTITY</th>
                                            <th style={{ minWidth: "16rem" }}>PRICE</th>
                                            <th style={{ minWidth: "16rem" }}>MRP</th>
                                            <th style={{ minWidth: "16rem" }}>TAXES (%)</th>
                                            <th style={{ minWidth: "16rem" }}>DISCOUNT</th>
                                            <th style={{ minWidth: "16rem" }}>SUB TOTAL</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceLineFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                {!isPOSelected && isAddMode && <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            // invoiceLineRemove(index)
                                                            // updateOrderLines(index)

                                                            swal.fire({
                                                                title: `Delete warning`,
                                                                text: "Do you really want to delete this line?",
                                                                // input: 'number',
                                                                showCancelButton: true
                                                            }).then(async (result) => {
                                                                if (result.value == undefined) {
                                                                    // infoNotification("please enter something in popup..")
                                                                } else {
                                                                    invoiceLineRemove(index)
                                                                    updateOrderLines(index)
                                                                }
                                                            })
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>}

                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
                                                <td>
                                                    {/* <LineSelectField
                                                        control={control}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "productArray",
                                                            placeholder: "",
                                                            selectRecordType: "product",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            if (!data) return
                                                            setValue("product", data?.value?.id);

                                                        }}
                                                        blurHandler={async (event, data) => {
                                                            if (!data?.okay) return
                                                            const productId = data?.okay[0]?._id;
                                                            ApiService.setHeader();
                                                            ApiService.get('product/' + productId).then(response => {
                                                                const productObj = response.data.document;
                                                                setlineSelectProductObj(productObj)
                                                                console.log(productObj);
                                                                if (productObj) {
                                                                    setValue(`invoiceLines.${index}.product`, productObj._id);
                                                                    setValue(`invoiceLines.${index}.name`, productObj.name);
                                                                    setValue(`invoiceLines.${index}.label`, productObj.description);
                                                                    setValue(`invoiceLines.${index}.unitArray`, productObj.uom);
                                                                    setValue(`invoiceLines.${index}.quantity`, 1);
                                                                    setValue(`invoiceLines.${index}.taxes`, productObj?.igstRate);
                                                                    setValue(`invoiceLines.${index}.unitPrice`, productObj.cost);
                                                                    setValue(`invoiceLines.${index}.mrp`, productObj.salesPrice);
                                                                    setValue(`invoiceLines.${index}.subTotal`, (parseFloat(productObj.cost) * 1).toFixed(2));
                                                                    setValue(`invoiceLines.${index}.accountArray`, productObj.assetAccount);
                                                                    updateOrderLines(index)
                                                                }
                                                            }).catch(err => {
                                                                console.log("ERROR", err)
                                                            })
                                                        }}
                                                    /> */}


                                                    <Controller
                                                        name={`invoiceLines.${index}.productArray`}
                                                        control={control}
                                                        // rules={{ required: field?.required ? field?.validationMessage : false }}
                                                        render={({ field: { onChange, value }, fieldState: { error } }) => {

                                                            return (
                                                                <Typeahead size='sm' className='is-invalid' style={{ maxWidth: '400px' }}

                                                                    id="productArray"
                                                                    {...register(`invoiceLines.${index}.productArray`)}
                                                                    labelKey="name"
                                                                    onChange={async (e, data) => {
                                                                        console.log(e);
                                                                        if (!e.length) return
                                                                        setValue("product", e[0]._id);

                                                                    }}
                                                                    onBlur={async (e, data) => {
                                                                        console.log(e.target.value);

                                                                        if (!e.target.value) return

                                                                        ApiService.setHeader();
                                                                        const res = await ApiService.get(`product/search/${e.target.value}`)
                                                                        console.log(res?.data?.document[0]?._id);

                                                                        // const productId = data?.okay[0]?._id;
                                                                        const productId = res?.data?.document[0]?._id;
                                                                        ApiService.get('product/' + productId).then(response => {
                                                                            const productObj = response.data.document;
                                                                            setlineSelectProductObj(productObj)
                                                                            console.log(productObj);

                                                                            let obj = new Object();
                                                                            obj._id = productObj._id
                                                                            obj.id = productObj.id
                                                                            obj.name = productObj.name

                                                                            if (productObj) {
                                                                                setValue(`invoiceLines.${index}.product`, productObj._id);
                                                                                setValue(`invoiceLines.${index}.productArray`, [obj]);
                                                                                setValue(`invoiceLines.${index}.name`, productObj.name);
                                                                                setValue(`invoiceLines.${index}.label`, productObj.description);
                                                                                setValue(`invoiceLines.${index}.unitArray`, productObj.uom);
                                                                                setValue(`invoiceLines.${index}.quantity`, 1);
                                                                                setValue(`invoiceLines.${index}.taxes`, productObj?.igstRate);
                                                                                setValue(`invoiceLines.${index}.unitPrice`, productObj.cost);
                                                                                setValue(`invoiceLines.${index}.mrp`, productObj.salesPrice);
                                                                                setValue(`invoiceLines.${index}.subTotal`, (parseFloat(productObj.cost) * 1).toFixed(2));
                                                                                setValue(`invoiceLines.${index}.accountArray`, productObj.assetAccount);
                                                                                updateOrderLines(index)
                                                                            }
                                                                        }).catch(err => {
                                                                            console.log("ERROR", err)
                                                                        })
                                                                    }}
                                                                    options={Products}
                                                                    selected={value}
                                                                    positionFixed={true}
                                                                    flip={true}
                                                                    clearButton

                                                                />
                                                            )
                                                        }
                                                        }
                                                    />

                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "label",
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
                                                        model={"invoiceLines"}
                                                        field={{

                                                            fieldId: "unitArray",
                                                            placeholder: "",
                                                            selectRecordType: "uom",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            if (!data) return
                                                            setValue("unit", data?.value[0]?.id)
                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "hsnCode",
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
                                                        model={"invoiceLines"}
                                                        field={{

                                                            fieldId: "accountArray",
                                                            placeholder: "",
                                                            selectRecordType: "account",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            if (!data) return
                                                            setValue("account", data?.value?.id)
                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>
                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "quantity",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            if (!data?.value) return;
                                                            let quantity = data?.value;
                                                            let unitPrice = getValues(`invoiceLines.${index}.unitPrice`);
                                                            let taxes = getValues(`invoiceLines.${index}.taxes`);
                                                            let netAmount = (parseFloat(quantity) * parseFloat(unitPrice));
                                                            setValue(`invoiceLines.${index}.subTotal`, (parseFloat(netAmount)).toFixed(2));
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>
                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            disabled: false,
                                                            fieldId: "unitPrice",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            console.log(event, data)
                                                            let unitPrice = data?.value;
                                                            let quantity = getValues(`invoiceLines.${index}.quantity`);
                                                            let taxes = getValues(`invoiceLines.${index}.taxes`);
                                                            setValue(`invoiceLines.${index}.subTotal`, (parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2))
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>

                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            disabled: false,
                                                            fieldId: "mrp",
                                                            placeholder: ""
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
                                                        model={"invoiceLines"}
                                                        field={{
                                                            disabled: false,
                                                            fieldId: "taxes",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={(e) => {
                                                            if (e.target.value) {
                                                                updateOrderLines()
                                                            }
                                                        }}
                                                    />
                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "discount",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={(e) => {
                                                            // console.log((parseFloat(e.target.value)));
                                                            // console.log((parseFloat(getValues(`invoiceLines.${index}.subTotal`))));
                                                            // console.log((parseFloat(getValues(`invoiceLines.${index}.subTotal`)) - parseFloat(e.target.value)).toFixed(2));
                                                            if (e.target.value) {
                                                                setValue(`invoiceLines.${index}.subTotal`, (parseFloat(getValues(`invoiceLines.${index}.quantity`) * parseFloat(getValues(`invoiceLines.${index}.unitPrice`))) - parseFloat(e.target.value)).toFixed(2))
                                                                updateOrderLines(index)
                                                            } else {
                                                                setValue(`invoiceLines.${index}.subTotal`, (parseFloat(getValues(`invoiceLines.${index}.quantity`) * parseFloat(getValues(`invoiceLines.${index}.unitPrice`)))).toFixed(2))
                                                                updateOrderLines(index)
                                                            }
                                                        }}
                                                    />

                                                </td>

                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"invoiceLines"}
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
                                                </td>
                                            </tr>
                                            )
                                        })}
                                        {!isPOSelected && isAddMode && <tr>
                                            <td colSpan="14">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => {
                                                    invoiceLineAppend({
                                                        product: null,
                                                        description: '',
                                                        quantity: 1,
                                                        account: null,
                                                        mrp: 0,
                                                        taxes: 0,
                                                        unitPrice: 0,
                                                        subTotal: 0
                                                    }, { focusName: `invoiceLines.${CustomIndex}.productArray` })

                                                    // setFocus(`invoiceLines.${CustomIndex}.productArray`)
                                                    setCustomIndex(CustomIndex + 1)
                                                }
                                                }
                                                >Add a item</Button>
                                            </td>
                                        </tr>}

                                    </tbody>
                                </Table>
                            </AppContentLine>
                        </Tab>
                        <Tab eventKey="deductionAndAditions" title="DEDUCTION & ADDITION">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th style={{ minWidth: "20rem" }}>REASON</th>
                                            <th style={{ minWidth: "16rem" }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deductionAndAditionFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            // invoiceLineRemove(index)
                                                            // updateOrderLines(index)

                                                            swal.fire({
                                                                title: `Delete warning`,
                                                                text: "Do you really want to delete this line?",
                                                                // input: 'number',
                                                                showCancelButton: true
                                                            }).then(async (result) => {
                                                                if (result.value == undefined) {
                                                                    // infoNotification("please enter something in popup..")
                                                                } else {
                                                                    deductionAndAditionRemove(index)
                                                                    updateOrderLines(index)
                                                                }
                                                            })
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"deductionAndAditions"}
                                                        field={{
                                                            fieldId: "reason",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"deductionAndAditions"}
                                                        field={{
                                                            fieldId: "amount",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={(e) => {

                                                            console.log(e.target.value);
                                                            if (e.target.value) {
                                                                updateOrderLines()
                                                            } else {
                                                                setValue(`deductionAndAditions.${index}.amount`, 0)
                                                                updateOrderLines()
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                            )
                                        })}

                                        <tr>
                                            <td colSpan="14">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => {
                                                    deductionAndAditionAppend({
                                                        reason: '',
                                                        amount: 0,
                                                    })
                                                    updateOrderLines()
                                                }
                                                }
                                                >Add</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>

                            </AppContentLine>

                            {/* <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "20rem" }}>ACCOUNT</th>
                                            <th style={{ minWidth: "16rem" }}>DESCRIPTION</th>
                                            <th style={{ minWidth: "16rem" }}>DEBIT</th>
                                            <th style={{ minWidth: "16rem" }}>CREDIT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {journalItemFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td>
                                                    <LineSelectField
                                                        control={control}
                                                        model={"journalItems"}
                                                        field={{

                                                            fieldId: "accountArray",
                                                            placeholder: "",
                                                            selectRecordType: "account",
                                                            multiple: false
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
                                                        model={"journalItems"}
                                                        field={{
                                                            fieldId: "label",
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
                                                        model={"journalItems"}
                                                        field={{
                                                            fieldId: "debit",
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
                                                        model={"journalItems"}
                                                        field={{
                                                            fieldId: "credit",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
                                                    />
                                                </td>

                                            </tr>
                                            )
                                        })}

                                    </tbody>
                                </Table>

                            </AppContentLine> */}

                        </Tab>

                        {/* {!isAddMode && <Tab eventKey="auditTrail" title="Audit Trail">
                            <Container className="mt-2" fluid>
                                {!isAddMode && <LogHistories documentPath={"uom"} documentId={id} />}
                            </Container>
                        </Tab>} */}


                    </Tabs>

                </Container>

                <Container className="mt-4 mb-4" style={{ marginTop: -10 }} fluid>
                    <Row style={{ marginTop: -5 }}>
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
                                        <Col>GROSS TOTAL:</Col>
                                        <Col>{formatNumber(state?.estimation?.untaxedAmount)}</Col>
                                    </Row>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>FREIGHT COST:</Col>
                                        <Col>
                                            {
                                                !isAddMode ? <Col>{formatNumber(state?.estimation?.fredgeCost)}</Col> :
                                                    <input step="0.001" type="number" id='fredgeCost' name="fredgeCost" {...register(`fredgeCost`)} style={{ border: "none", backgroundColor: 'transparent', outline: "none", borderBottom: "1px solid black" }}
                                                        onBlur={(e) => {
                                                            // fredgeCostCalculation()
                                                            updateOrderLines()
                                                            console.log(e.target.value);
                                                            if (e.target.value == "") {
                                                                setValue("fredgeCost", 0)
                                                            }
                                                        }}
                                                    // onChange={(e) => {
                                                    //     console.log(e.target.value);
                                                    //     if (e.target.value == "") {
                                                    //         setValue("fredgeCost", 0)
                                                    //     }
                                                    // }}
                                                    />
                                            }
                                        </Col>
                                    </Row>

                                    {
                                        vendorData?.isLocal ?
                                            <div>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>UTGST:</Col>
                                                    <Col>{formatNumber(state?.estimation?.tax / 2)}</Col>
                                                </Row>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>SGST:</Col>
                                                    <Col>{formatNumber(state?.estimation?.tax / 2)}</Col>
                                                </Row>
                                            </div>
                                            : <div>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>IGST:</Col>
                                                    <Col>{formatNumber(state?.estimation?.tax)}</Col>
                                                </Row>
                                            </div>



                                    }

                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>DISCOUNT CHARGES:</Col>
                                        <Col>
                                            {
                                                !isAddMode ? <Col>{formatNumber(state?.estimation?.discountCharge)}</Col> :
                                                    <input step="0.001" type="number" id='discountCharge' name="discountCharge" {...register(`discountCharge`)} style={{ border: "none", backgroundColor: 'transparent', outline: "none", borderBottom: "1px solid black" }}
                                                        onBlur={(e) => {
                                                            // discountChargesCalculation()
                                                            updateOrderLines()
                                                            console.log(e.target.value);
                                                            if (e.target.value == "") {
                                                                setValue("discountCharge", 0)
                                                            }
                                                        }}
                                                    // onChange={(e) => {
                                                    //     console.log(e.target.value);
                                                    //     if (e.target.value == "") {
                                                    //         setValue("discountCharge", 0)
                                                    //     }
                                                    // }}
                                                    />
                                            }
                                        </Col>
                                    </Row>

                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600, marginTop: 3 }}>
                                        <Col>NET AMOUNT:</Col>
                                        <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state?.estimation?.total)}</Col>
                                    </Row>

                                </Card.Body>
                            </Card>

                        </Col>
                    </Row>

                </Container>

            </AppContentBody>
        </AppContentForm >
    )
}
