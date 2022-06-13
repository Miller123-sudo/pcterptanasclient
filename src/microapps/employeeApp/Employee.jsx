import { React, useState, useEffect, useContext } from 'react'
import { Container, Button, Col, Row, Form, DropdownButton, Dropdown, ButtonGroup, Tabs, Tab, Breadcrumb } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { UserContext } from '../../components/states/contexts/UserContext';
import { checkMaxDepartmentCount, errorMessage, infoNotification } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import NumberField from '../../pcterp/field/NumberField'
import SelectField from '../../pcterp/field/SelectField'
import TextArea from '../../pcterp/field/TextArea'
import TextField from '../../pcterp/field/TextField'
import EmailField from '../../pcterp/field/EmailField'
import CheckboxField from '../../pcterp/field/CheckboxField'
import PasswordField from '../../pcterp/field/PasswordField'
import DateField from '../../pcterp/field/DateField'
import LogHistories from '../../pcterp/components/LogHistories'
import AppLoader from '../../pcterp/components/AppLoader'


export default function Employee() {
    const [loderStatus, setLoderStatus] = useState(null);
    const { dispatch, user } = useContext(UserContext)
    const [state, setState] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();



    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        console.log(checkMaxDepartmentCount(formData));

        if (!checkMaxDepartmentCount(formData)) {
            return isAddMode
                ? createDocument(formData)
                : updateDocument(id, formData);
        } else {
            infoNotification("Please select two or more value in department field ❕");
        }
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/employee', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/employees/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/employee/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/employees/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/employee/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/employees/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/employee/${id}`).then(response => {
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

    }, [id]);


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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/employees/list` }}>   <div className='breadcrum-label'>EMPLOYEES</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/${rootPath}/employees/list`} variant="secondary" size="sm">DISCARD</Button>
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

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Code of employee",
                                label: "EMPLOYEE CODE",
                                fieldId: "employeeCode",
                                placeholder: "",
                                required: false,
                                validationMessage: "",
                                disabled: true
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "First Name of the Employee.",
                                label: "FIRST NAME",
                                fieldId: "firstName",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the First Name of the employee!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Last Name of the Employee.",
                                label: "LAST NAME",
                                fieldId: "lastName",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter the Last Name of the employee!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Contact Name of the Employee.",
                                label: "CONTACT NAME",
                                fieldId: "contactName",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter the contact Name of the employee!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Job Position or Job Title of the Employee.",
                                label: "JOB POSITION",
                                fieldId: "jobTitle",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "jobPosition",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Phone number of the Employee.",
                                label: "PHONE NUMBER",
                                fieldId: "phone",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Last Name of the employee!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <EmailField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Email of the Employee.",
                                label: "EMAIL",
                                fieldId: "email",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter the Email of the employee!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Address",
                                label: "ADDRESS",
                                fieldId: "address",
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
                                description: "Supervisor of the Employee.",
                                label: "SUPERVISOR",
                                fieldId: "supervisor",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "employee",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                    </Row>
                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey='privateInformation'>
                        <Tab eventKey="privateInformation" title="PRIVATE INFORMATIONS">
                            <Container className="mt-2" fluid>
                                <Row>

                                    <CheckboxField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "Give Access to the Employee.",
                                            label: "GIVE ACCESS",
                                            fieldId: "giveAccess",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Email of the employee!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <CheckboxField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "Check if this employee is a POS user",
                                            label: "POS USER",
                                            fieldId: "isposUser",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Email of the employee!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <CheckboxField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "Check if this employee is a sales rep",
                                            label: "SALES REP",
                                            fieldId: "isSalesRep",
                                            placeholder: "",
                                            checked: true
                                            // required: true,
                                            // validationMessage: "Please enter the Email of the employee!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <SelectField
                                        control={control}
                                        errors={errors}
                                        field={{
                                            description: "Select role",
                                            label: "ROLES",
                                            fieldId: "roles",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            selectRecordType: "role",
                                            multiple: true
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    {!isAddMode && user.id == id && <Form.Group as={Col} md="4" className="mb-2">
                                        <Form.Label className="m-0"> {" "}</Form.Label><br />
                                        <Button as={Link} to={`/${rootPath}/employees/changepassword/${id}`} size="sm">Change Password</Button>
                                    </Form.Group>}

                                    {isAddMode && <PasswordField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "Enter password",
                                            label: "PASSWORD",
                                            fieldId: "password",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Last Name of the employee!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />}

                                    {isAddMode && <PasswordField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "Enter password confirm",
                                            label: "PASSWORD CONFIRM",
                                            fieldId: "passwordConfirm",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Last Name of the employee!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />}


                                </Row>
                            </Container>
                        </Tab>
                        <Tab eventKey="workInformation" title="WORK INFORMATIONS">
                            <Container className="mt-2" fluid>
                                <Row>
                                    <SelectField
                                        control={control}
                                        errors={errors}
                                        field={{
                                            description: "Select location",
                                            label: "LOCATION",
                                            fieldId: "location",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            selectRecordType: "location",
                                            multiple: false
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />
                                    <SelectField
                                        control={control}
                                        errors={errors}
                                        field={{
                                            description: "Select department",
                                            label: "DEPARTMENT",
                                            fieldId: "department",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            selectRecordType: "department",
                                            multiple: true
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                </Row>
                            </Container>
                        </Tab>
                        {!isAddMode && <Tab eventKey="auditTrail" title="AUDIT TRAIL">
                            <Container className="mt-2" fluid>
                                <Row>

                                </Row>
                                {!isAddMode && <LogHistories documentPath={"employee"} documentId={id} />}
                            </Container>
                        </Tab>}


                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
