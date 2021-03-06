
import { React, useState, useEffect } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Breadcrumb, Card, Spinner } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { PurchaseOrderPDF, SalesOrderPDF } from '../../helpers/PDF';
import InputGroupWithButton from '../../pcterp/field/InputGroupWithButton';

export default function Invoice() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [isspin, setisspin] = useState(false)
    const [customerData, setcustomerData] = useState()
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

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();

    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });



    // Functions

    const onSubmit = (formData) => {
        setisspin(true)
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        if (state?.paymentStatus === "Paid") {
            alert("You can't Update this record")
        } else {
            ApiService.setHeader();
            return ApiService.post('/invoice/createStandaloneInv', data).then(response => {
                if (response.data.isSuccess) {
                    setisspin(false)
                    navigate(`/${rootPath}/invoices/list`)
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
            return ApiService.patch(`/invoice/updateStandaloneInv/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    navigate(`/${rootPath}/invoices/list`)
                }
            }).catch(e => {
                console.log(e);
            })
        }

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/invoice/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/invoices/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/invoice/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            if (document.invoiceDate) {
                setValue('invoiceDate', document.invoiceDate.split("T")[0])
            }
            setLoderStatus("SUCCESS");
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    const handleConfirmButton = async () => {
        console.log(state)
        try {
            const response = await ApiService.patch('invoice/' + state._id, { status: "Posted", recepientAccount: getValues("recepientAccount"), referenceNumber: getValues("referenceNumber") });
            console.log(response)
            if (response.data.isSuccess) {
                const itemReceipt = response.data.document;
                setState(itemReceipt)
                reset(itemReceipt);
                if (itemReceipt.billDate) {
                    setValue('invoiceDate', itemReceipt.invoiceDate.split("T")[0]);
                }
            }
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        }
    }

    const handleRegisterPaymentButton = async () => {
        // setShowRegisterPaymentModal(true);
        // history.push("/purchase/billpayment/" + state.id);
        await ApiService.post("/invoicePayment", state).then((res) => {
            if (res.data.isSuccess) {
                console.log(res.data.document.id);
                // navigate('/purchase/billpayment/edit/' + res.data.document.id)
                navigate(`/${rootPath}/customerpayments/edit/${res.data.document.id}`)
            }
        });
    }

    // handle Print
    const handlePrintOrder = async () => {
        SalesOrderPDF.generateInvoicePdDF(state.id);
        return;
    }

    const handleBillPayment = () => {
        navigate(`/purchase/bill/billpayments/${state?._id}`)
    }


    const calculateBillCount = async () => {
        ApiService.setHeader();
        const allBills = await ApiService.get(`billPayment/findBillsById/${id}`)
        if (allBills.data.isSuccess) {
            console.log(allBills?.data.documents);
            setbillList(allBills?.data.documents)
        }
    }

    const updateOrderLines = (index) => {
        let cumulativeSum = 0, totalTax = 0;
        const products = getValues('invoiceLines')
        console.log(products);
        products?.map((val) => {
            cumulativeSum += parseFloat(val?.subTotal);
            totalTax += (parseFloat(val?.taxes) * parseFloat(val?.subTotal)) / 100
        });

        console.log("totalTax: ", totalTax);
        console.log("cumulativeSum: ", cumulativeSum);
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
        }))
    }

    const formatLineProductField = (data) => {
        let array = new Array()
        let obj = new Object()

        obj._id = data._id
        obj.name = data.name
        array.push(obj)

        return array
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
                <Row>
                    <Col className='p-0 ps-2'>
                        <Breadcrumb style={{ fontSize: '24px', marginLeft: 15 }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: `/${rootPath}/invoices` }} ><div className='breadcrum-label'>INVOICES</div></Breadcrumb.Item>
                            {/* {!isAddMode &&
                                state?.sourceDocument ? <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/accounting/customerinvoices/edit/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item> :
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/accounting/customerinvoices/edit/${state?.attachedPO?._id}?mode=view` }} ><span className="breadcrum-label">{state?.attachedPO?.name}</span></Breadcrumb.Item>
                            } */}
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state?.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ marginLeft: 8 }}>
                        {isAddMode || state?.status == "Draft" ? <Button type="submit" variant="primary" size="sm" disabled={isspin ? true : false}>
                            {isspin && <Spinner
                                as="span"
                                animation="grow"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />}
                            SAVE
                        </Button> : ""}
                        {/* <Button as={Link} to={state?.attachedPO ? `/accounting/customerinvoices/${state?.attachedPO?._id}` : `/${rootPath}/customerinvoices`} variant="light" size="sm">DISCARD</Button> */}
                        <Button as={Link} to={rootPath == "sales" ? `/${rootPath}/invoices` : `/${rootPath}/customerinvoices`} variant="light" size="sm">DISCARD</Button>
                        {!isAddMode && state?.status === "Draft" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                            <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                        </DropdownButton>}

                    </Col>
                </Row>

            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}

                <Row className="p-0 mt-2 m-0">
                    <Col>
                        <ButtonGroup size="sm">

                            {state?.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                            {state?.status == "Posted" && state?.paymentStatus == "Not Paid" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT INVOICE</Button>}
                        </ButtonGroup>
                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>
                        {/* <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> */}
                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
                        </div>
                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.paymentStatus}</div>}
                        </div>
                    </Col>
                </Row>


                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        {/* <TextField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: true,
                                description: "",
                                label: "Source Document",
                                fieldId: "sourceDocument.name",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}
                        {/* <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Source Document",
                                fieldId: "sourceDocument",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "salesOrder"

                            }}
                            changeHandler={async (e, rest) => {
                                console.log(e);
                                if (e[0]._id) {
                                    const res = await ApiService.get('salesOrder/' + e[0]._id)
                                    if (res.data.isSuccess) {
                                        console.log(res.data.document.estimation);
                                        reset(res.data.document)
                                        setValue("invoiceLines", res.data.document.products)
                                        updateOrderLines()
                                        setValue("sourceDocument", e)
                                    }
                                }
                            }}
                            blurHandler={null}
                        /> */}

                        {/* <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Customer",
                                fieldId: "customer",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter customer name!",
                                selectRecordType: "customer"

                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}

                        <InputGroupWithButton
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "CUSTOMER",
                                fieldId: "customer",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "customer",
                                createRecordType: "customer",
                                isVisible: isAddMode ? true : false,
                                disabled: isAddMode ? false : true
                            }}
                            changeHandler={async (e, data) => {
                                console.log(data.value);
                                console.log(e);

                                const customer = await ApiService.get("customer/" + data.value._id)
                                if (customer.data.isSuccess) {
                                    console.log(customer.data.document);
                                    setcustomerData(customer.data.document)

                                } else {
                                    return
                                }
                            }}
                            blurHandler={null}
                        />

                        <DateField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "INVOICE DATE",
                                fieldId: "invoiceDate",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the invoice's created date!"
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
                                fieldId: "recepientAccount",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "account",
                                multiple: false
                            }}
                            changeHandler={null}
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
                        <Tab eventKey="invoiceLines" title="Invoice Lines">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "2rem" }}>#</th>
                                            <th style={{ minWidth: "20rem" }}>BARCODE</th>
                                            <th style={{ minWidth: "20rem" }}>PRODUCT</th>
                                            <th style={{ minWidth: "16rem" }}>DESCRIPTION</th>
                                            <th style={{ minWidth: "16rem" }}>UoM</th>
                                            <th style={{ minWidth: "16rem" }}>HSN</th>
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
                                                <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            invoiceLineRemove(index)
                                                            updateOrderLines(index)
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>
                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "barcode",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={(e, data) => {
                                                            setValue(`invoiceLines.${index}.name`, "");
                                                            setValue(`invoiceLines.${index}.product`, [{ _id: "", name: "" }]);
                                                            setValue(`invoiceLines.${index}.description`, "");
                                                            setValue(`invoiceLines.${index}.unit`, [{ _id: "", name: "" }]);
                                                            setValue(`invoiceLines.${index}.quantity`, 0);
                                                            setValue(`invoiceLines.${index}.taxes`, "");
                                                            setValue(`invoiceLines.${index}.unitPrice`, 0.00);
                                                            setValue(`invoiceLines.${index}.mrp`, "");
                                                            setValue(`invoiceLines.${index}.subTotal`, "");
                                                            setValue(`invoiceLines.${index}.account`, "");
                                                            setValue(`invoiceLines.${index}.index`, "");
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
                                                                    setValue(`invoiceLines.${index}.name`, productObj.name);
                                                                    setValue(`invoiceLines.${index}.product`, prod);
                                                                    setValue(`invoiceLines.${index}.description`, productObj.description);
                                                                    setValue(`invoiceLines.${index}.unit`, productObj.uom);
                                                                    setValue(`invoiceLines.${index}.quantity`, 1);
                                                                    setValue(`invoiceLines.${index}.taxes`, productObj?.igstRate);
                                                                    setValue(`invoiceLines.${index}.unitPrice`, productObj.cost);
                                                                    // setValue(`invoiceLines.${index}.mrp`, productObj.salesPrice);
                                                                    setValue(`invoiceLines.${index}.subTotal`, (parseFloat(productObj.cost) * 1).toFixed(2));
                                                                    setValue(`invoiceLines.${index}.account`, productObj.assetAccount);
                                                                    setValue(`invoiceLines.${index}.index`, index);
                                                                    updateOrderLines(index)
                                                                } else {
                                                                }
                                                            }).catch(err => {
                                                                /** If there is no product with that barcode show notification and set barcode and product field to blank */
                                                                infoNotification("No product with that barcode")
                                                                setValue(`invoiceLines.${index}.barcode`, "")
                                                                setValue(`invoiceLines.${index}.product`, [{ name: "" }])
                                                                console.log("ERROR", err)
                                                            })
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <LineSelectField
                                                        control={control}
                                                        model={"invoiceLines"}
                                                        field={{

                                                            fieldId: "product",
                                                            placeholder: "",
                                                            selectRecordType: "product",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={async (e, rest) => {
                                                            console.log(e);
                                                            console.log(rest);
                                                            if (rest.okay == null) return

                                                            if (rest.okay[0]?._id) {
                                                                let quantity = getValues(`invoiceLines.${index}.quantity`);
                                                                let unitPrice = getValues(`invoiceLines.${index}.unitPrice`);
                                                                console.log(getValues(`invoiceLines.${index}.unitPrice`));

                                                                const productDoc = await ApiService.get(`product/${rest.okay[0]._id}`)
                                                                console.log(productDoc.data);
                                                                if (productDoc.data.isSuccess) {
                                                                    setValue(`invoiceLines.${index}.label`, productDoc.data.document?.description)
                                                                    setValue(`invoiceLines.${index}.unit`, productDoc.data.document?.uom)
                                                                    setValue(`invoiceLines.${index}.account`, productDoc.data.document?.assetAccount)
                                                                    setValue(`invoiceLines.${index}.unitPrice`, productDoc.data.document?.salesPrice)
                                                                    setValue(`invoiceLines.${index}.hsn`, productDoc.data.document?.HSNSACS)
                                                                    setValue(`invoiceLines.${index}.taxes`, productDoc.data.document?.igstRate)
                                                                    setValue(`invoiceLines.${index}.subTotal`, (parseFloat(productDoc.data.document?.salesPrice)) * 1)
                                                                    // Calculate amount
                                                                    updateOrderLines(index)
                                                                }
                                                            } else {
                                                                return
                                                            }
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

                                                </td>

                                                <td>
                                                    <LineTextField
                                                        register={register}
                                                        model={"invoiceLines"}
                                                        field={{
                                                            fieldId: "hsn",
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

                                                            fieldId: "account",
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
                                                            disabled: false,
                                                            fieldId: "unitPrice",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={(e) => {
                                                            let qty = getValues(`invoiceLines.${index}.quantity`);
                                                            let unitPrice = getValues(`invoiceLines.${index}.unitPrice`);
                                                            let netAmount = (parseFloat(qty) * parseFloat(unitPrice));
                                                            setValue(`invoiceLines.${index}.subTotal`, parseFloat(netAmount));
                                                            updateOrderLines(index)
                                                        }}
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
                                                            fieldId: "subTotal",
                                                            placeholder: "",
                                                            disabled: true
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
                                        <tr>
                                            <td colSpan="14">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => invoiceLineAppend({
                                                    product: null,
                                                    description: '',
                                                    quantity: 1,
                                                    taxes: 0,
                                                    unitPrice: 0,
                                                    subTotal: 0
                                                })} >Add a product</Button>
                                            </td>
                                        </tr>

                                    </tbody>
                                </Table>

                            </AppContentLine>

                        </Tab>

                        <Tab eventKey="journalItems" title="Journal Items">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "20rem" }}>Account</th>
                                            <th style={{ minWidth: "16rem" }}>Label</th>
                                            <th style={{ minWidth: "16rem" }}>Debit</th>
                                            <th style={{ minWidth: "16rem" }}>Credit</th>
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

                                                            fieldId: "account",
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

                <Container className="mt-4 mb-4" fluid>
                    <Row style={{ display: "flex", justifyContent: "flex-end" }}>
                        {/* <Col sm="12" md="4" >
                            <Card style={{ marginTop: -4 }}>
                                <Card.Body>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>SubTotal:</Col>
                                        <Col>{state?.estimation?.untaxedAmount}</Col>
                                    </Row>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>CGST:</Col>
                                        <Col>{state?.estimation?.tax}</Col>
                                    </Row>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>Total:</Col>
                                        <Col style={{ borderTop: '1px solid black' }}>{state?.estimation?.total}</Col>
                                    </Row>


                                </Card.Body>
                            </Card>

                        </Col> */}
                        <Col sm="12" md="4">
                            <Card>
                                {/* <Card.Header as="h5">Featured</Card.Header> */}
                                <Card.Body>
                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>GROSS TOTAL:</Col>
                                        <Col>{formatNumber(state?.estimation?.untaxedAmount)}</Col>
                                    </Row>
                                    {/* <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                        <Col>FREIGHT COST:</Col>
                                        <Col>
                                            {
                                                !isAddMode ? <Col>{formatNumber(state?.estimation?.fredgeCost)}</Col> :
                                                    <input step="0.001" type="number" id='fredgeCost' name="fredgeCost" {...register(`fredgeCost`)} style={{ border: "none", backgroundColor: 'transparent', outline: "none", borderBottom: "1px solid black" }}
                                                        onBlur={fredgeCostCalculation}
                                                    />
                                            }
                                        </Col>
                                    </Row> */}

                                    {
                                        customerData?.isLocal ?
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
                                            :
                                            <div>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>IGST:</Col>
                                                    <Col>{formatNumber(state?.estimation?.tax)}</Col>
                                                </Row>
                                            </div>
                                    }

                                    <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
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
