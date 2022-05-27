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
import { PurchaseOrderPDF } from '../../helpers/PDF';
import AppContentLine from '../../pcterp/builder/AppContentLine';
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import AppLoader from '../../pcterp/components/AppLoader';
import AppContentHeaderPanel from '../../pcterp/builder/AppContentHeaderPanel';
import AppContentStatusPanel from '../../pcterp/builder/AppContentStatusPanel';

export default function InventoryAdjustment() {
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

    const { append: productAppend, remove: productRemove, fields: productFields } = useFieldArray({ control, name: "products" });
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

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/inventoryAdjustment', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/inventoryadjustment/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/inventoryAdjustment/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/inventoryadjustment/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/inventoryAdjustment/${id}`).then(response => {
            if (response.status === 204) {
                navigate(`/${rootPath}/inventoryadjustment/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/inventoryAdjustment/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            setValue('date', document?.date?.split("T")[0]);
            setValue('receiptDate', document?.receiptDate?.split("T")[0]);
            setLoderStatus("SUCCESS");

        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    const updateOrderLines = (index) => {
        let cumulativeSum = 0, totalTax = 0;
        const products = getValues('products')
        console.log(products);
        products?.map((val) => {
            cumulativeSum += parseFloat(val.subTotal);
            //totalTax += (parseFloat(val.taxes[0]) * parseFloat(val.subTotal)) / 100
        });

        setValue("total", parseFloat(Math.abs(cumulativeSum)))


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
        const billResponse = await ApiService.get('bill/searchByPO/' + id);
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

    let grandtot = 0;


    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/inventoryadjustment/list` }}>   <div className='breadcrum-label'>INVENTORY ADJUSTMENTS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {isAddMode && <Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/inventoryadjustment/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}


                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: true,
                                description: "Adjustment Id#",
                                label: "ADJUSTMENT ID",
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
                                description: "Inventory Adjustment Account.",
                                label: "INVENTORY ADJUSTMENT ACCOUNT",
                                fieldId: "inventoryAdjustmentAccount",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please select the Account!",
                                selectRecordType: "account",
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
                                description: "Date of Adjustment.",
                                label: "DATE",
                                fieldId: "date",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <Decimal128Field
                            disabled={true}
                            register={register}
                            errors={errors}
                            field={{
                                disabled: true,
                                description: "Estimated total amount",
                                label: "ESTIMATED TOTAL",
                                fieldId: "total",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Product name!"
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
                                            <th style={{ minWidth: "16rem" }}>QUANTITY</th>
                                            <th style={{ minWidth: "16rem" }}>UNIT RATE</th>
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
                                                                    // setValue(`products.${index}.unit`, productObj.uom);
                                                                    setValue(`products.${index}.quantity`, 1);
                                                                    //setValue(`products.${index}.taxes`, productObj?.vendorTaxes);
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
                                                            setValue(`products.${index}.subTotal`, parseFloat(Math.abs(netAmount)));
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
                                                            fieldId: "unitPrice",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {
                                                            console.log(event, data)
                                                            let unitPrice = data?.value;
                                                            let quantity = getValues(`products.${index}.quantity`);
                                                            //let taxes = getValues(`products.${index}.taxes`);
                                                            //let taxAmount = ((parseFloat(unitPrice) * parseFloat(quantity)) * parseFloat(taxes[0])) / 100;
                                                            let netAmount = (parseFloat(quantity) * parseFloat(unitPrice));
                                                            setValue(`products.${index}.subTotal`, parseFloat(Math.abs(netAmount)));
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
                                                    unitPrice: 0,
                                                    subTotal: 0
                                                })} >Add a product</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>

                            </AppContentLine>

                        </Tab>

                        {!isAddMode && <Tab eventKey="journalItems" title="JOURNAL ITEMS">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "20rem" }}>ACCOUNT</th>
                                            <th style={{ minWidth: "16rem" }}>LABEL</th>
                                            <th style={{ minWidth: "16rem" }}>DEBIT</th>
                                            <th style={{ minWidth: "16rem" }}>CREDIT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {journalItemFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
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
                                                        changeHandler={async (e) => {
                                                            const product = await ApiService.get('product/' + e.target.value);
                                                            setValue(`products.${index}.account`, product.data.document.expenseAccount);
                                                            setValue(`products.${index}.quantity`, 1);
                                                            setValue(`products.${index}.description`, product.data.document.description);
                                                            setValue(`products.${index}.unitPrice`, product.data.document.cost);

                                                            const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                            setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));

                                                            let cumulativeSum = 0;

                                                            const vals = getValues('products')
                                                            console.log(vals);
                                                            vals.map((val) => {
                                                                cumulativeSum += parseFloat(val.subTotal);
                                                            })
                                                            setValue("total", cumulativeSum);
                                                            setState(prevState => ({
                                                                // object that we want to update
                                                                ...prevState,    // keep all other key-value pairs
                                                                total: cumulativeSum       // update the value of specific key

                                                            }));

                                                        }}
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
                                                    <LineNumberField
                                                        register={register}
                                                        model={"journalItems"}
                                                        field={{
                                                            fieldId: "debit",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        blurHandler={null}

                                                    />
                                                </td>

                                                <td>
                                                    <LineDecimal128Field
                                                        register={register}
                                                        model={"journalItems"}
                                                        field={{
                                                            fieldId: "credit",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        blurHandler={null}
                                                        changeHandler={null}
                                                    />
                                                </td>


                                            </tr>
                                            )
                                        })}
                                        <tr>
                                            <td colSpan="14">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => productAppend({
                                                    account: null,
                                                    label: '',
                                                    debit: 1,
                                                    credit: 0,
                                                })} >Add a product</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>

                            </AppContentLine>

                        </Tab>}
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
