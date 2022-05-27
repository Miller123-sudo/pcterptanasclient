import { React, useState, useEffect, useContext } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Breadcrumb } from 'react-bootstrap'
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
import { PurchaseOrderPDF } from '../../helpers/PDF';
import AppContentLine from '../../pcterp/builder/AppContentLine';
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import AppLoader from '../../pcterp/components/AppLoader';

export default function Purchase() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [productReceiptCount, setProductReceiptCount] = useState(0);
    const [billedCount, setBilledCount] = useState(0)
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
            purchaseRep: [{ id: user?._id, name: user?.name }],
            vendor: null,
            total: 0,
            billingStatus: 'Nothing to Bill',
            date: new Date().toISOString().split("T")[0],
            receiptDate: new Date().toISOString().split("T")[0]
        }
    });

    const { append: productAppend, remove: productRemove, fields: productFields } = useFieldArray({ control, name: "operations" });



    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/productReceipt/procedure', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/receivedproducts/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/productReceipt/procedure/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/receivedproducts/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/productReceipt/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/receivedproducts/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/productReceipt/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            setValue('date', document?.date?.split("T")[0]);
            setValue('effectiveDate', document?.effectiveDate?.split("T")[0]);
            setLoderStatus("SUCCESS");

        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    // Helper Functions

    const isLessQuantityProcess = (data) => {
        if (!data) return
        let isLess = false;
        data?.forEach(el => {
            if (parseInt(el.demandQuantity) > parseInt(el.doneQuantity))
                isLess = true;
        });
        return isLess;
    }

    const isProcessAll = (data) => {
        if (!data) return
        let isProcess = true;
        data?.forEach(el => {
            if (parseInt(el.doneQuantity) !== 0) {
                isProcess = false;
            }
        });
        return isProcess;
    }

    const validateReceivedProducts = () => {

        const operations = getValues('operations');
        const isProcess = isProcessAll(operations);
        if (isProcess) {
            alert("You have not recorded done quantities yet, by clicking on Ok PCTeRP will process all the quantities.");
            // Creating Product Receipt Object.
            const productReceipt = new Object();
            const operationProcessed = new Array();
            operations.map((product, index) => {
                const operation = new Object();
                operation.productIdentifier = product.productIdentifier;
                operation.product = product.product;
                operation.name = product.name;
                operation.description = product.description;
                operation.demandQuantity = parseInt(product.demandQuantity);
                operation.doneQuantity = parseInt(product.demandQuantity);
                operationProcessed.push(operation)
            });
            productReceipt.status = "Done";
            productReceipt.isFullyReceived = true;
            productReceipt.notes = getValues('notes');
            productReceipt.vendor = state.vendor;
            productReceipt.effectiveDate = state.effectiveDate;
            productReceipt.sourceDocument = state.sourceDocument;
            productReceipt.operations = operationProcessed;
            return ApiService.patch('productReceipt/received/' + state.id, productReceipt).then(response => {
                navigate("/purchase/purchases/edit/" + state.sourceDocument.id);
            })

        }

        const isLessProcess = isLessQuantityProcess(operations);
        if (isLessProcess) {
            alert("You are process less products");
            const productReceipt = new Object();
            const operationProcessed = new Array();
            operations.map((product, index) => {
                if (parseInt(product.doneQuantity) > 0) {
                    const operation = new Object();
                    operation.productIdentifier = product.productIdentifier;
                    operation.product = product.product;
                    operation.name = product.name;
                    operation.description = product.description;
                    operation.demandQuantity = parseInt(product.doneQuantity);
                    operation.doneQuantity = parseInt(product.doneQuantity);
                    operationProcessed.push(operation)
                }
            });
            productReceipt.status = "Done";
            productReceipt.notes = getValues('notes');
            productReceipt.vendor = state.vendor;
            productReceipt.effectiveDate = state.effectiveDate;
            productReceipt.sourceDocument = state.sourceDocument;
            productReceipt.operations = operationProcessed;

            ApiService.patch('productReceipt/received/' + state.id, productReceipt).then(response => {

                const newProductReceipt = new Object();
                const operationNeedToProcess = new Array();
                operations.map((product, index) => {
                    if ((product.demandQuantity - parseInt(product.doneQuantity)) > 0) {
                        const operation = new Object();
                        operation.productIdentifier = product.productIdentifier;
                        operation.product = product.product;
                        operation.name = product.name;
                        operation.description = product.description;
                        operation.demandQuantity = product.demandQuantity - parseInt(product.doneQuantity);
                        operation.doneQuantity = 0;
                        operationNeedToProcess.push(operation)
                    }
                });
                newProductReceipt.vendor = state.vendor;
                newProductReceipt.notes = getValues('notes');
                newProductReceipt.backOrderOf = state.id;
                newProductReceipt.effectiveDate = state.effectiveDate;
                newProductReceipt.sourceDocument = state.sourceDocument;
                newProductReceipt.operations = operationNeedToProcess;

                ApiService.post('productReceipt/procedure', newProductReceipt).then(response => {

                    navigate("/purchase/purchases/edit/" + state.sourceDocument.id);
                })
            });

        } else {

            console.log("Fully Receipt");
            console.log("State", state);
            console.log("Receipt Id", id);
            console.log("Operations", operations)

            ApiService.setHeader();
            const fullProductReceipt = new Object();
            const finalOperationProcesses = new Array();
            operations.map((product, index) => {
                const operation = new Object();
                operation.productIdentifier = product.productIdentifier;
                operation.product = product.product;
                operation.name = product.name;
                operation.description = product.description;
                operation.demandQuantity = parseInt(product.doneQuantity);
                operation.doneQuantity = parseInt(product.doneQuantity);
                finalOperationProcesses.push(operation)
            });
            fullProductReceipt.status = "Done";
            fullProductReceipt.isFullyReceived = true;
            fullProductReceipt.notes = getValues('notes');
            fullProductReceipt.vendor = state.vendor;
            fullProductReceipt.effectiveDate = state.effectiveDate;
            fullProductReceipt.sourceDocument = state.sourceDocument;
            fullProductReceipt.operations = finalOperationProcesses;

            console.log("Before", fullProductReceipt)

            ApiService.patch('productReceipt/received/' + id, fullProductReceipt).then(async response => {
                if (response.data.isSuccess) {
                    console.log("After", response.data.document)
                    navigate("/purchase/purchases/edit/" + state.sourceDocument.id);
                }
            });
        }
    }





    const handleVendorBill = async () => {
        navigate(`/${rootPath}/purchases/billed/` + state.id);
    }

    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generateProductReceivedPDF(state.id);
        return;
    }


    const updateOrderLines = (index) => {
        let cumulativeSum = 0, cgstSum = 0, sgstSum = 0, igstSum = 0;
        const products = getValues('products')
        products?.map((val) => {
            console.log(val.product);
            if (val.taxes !== 0 && val.netAmount) {
                cumulativeSum += parseFloat(val.netAmount);
                cgstSum += parseFloat(((val.taxes) / 2 * val.netAmount) / 100);
                sgstSum += parseFloat(((val.taxes) / 2 * val.netAmount) / 100);
                igstSum += parseFloat(((val.taxes) * val.netAmount) / 100);
            }
        });

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            cgst: cgstSum,
            sgst: sgstSum,
            igst: igstSum,
            total: parseFloat(cumulativeSum + igstSum)
        });


    }


    useEffect(() => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()
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
                                <Breadcrumb.Item style={{ color: "black !important" }} linkAs={Link} linkProps={{ to: `/${rootPath}/purchases/list` }}><span className='breadcrum-label'>PURCHASE ORDERS</span></Breadcrumb.Item>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/${rootPath}/purchases/edit/${state?.sourceDocument?.id}` }}><span className='breadcrum-label'>{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {state?.status == "Ready" && <Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/purchases/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && state?.status == "Ready" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>


            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}
                <Row className="p-0 mt-2 m-0">
                    <Col>
                        <ButtonGroup size="sm">
                            {state?.status == "Ready" && <Button onClick={validateReceivedProducts} variant="primary">RECEIVE</Button>}
                            {/* {state.status == "Ready" && <Button variant="primary">SET QUANTITIES</Button>} */}
                            {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">UNLOCK</Button> */}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT RECEIVE</Button>}
                        </ButtonGroup>

                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>
                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
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
                                description: "Source Document",
                                label: "Source Document",
                                fieldId: "sourceDocument.name",
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
                                description: "Receive From",
                                label: "Receive From",
                                fieldId: "vendor",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
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
                                description: "Effective Date.",
                                label: "Date",
                                fieldId: "effectiveDate",
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
                                disabled: true,
                                description: "Back Order of",
                                label: "Back Order of",
                                fieldId: "backOrderOf.name",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />


                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Notes",
                                label: "Notes",
                                fieldId: "notes",
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
                        <Tab eventKey="products" title="Products">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}></th>

                                            <th style={{ minWidth: "20rem" }}>Product</th>
                                            <th style={{ minWidth: "16rem" }}>Description</th>
                                            <th style={{ minWidth: "16rem" }}>Ordered Quantity</th>
                                            <th style={{ minWidth: "16rem" }}>Received Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productFields.map((field, index) => {
                                            return (<tr key={field.id}>

                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
                                                <td>
                                                    <LineSelectField
                                                        control={control}
                                                        model={"operations"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "product",
                                                            placeholder: "",
                                                            selectRecordType: "product",
                                                            multiple: false
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={null}
                                                        blurHandler={null}
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
                                                        model={"operations"}
                                                        field={{
                                                            disabled: true,
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
                                                    <LineNumberField
                                                        register={register}
                                                        model={"operations"}
                                                        field={{
                                                            disabled: true,
                                                            fieldId: "demandQuantity",
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
                                                        model={"operations"}
                                                        field={{
                                                            fieldId: "doneQuantity",
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

                            </AppContentLine>
                            <Container className="mt-2" fluid>

                            </Container>
                        </Tab>
                        {!isAddMode && <Tab eventKey="auditTrail" title="Audit Trail">
                            <Container className="mt-2" fluid>
                                {!isAddMode && <LogHistories documentPath={"purchaseOrder"} documentId={id} />}
                            </Container>
                        </Tab>}


                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
