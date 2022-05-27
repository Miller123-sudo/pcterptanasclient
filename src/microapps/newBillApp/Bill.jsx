
import { React, useState, useEffect } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Breadcrumb, Card } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage, formatNumber } from '../../helpers/Utils'
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

export default function Invoice() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [isPOSelected, setIsPOSelected] = useState(false)
    const [state, setState] = useState({
        estimation: {
            untaxedAmount: 0,
            tax: 0,
            total: 0
        }
    })
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();
    const [billList, setbillList] = useState([])

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            recepientAccountArray: null,
            sourceDocumentArray: null
        }
    });

    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    let totalPurchasedQuantity = 0;
    let totalBilledQuantity = 0;
    let totalReceivedQuantity = 0;
    let totalReceived = 0;
    let totalBilled = 0;

    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        console.log("PROCESSING")
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

    const updateDocument = (id, data) => {

        if (state.status === "Posted") {
            alert("You can't Update this record")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/newBill/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    navigate(`/${rootPath}/bills/list`)
                }
            }).catch(e => {
                console.log(e);
            })
        }

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

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/newBill/${id}`).then(response => {
            const document = response?.data.document;
            console.log(document);
            setState(document)
            reset(document);
            if (document.billDate) {
                setValue('billDate', document.billDate.split("T")[0])
            }
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
        await ApiService.post("/billPayment", state).then((res) => {
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
        navigate(`/accounting/bill/billpayments/${state?._id}`)
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
        let cumulativeSum = 0, totalTax = 0;
        const products = getValues('invoiceLines')
        console.log(products);
        products?.map((val) => {
            cumulativeSum += parseFloat(val?.subTotal);
            totalTax += (parseFloat(val?.taxes[0]) * parseFloat(val?.subTotal)) / 100
        });

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            tax: totalTax,
            total: parseFloat(cumulativeSum + totalTax)
        });

        setState(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: cumulativeSum,
                tax: totalTax,
                total: parseFloat(cumulativeSum + totalTax)
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

    useEffect(() => {

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
                            {!isAddMode && state?.isUsed ? "" : <Button type="submit" variant="primary" size="sm">SAVE</Button>}{" "}
                            <Button as={Link} to={`/${rootPath}/bills/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && state?.isUsed ? "" : <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
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

                            {state?.status === "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                            {state?.status === "Posted" && state?.paymentStatus == "Not Paid" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
                        </ButtonGroup>
                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>
                        {/* <div className="me-1 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> */}
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && <div className='' style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
                        </div>
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && <div className='' style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.paymentStatus}</div>}
                        </div>
                    </Col>
                </Row>


                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

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
                        />
                        <SelectField
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
                                if (!data) return
                                setValue("vendor", data?.value?.id)
                            }}
                            blurHandler={null}
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
                                validationMessage: "Please enter the bill's created date!"
                            }}
                            changeHandler={null}
                            blurHandler={null}


                        />

                        <SelectField
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
                                multiple: false
                            }}
                            changeHandler={async (event, data) => {
                                if (!data) return
                                setValue("recepientAccount", data?.value?.id)
                            }}
                            blurHandler={null}
                        />
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
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        {/* <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Amount Remain To Pay",
                                fieldId: "remainAmountToPay",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}


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
                                            <th style={{ minWidth: "16rem" }}>ACCOUNT</th>
                                            <th style={{ minWidth: "16rem" }}>QUANTITY</th>
                                            <th style={{ minWidth: "16rem" }}>PRICE</th>
                                            <th style={{ minWidth: "16rem" }}>TAXES (%)</th>
                                            <th style={{ minWidth: "16rem" }}>SUB TOTAL</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceLineFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                {!isPOSelected && isAddMode && <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            invoiceLineRemove(index)
                                                            updateOrderLines(index)
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>}

                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
                                                <td>
                                                    <LineSelectField
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
                                                                console.log(productObj);
                                                                if (productObj) {
                                                                    setValue(`invoiceLines.${index}.product`, productObj._id);
                                                                    setValue(`invoiceLines.${index}.name`, productObj.name);
                                                                    setValue(`invoiceLines.${index}.label`, productObj.description);
                                                                    setValue(`invoiceLines.${index}.unitArray`, productObj.uom);
                                                                    setValue(`invoiceLines.${index}.quantity`, 1);
                                                                    setValue(`invoiceLines.${index}.taxes`, productObj?.vendorTaxes);
                                                                    setValue(`invoiceLines.${index}.unitPrice`, productObj.salesPrice);
                                                                    setValue(`invoiceLines.${index}.subTotal`, (parseFloat(productObj.salesPrice) * 1));
                                                                    setValue(`invoiceLines.${index}.accountArray`, productObj.assetAccount);
                                                                    updateOrderLines(index)
                                                                }
                                                            }).catch(err => {
                                                                console.log("ERROR", err)
                                                            })
                                                        }}
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
                                                            setValue(`invoiceLines.${index}.subTotal`, parseFloat(netAmount));
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>
                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            disabled: true,
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
                                                            setValue(`invoiceLines.${index}.subTotal`, (parseFloat(quantity) * parseFloat(unitPrice)))
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>
                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"invoiceLines"}
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
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => invoiceLineAppend({
                                                    product: null,
                                                    description: '',
                                                    quantity: 1,
                                                    account: null,
                                                    uom: 0,
                                                    taxes: 0,
                                                    unitPrice: 0,
                                                    subTotal: 0
                                                })} >Add a item</Button>
                                            </td>
                                        </tr>}

                                    </tbody>
                                </Table>
                            </AppContentLine>
                        </Tab>
                        <Tab eventKey="journalItems" title="JOURNAL ITEMS">
                            <AppContentLine>
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

                            </AppContentLine>

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
                            {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group> */}
                        </Col>
                        <Col sm="12" md="4">
                            <Card>
                                {/* <Card.Header as="h5">Featured</Card.Header> */}
                                <Card.Body>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>Sub Total:</Col>
                                        <Col>{formatNumber(state?.estimation?.untaxedAmount)}</Col>
                                    </Row>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>CGST:</Col>
                                        <Col>{formatNumber(state?.estimation?.tax / 2)}</Col>
                                    </Row>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>SGST:</Col>
                                        <Col>{formatNumber(state?.estimation?.tax / 2)}</Col>
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

            </AppContentBody>
        </AppContentForm>
    )
}
