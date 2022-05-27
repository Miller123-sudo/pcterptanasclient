import { React, useState, useEffect, useContext } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Card, Form, Breadcrumb } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { BsArrowLeft, BsArrowRight, BsFillCreditCardFill, BsFillBarChartFill } from 'react-icons/bs';
import ApiService from '../../helpers/ApiServices'
import { errorMessage } from '../../helpers/Utils'
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
import { PurchaseOrderPDF, SalesOrderPDF } from '../../helpers/PDF';
import AppContentLine from '../../pcterp/builder/AppContentLine';
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import AppLoader from '../../pcterp/components/AppLoader';

export default function SalesOrder() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [productDeliveryCount, setProductDeliveryCount] = useState(0);
    const [invoicedCount, setInvoicedCount] = useState(0);
    const { user } = useContext(UserContext)
    const [allProductReceiptCount, setAllProductReceiptCount] = useState([])
    const [state, setState] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();



    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            salesRep: [{ id: user?._id, name: user?.name }],
            vendor: null,
            total: 0,
            invoiceStatus: 'Nothing to Invoice',
            date: new Date().toISOString().split("T")[0],
            deliveryDate: new Date().toISOString().split("T")[0]
        }
    });

    const { append: productAppend, remove: productRemove, fields: productFields } = useFieldArray({ control, name: "products" });


    let totalSalesQuantity = 0;
    let totalInvoicedQuantity = 0;
    let totalDeliveredQuantity = 0;
    let totalDelivered = 0;
    let totalInvoiced = 0;

    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {


        ApiService.setHeader();
        return ApiService.post('/salesOrder/procedure', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/salesorders/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/salesOrder/procedure/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/salesorders/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/salesOrder/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/salesorders/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/salesOrder/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            setValue('date', document?.date?.split("T")[0]);
            setValue('deliveryDate', document?.deliveryDate?.split("T")[0]);
            setLoderStatus("SUCCESS");

        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    // Helper Functions
    const handleDeliveryProducts = async () => {
        if (state?.productDelivery) {
            navigate("/sales/productdeliveries/edit/" + state.productDelivery);
        } else {
            const response = await ApiService.post(`/productDelivery/procedure/${state?._id}`)
            if (response.data.isSuccess) {
                navigate("/sales/productdeliveries/edit/" + response.data.document._id);
            }
        }
    }

    const openDeliveredProduct = () => {
        navigate("/sales/delivered/" + state.id);
    }

    const handleCustomerInvoice = async () => {
        navigate("/sales/invoices/invoiced/" + state.id);
    }

    const handleCreateProductDelivery = async () => {
        navigate("/sales/delivery/" + state.productDelivery);
    }

    const handlePrintOrder = async () => {
        console.log(state._id)
        SalesOrderPDF.generateSalesOrderPDF(state._id);
        return;
    }

    const handleReceiveProducts = () => {
        if (state.productReceipt) {
            navigate("/purchase/receivedproducts/edit/" + state.productReceipt);
        } else {
            const products = getValues('products')
            console.log(products);

            const newProductReceipt = new Object();
            const operationNeedToProcess = new Array();
            products.map((product, index) => {
                if ((product.quantity - parseInt(product.received)) > 0) {
                    const operation = new Object();
                    operation.productIdentifier = product.productIdentifier;
                    operation.product = product.product[0].id;
                    operation.name = product.product[0].name;
                    operation.description = product.label;
                    operation.demandQuantity = parseInt(product.quantity) - parseInt(product.received);
                    operation.doneQuantity = 0;
                    operationNeedToProcess.push(operation)
                }
            });
            newProductReceipt.vendor = state.vendor[0].id;
            // newProductReceipt.notes = getValues('notes');
            newProductReceipt.backOrderOf = state.id;
            newProductReceipt.effectiveDate = new Date().toISOString().split("T")[0];
            newProductReceipt.sourceDocument = state.id;
            newProductReceipt.operations = operationNeedToProcess;

            ApiService.post('productReceipt/procedure', newProductReceipt).then(response => {

                navigate("/purchase/receivedproducts/edit/" + response.data.document.id);
            })
        }

    }


    const handleCreateInvoice = async () => {
        state?.products?.map(e => {
            totalDelivered += parseInt(e.delivered)
            totalInvoiced += parseInt(e.invoiced)
        })
        if (totalDelivered === totalInvoiced) {
            console.log("Please Delivered product first!!!")
        } else {
            try {
                const response = await ApiService.post('invoice', { sourceDocument: state.id })
                if (response.data.isSuccess) {
                    //
                    const res = await ApiService.patch('salesOrder/decreseProductOnhandAndAvailabel/' + response.data.document._id, response.data.document)
                    if (res.data.isSuccess) {
                        const PO = await ApiService.get('salesOrder/' + state.id);
                        console.log(PO);
                        PO.data.document?.products?.map(e => {
                            console.log(e);
                            totalSalesQuantity += parseInt(e.quantity);
                            totalInvoicedQuantity += parseInt(e.invoiced);
                            totalDeliveredQuantity += parseInt(e.delivered);
                        })
                        console.log("totalSalesQuantity: ", totalSalesQuantity);
                        console.log("totalInvoicedQuantity: ", totalInvoicedQuantity);
                        console.log("totalDeliveredQuantity: ", totalDeliveredQuantity);

                        if (totalSalesQuantity === totalDeliveredQuantity && totalSalesQuantity === totalInvoicedQuantity) {
                            await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Invoiced' }).then(async res => {
                                if (res.data.isSuccess) {
                                    // await ApiService.patch('salesOrder/decreseProductOnhandAndAvailabel/' + res.data.document._id, res.data.document).then(r => {
                                    //     if (r.data.isSuccess) {
                                    navigate(`/${rootPath}/invoices/edit/` + response.data.document.id);
                                    //     }
                                    // })
                                }
                            }).catch(e => {
                                console.log(e.response?.data.message);
                                // errorMessage(e, dispatch)
                            });
                        } else if (totalSalesQuantity === totalInvoicedQuantity) {
                            await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Delivered / Partially Invoiced' })
                        } else {
                            await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Partially Delivered / Invoiced' })
                        }
                        // await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
                        navigate(`/${rootPath}/invoices/edit/` + response.data.document.id);
                    } else {
                        console.log("something wrong in calculating product onhand qty!!!")
                    }
                    //

                    // const PO = await ApiService.get('salesOrder/' + state.id);
                    // console.log(PO);
                    // PO.data.document?.products?.map(e => {
                    //     console.log(e);
                    //     totalSalesQuantity += parseInt(e.quantity);
                    //     totalInvoicedQuantity += parseInt(e.invoiced);
                    //     totalDeliveredQuantity += parseInt(e.delivered);
                    // })
                    // console.log("totalSalesQuantity: ", totalSalesQuantity);
                    // console.log("totalInvoicedQuantity: ", totalInvoicedQuantity);
                    // console.log("totalDeliveredQuantity: ", totalDeliveredQuantity);

                    // if (totalSalesQuantity === totalDeliveredQuantity && totalSalesQuantity === totalInvoicedQuantity) {
                    //     await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Invoiced' }).then(async res => {
                    //         if (res.data.isSuccess) {
                    //             // await ApiService.patch('salesOrder/decreseProductOnhandAndAvailabel/' + res.data.document._id, res.data.document).then(r => {
                    //             //     if (r.data.isSuccess) {
                    //             history.push("/sales/invoice/" + response.data.document.id);
                    //             //     }
                    //             // })
                    //         }
                    //     })

                    // } else if (totalSalesQuantity === totalInvoicedQuantity) {
                    //     await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Delivered / Partially Invoiced' })
                    // } else {
                    //     await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Partially Delivered / Invoiced' })
                    // }

                    // // await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
                    // history.push("/sales/invoice/" + response.data.document.id);
                }
            } catch (e) {
                console.log(e.response?.data.message);
                // errorMessage(e, dispatch)
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
            cumulativeSum += parseFloat(val.subTotal);
            totalTax += (parseFloat(val.taxes[0]) * parseFloat(val.subTotal)) / 100
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
        }));
    }

    const calculatePDCount = async () => {
        const productDeliveryResponse = await ApiService.get('productDelivery/searchBySO/' + id);
        if (productDeliveryResponse.data.isSuccess) {
            setProductDeliveryCount(productDeliveryResponse.data.results);
        }

    }

    const calculateAllPRCount = async () => {
        ApiService.setHeader();
        const AllproductReceiptResponse = await ApiService.get('productReceipt/searchAllPRByPO/' + id);
        if (AllproductReceiptResponse.data.isSuccess) {
            setAllProductReceiptCount(AllproductReceiptResponse.data.results)
        }
    }

    const calculateInvoiceCount = async () => {
        const invoiceResponse = await ApiService.get('invoice/searchBySO/' + id);
        if (invoiceResponse.data.isSuccess) {
            setInvoicedCount(invoiceResponse.data.results)
        }
    }


    console.log(state?.estimation);


    useEffect(() => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()

            calculatePDCount();

            calculateInvoiceCount()
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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/salesorders/list` }}>   <div className='breadcrum-label'>SALES ORDERS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {(isAddMode || state?.invoiceStatus == "Nothing to Invoice" || state?.invoiceStatus == "Partially Delivered / Invoiced") && <Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/salesorders/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && state?.invoiceStatus == "Nothing to Invoice" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
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
                            {!isAddMode && !state?.isFullyDelivered ? <Button variant="primary" onClick={handleDeliveryProducts}>DELIVERY PRODUCTS</Button> : ""}
                            {!isAddMode && state?.invoiceStatus !== "Fully Invoiced" ? <Button onClick={handleCreateInvoice} variant="primary">CREATE INVOICE</Button> : ""}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                            {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">LOCK</Button> */}
                        </ButtonGroup>
                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && invoicedCount > 0 ? <Button size="sm" onClick={handleCustomerInvoice} varient="primary">{invoicedCount} CUSTOMER INVOICES</Button> : ""}
                            {!isAddMode && productDeliveryCount > 0 ? <Button size="sm" onClick={openDeliveredProduct} varient="primary">{productDeliveryCount} DELIVERIES</Button> : ""}
                        </div>
                        <div className="me-1 d-flex justify-content-end">
                            {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.invoiceStatus}</div>}
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
                                description: "Sales Order Id#",
                                label: "SALES ORDER",
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
                                description: "Customer",
                                label: "CUSTOMER",
                                fieldId: "customer",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "customer",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={async (event, data) => {

                                if (!data?.value) return;

                                ApiService.setHeader();
                                const response = await ApiService.get('customer/' + data?.value[0]?.id)
                                if (response.data.isSuccess) {
                                    const address = response.data?.document?.address;
                                    setValue("shippingAddress", address)
                                    setValue("billingAddress", address)
                                }

                                console.log(response)

                            }}
                        />

                        <DateField
                            disabled={true}
                            register={register}
                            errors={errors}
                            field={{
                                description: "Date of Sales Order Creation.",
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
                                description: "Expected Delivery date.",
                                label: "DELIVERY DATE",
                                fieldId: "deliveryDate",
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
                                description: "Sales Representative",
                                label: "SALES REPRESENTATIVE",
                                fieldId: "salesRep",
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

                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "BILLING ADDRESS",
                                fieldId: "billingAddress",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "SHIPPING ADDRESS",
                                fieldId: "shippingAddress",
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
                                            {!isAddMode && <th style={{ minWidth: "16rem" }}>DELIVERED</th>}
                                            {!isAddMode && <th style={{ minWidth: "16rem" }}>INVOICED</th>}
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


                                                        }
                                                        }
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
                                                </td>
                                                {!isAddMode && <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"products"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "delivered",
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
                                                            fieldId: "invoiced",
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
                                                            setValue(`products.${index}.subTotal`, (parseFloat(quantity) * parseFloat(unitPrice)))
                                                            updateOrderLines(index)
                                                        }}
                                                        blurHandler={null}
                                                    />
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
                                                    delivered: 0,
                                                    invoiced: 0,
                                                    taxes: 0,
                                                    unitPrice: 0,
                                                    subTotal: 0
                                                })} >Add a product</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>

                            </AppContentLine>
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
                                                    <Col><input step="0.001"
                                                        type="number" readOnly style={{ border: "none", backgroundColor: 'transparent', resize: 'none', outline: "none" }} id='untaxedAmount' name="untaxedAmount"   {...register(`estimation.untaxedAmount`)} /></Col>
                                                </Row>
                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>TAX:</Col>
                                                    <Col>
                                                        <input step="0.001"
                                                            type="number" readOnly style={{ border: "none", backgroundColor: 'transparent', resize: 'none', outline: "none" }} id='tax' name="tax"   {...register(`estimation.tax`)} /></Col>
                                                </Row>

                                                <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                    <Col>TOTAL:</Col>
                                                    <Col style={{ borderTop: '1px solid black' }}>
                                                        <input step="0.001"
                                                            type="number" readOnly style={{ border: "none", backgroundColor: 'transparent', resize: 'none', outline: "none" }} id='subTotal' name="subTotal"   {...register(`estimation.total`)} /></Col>
                                                </Row>


                                            </Card.Body>
                                        </Card>

                                    </Col>
                                </Row>
                            </Container>
                        </Tab>
                        {/* {!isAddMode && <Tab eventKey="auditTrail" title="Audit Trail">
                            <Container className="mt-2" fluid>
                                {!isAddMode && <LogHistories documentPath={"purchaseOrder"} documentId={id} />}
                            </Container>
                        </Tab>} */}


                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
