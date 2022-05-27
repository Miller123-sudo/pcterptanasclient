import { React, useState, useEffect, useContext } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tabs, Tab, Breadcrumb, Table } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { BsTrash } from 'react-icons/bs';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import LogHistories from '../../pcterp/components/LogHistories'
import NumberField from '../../pcterp/field/NumberField'
import EmailField from '../../pcterp/field/EmailField'
import SelectField from '../../pcterp/field/SelectField'
import TextArea from '../../pcterp/field/TextArea'
import TextField from '../../pcterp/field/TextField'
import AppLoader from '../../pcterp/components/AppLoader'
import AppContentLine from '../../pcterp/builder/AppContentLine'
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import DateField from '../../pcterp/field/DateField';
import { UserContext } from '../../components/states/contexts/UserContext';

export default function JobOrder() {
    const { user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setState] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1]; // path of the module
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            responsible: [{ id: user?._id, name: user?.name }],
        }
    });
    const { append: componentAppend, remove: componentRemove, fields: componentFields } = useFieldArray({ control, name: "components" });
    const { append: operationAppend, remove: operationRemove, fields: operationFields } = useFieldArray({ control, name: "operations" });



    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/jobOrder', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/joborders/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/jobOrder/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/joborders/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/jobOrder/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/joborders/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/jobOrder/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            if (document.date) {
                setValue('date', document?.date.split("T")[0])
            }

            setLoderStatus("SUCCESS");
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/joborders/list` }}>   <div className='breadcrum-label'>JOB ORDERS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {<Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/joborders/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                {/* BODY FIELDS */}
                <Container className='mt-1' fluid>
                    <Row>
                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Product",
                                label: "PRODUCT",
                                fieldId: "product",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "bom/getProductsOnlyContainBOM",
                                multiple: false
                            }}
                            changeHandler={async (event, data) => {

                                if (!data?.value) return;

                                const name = data?.value?.name;
                                setValue("name", name + '-BOM');

                            }}
                            blurHandler={null}
                        />
                        <NumberField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: false,
                                description: "",
                                label: "QUANTITY",
                                fieldId: "quantity",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the location name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <DateField
                            register={register}
                            errors={errors}
                            field={{
                                disabled: false,
                                description: "",
                                label: "SCHEDULED DATE",
                                fieldId: "scheduledDate",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the location name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />



                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Unit of Measure",
                                label: "RESPONSIBLE",
                                fieldId: "responsible",
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
                                description: "Internal Notes",
                                label: "NOTES",
                                fieldId: "notes",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Product",
                                label: "BOM",
                                fieldId: "bom",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "bom",
                                multiple: false
                            }}
                            changeHandler={async (event, data) => {
                                if (!data?.value) return;

                            }}
                            blurHandler={async (event, data) => {
                                if (!data?.value) return;

                                ApiService.setHeader()
                                const response = await ApiService.get(`bom/${data?.value[0]?.id}`)
                                console.log(response.data.document)
                                if (response.data.isSuccess) {
                                    setValue("operations", response.data.document?.operations)
                                    setValue("components", response.data.document?.components)
                                }

                            }}
                        />




                    </Row>
                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey='components'>
                        <Tab eventKey="components" title="COMPONENTS">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem", maxWidth: "2rem" }}>#</th>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "20rem" }}>COMPONENT</th>
                                            <th style={{ minWidth: "20rem" }}>BOM QUANTITY</th>
                                            <th style={{ minWidth: "16rem" }}>TO CONSUME</th>
                                            <th style={{ minWidth: "16rem" }}>UNIT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {componentFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            componentRemove(index)
                                                            // updateOrderLines(index)
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>
                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
                                                <td>
                                                    <LineSelectField
                                                        control={control}
                                                        model={"components"}
                                                        field={{

                                                            fieldId: "component",
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
                                                                    setValue(`components.${index}.unit`, productObj.uom);
                                                                }
                                                            }).catch(err => {
                                                                console.log("ERROR", err)
                                                            })
                                                        }}
                                                    />

                                                </td>

                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"components"}
                                                        field={{
                                                            fieldId: "quantity",
                                                            placeholder: ""
                                                        }}
                                                        index={index}
                                                        errors={errors}
                                                        changeHandler={async (event, data) => {

                                                            let quantity = data?.value;

                                                            setValue(`components.${index}.bomQty`, parseFloat(quantity));


                                                        }}
                                                        blurHandler={null}
                                                    />

                                                </td>
                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"components"}
                                                        field={{
                                                            fieldId: "issuedQty",
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
                                                        model={"components"}
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
                                            </tr>
                                            )
                                        })}
                                        <tr>
                                            <td colSpan="14">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => componentAppend({
                                                    component: null,
                                                    quantity: 1,
                                                    unit: null
                                                })} >Add a component</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </AppContentLine>
                        </Tab>


                        <Tab eventKey="operations" title="OPERATIONS">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}>#</th>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "20rem" }}>OPERATION</th>
                                            <th style={{ minWidth: "16rem" }}>WORK CENTER</th>
                                            <th style={{ minWidth: "16rem" }}>COST/MIN</th>
                                            <th style={{ minWidth: "16rem" }}>ACCOUNT</th>
                                            <th style={{ minWidth: "16rem" }}>START DATE</th>
                                            <th style={{ minWidth: "16rem" }}>END DATE</th>
                                            <th style={{ minWidth: "16rem" }}>OPERATION START DATE</th>
                                            <th style={{ minWidth: "16rem" }}>OPERATION END DATE</th>
                                            <th style={{ minWidth: "16rem" }}>EXPECTED DURATION(MIN)</th>
                                            <th style={{ minWidth: "16rem" }}>REAL DURATION(MIN)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {operationFields.map((field, index) => {
                                            return (<tr key={field.id}>
                                                <td>
                                                    <Button size="sm" variant="secondary"
                                                        onClick={() => {
                                                            operationRemove(index)
                                                            // updateOrderLines(index)
                                                        }}
                                                    ><BsTrash /></Button>
                                                </td>

                                                <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>

                                                <td>
                                                    <LineNumberField
                                                        register={register}
                                                        model={"operations"}
                                                        field={{
                                                            fieldId: "steps",
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
                                                        model={"operations"}
                                                        field={{
                                                            fieldId: "operation",
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
                                                            fieldId: "costPerUnit",
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
                                                        model={"operations"}
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
                                                    <LineSelectField
                                                        control={control}
                                                        model={"operations"}
                                                        field={{

                                                            fieldId: "workCenter",
                                                            placeholder: "",
                                                            selectRecordType: "workCenter",
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
                                                        model={"operations"}
                                                        field={{
                                                            fieldId: "expectedDuration",
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
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => operationAppend({
                                                    component: null,
                                                    quantity: 1,
                                                    unit: null
                                                })} >Add a operation</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </AppContentLine>
                        </Tab>
                        {!isAddMode && <Tab eventKey="auditTrail" title="AUDIT TRAIL">
                            <Container className="mt-2" fluid>
                                {!isAddMode && <LogHistories documentPath={"bom"} documentId={id} />}
                            </Container>
                        </Tab>}


                    </Tabs>
                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
