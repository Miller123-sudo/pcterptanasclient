import { React, useState, useEffect, useContext } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Card, Form, Breadcrumb } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { BsArrowLeft, BsArrowRight, BsFillCreditCardFill, BsFillBarChartFill } from 'react-icons/bs';
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
import { PurchaseOrderPDF } from '../../helpers/PDF';
import AppContentLine from '../../pcterp/builder/AppContentLine';
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import AppLoader from '../../pcterp/components/AppLoader';
import AppContentHeaderPanel from '../../pcterp/builder/AppContentHeaderPanel';
import AppContentStatusPanel from '../../pcterp/builder/AppContentStatusPanel';

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
        if (isBillAmountEqualPurchaseAmount(billObj, formData)) {
            return isAddMode
                ? createDocument(formData)
                : updateDocument(id, formData);
        } else {
            infoNotification("Selected bill's total amount is must equal to purchase order's total amount")
        }
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
            //errorMessage(e, dispatch)
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




    useEffect(() => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()

            calculatePRCount();
            calculateAllPRCount();
            calculateBilledCount();
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
                                if (data.value) {
                                    const res = await ApiService.post(`/newBill/getBillByName/`, { name: data.value.name })
                                    if (res.data.isSuccess) {
                                        console.log(res?.data.document);
                                        setbillObj(res?.data.document)
                                        // setshow(true)
                                        setValue("vendor", res?.data.document.vendorArray)
                                    }
                                }
                            }}
                            onC
                            blurHandler={null}
                        />

                        <SelectField
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
                                            <th style={{ minWidth: "20rem" }}>PRODUCT</th>
                                            <th style={{ minWidth: "16rem" }}>DESCRIPTION</th>
                                            <th style={{ minWidth: "16rem" }}>UOM</th>
                                            <th style={{ minWidth: "16rem" }}>QUANTITY</th>
                                            {!isAddMode && <th style={{ minWidth: "16rem" }}>RECEIVED</th>}
                                            {!isAddMode && <th style={{ minWidth: "16rem" }}>BILLED</th>}
                                            <th style={{ minWidth: "16rem" }}>UNIT RATE</th>
                                            <th style={{ minWidth: "16rem" }}>TAXES (%)</th>
                                            <th style={{ minWidth: "16rem" }}>SUB TOTAL</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            productRemove(index)
                                                            updateOrderLines(index)
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>
                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
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
                                                        changeHandler={null}
                                                        blurHandler={async (event, data) => {
                                                            if (!data?.okay) return
                                                            const productId = data?.okay[0]?._id;
                                                            ApiService.setHeader();
                                                            ApiService.get('product/' + productId).then(response => {
                                                                const productObj = response.data.document;
                                                                if (productObj) {
                                                                    setValue(`products.${index}.name`, productObj.name);
                                                                    setValue(`products.${index}.description`, productObj.description);
                                                                    setValue(`products.${index}.unit`, productObj.uom);
                                                                    setValue(`products.${index}.quantity`, 1);
                                                                    setValue(`products.${index}.taxes`, productObj?.vendorTaxes);
                                                                    setValue(`products.${index}.unitPrice`, productObj.salesPrice);
                                                                    setValue(`products.${index}.subTotal`, (parseFloat(productObj.salesPrice) * 1));
                                                                    setValue(`products.${index}.account`, productObj.assetAccount);
                                                                    updateOrderLines(index)
                                                                }
                                                            }).catch(err => {
                                                                console.log("ERROR", err)
                                                            })
                                                        }}
                                                    />
                                                    {/* <Form.Group>
                                                        <PCTProduct control={control} name={`products.${index}.product`}
                                                            onBlur={(value) => {
                                                                if (!value || !value[0]?._id) return;
                                                                ApiService.get('product/' + value[0]?._id).then(response => {
                                                                    const productObj = response.data.document;
                                                                    if (productObj) {
                                                                        setValue(`products.${index}.brandName`, productObj.brandName);
                                                                        setValue(`products.${index}.category`, productObj.category);
                                                                        setValue(`products.${index}.kindOfLiquor`, productObj.kindOfLiquor);
                                                                        setValue(`products.${index}.kindOfLiquorCode`, productObj.kindOfLiquorCode);
                                                                        setValue(`products.${index}.name`, productObj.name);
                                                                        setValue(`products.${index}.name`, productObj.name);
                                                                        setValue(`products.${index}.label`, productObj.description);
                                                                        setValue(`products.${index}.purchaseUoM`, productObj.purchaseUoM);
                                                                        setValue(`products.${index}.bottleSize`, productObj.bottleSize);
                                                                        setValue(`products.${index}.caseQuantity`, 1);
                                                                        setValue(`products.${index}.quantity`, productObj.purchaseUoM?.slice(0, 2));
                                                                        setValue(`products.${index}.taxes`, productObj.vendorTaxes[0]);
                                                                        setValue(`products.${index}.unitPrice`, productObj.salesPrice);
                                                                        setValue(`products.${index}.netAmount`, (parseFloat(productObj.salesPrice) * parseFloat(productObj.purchaseUoM?.slice(0, 2))));
                                                                        setValue(`products.${index}.grossAmount`, (parseFloat(productObj.salesPrice) * parseFloat(productObj.purchaseUoM?.slice(0, 2))));
                                                                        updateOrderLines(index)
                                                                    }


                                                                }).catch(err => {
                                                                    console.log("ERROR", err)
                                                                })

                                                            }} />
                                                    </Form.Group> */}
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
                                                    {/* <Form.Group >
                                                        <Form.Control size='sm'
                                                            type="text"
                                                            id="label"
                                                            name="label"
                                                            {...register(`products.${index}.label`)} />
                                                    </Form.Group> */}
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
                                                            setValue(`products.${index}.subTotal`, parseFloat(netAmount));
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
                                                    {/* <Form.Group >
                                                        <Form.Control disabled size='sm'
                                                            type="number"
                                                            id="received"
                                                            name="received"
                                                            {...register(`products.${index}.received`)} />
                                                    </Form.Group> */}
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
                                                    {/* <Form.Group >
                                                        <Form.Control disabled size='sm'
                                                            type="text"
                                                            id="billed"
                                                            name="billed"
                                                            {...register(`products.${index}.billed`)} />
                                                    </Form.Group> */}
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
                                                            setValue(`products.${index}.subTotal`, (parseFloat(quantity) * parseFloat(unitPrice)))
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />
                                                    {/* <Form.Group >
                                                        <Form.Control disabled size='sm'
                                                            type="number"
                                                            id="bottleSize"
                                                            name="bottleSize"
                                                            {...register(`products.${index}.bottleSize`)} />
                                                    </Form.Group> */}
                                                </td>
                                                <td>
                                                    <LineSelectField
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
                                                    />
                                                    {/* <Form.Group>
                                                        <Form.Control
                                                            size='sm'
                                                            type="number"
                                                            id="caseQuantity"
                                                            name="caseQuantity"
                                                            {...register(`products.${index}.caseQuantity`)} onChange={(e) => {
                                                                const unitRate = getValues(`products.${index}.unitPrice`);
                                                                const purchaseUoMQuantity = getValues(`products.${index}.purchaseUoM`)?.slice(0, 2);
                                                                const actualQuantity = parseInt(e.target.value) * parseInt(purchaseUoMQuantity);
                                                                if (actualQuantity) {
                                                                    console.log(actualQuantity)
                                                                    setValue(`products.${index}.quantity`, actualQuantity);
                                                                    setValue(`products.${index}.netAmount`, parseFloat(actualQuantity) * parseFloat(unitRate));
                                                                    setValue(`products.${index}.grossAmount`, parseFloat(actualQuantity) * parseFloat(unitRate));
                                                                    updateOrderLines(index)

                                                                }
                                                            }} />

                                                    </Form.Group> */}
                                                </td>
                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"products"}
                                                        field={{
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

                </Container >

            </AppContentBody >
        </AppContentForm >
    )
}
