import { React, useState, useEffect } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tabs, Tab, Breadcrumb, Form } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage, infoNotification } from '../../helpers/Utils'
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

export default function Company() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setState] = useState(null)
    const [Files, setFiles] = useState()
    const [name, setname] = useState()
    const [phone, setphone] = useState()
    const [address, setaddress] = useState()
    const [email, setemail] = useState()
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1]; // path of the module
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();

    // Functions
    const onSubmit = (formData) => {
        // formData.file = Files
        const form = new FormData();
        console.log(name, phone, email, address, Files);
        form.append("name", formData.name)
        form.append("legalname", formData.legalname)
        form.append("website", formData.website)
        form.append("state", formData.state)
        form.append("country", formData.country)
        form.append("phone", formData.phone)
        form.append("tin", formData.tin)
        form.append("pan", formData.pan)
        form.append("gstin", formData.gstin)
        form.append("email", formData.email)
        form.append("file", Files)
        form.append("address", formData.address)
        form.append("shippingaddress", formData.shippingaddress)
        form.append("returnaddress", formData.returnaddress)


        console.log(form);
        return isAddMode
            ? createDocument(form)
            : updateDocument(id, form);
    }


    const onInputChange = (e) => {
        console.log(e.target.files);
        setFiles(e.target.files[0]);
    };

    const createDocument = async (data) => {
        console.log(data);
        ApiService.setHeader();

        await ApiService.post('setup?setupType=COMPANY_SETUP', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/company`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })


    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/company/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/company/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/company/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/company/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = async () => {
        console.log("hi");
        let uniqueId;
        ApiService.setHeader();
        await ApiService.get("setup").then(res => {
            console.log(res.data.documents.length);
            if (res.data.documents.length > 0) {
                uniqueId = res.data.documents[0]?._id
                return ApiService.get(`setup/${res.data.documents[0]?._id}`).then(async response => {
                    const document = response?.data.document;
                    console.log(document);
                    reset(document)
                    setState(document)
                    setLoderStatus("SUCCESS");


                }).catch(e => {
                    console.log(e.response?.data.message);
                    errorMessage(e, null)
                })
            } else {
                navigate(`/${rootPath}/company`)
            }
        })
        setLoderStatus("SUCCESS");

        // return ApiService.get(`setup/${uniqueId}`).then(async response => {
        //     const document = response?.data.document;
        //     console.log(document);
        //     reset(document)
        //     setLoderStatus("SUCCESS");


        // }).catch(e => {
        //     console.log(e.response?.data.message);
        //     errorMessage(e, null)
        // })

    }



    useEffect(() => {

        if (!isAddMode || isAddMode) {
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
        <Form onSubmit={handleSubmit(onSubmit)} enctype="multipart/form-data">
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/company` }}>   <div className='breadcrum-label'>COMPANY</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>{state?.setupType}</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.setupType}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {<Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Name of the company",
                                label: "NAME",
                                fieldId: "name",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter company name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setname(e.target.value)}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Provide legal name",
                                label: "LEGAL NAME",
                                fieldId: "legalname",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter legal name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                console.log(e.target.value);
                                setphone(e.target.value)
                            }
                            }
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Name of the web site",
                                label: "WEBSIITE",
                                fieldId: "website",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter website!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setname(e.target.value)}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Enter state",
                                label: "STATE / UNION TERRITORY",
                                fieldId: "state",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter state!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setname(e.target.value)}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Enter country",
                                label: "COUNTRY",
                                fieldId: "country",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter country!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setname(e.target.value)}
                        />


                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="name"
                                name="name"
                                onChange={(e) => setname(e.target.value)}
                            // {...register("file")}
                            />
                        </Form.Group> */}

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Provide phone number",
                                label: "PHONE",
                                fieldId: "phone",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter phone number!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                console.log(e.target.value);
                                setphone(e.target.value)
                            }
                            }
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Provide TIN number",
                                label: "TIN",
                                fieldId: "tin",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter tin number!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                console.log(e.target.value);
                                setphone(e.target.value)
                            }
                            }
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Provide PAN number",
                                label: "PAN",
                                fieldId: "pan",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter pan number!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                console.log(e.target.value);
                                setphone(e.target.value)
                            }
                            }
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Provide GSTIN number",
                                label: "GSTIN",
                                fieldId: "gstin",
                                placeholder: "",
                                required: false,
                                validationMessage: "Please enter gstin number!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                console.log(e.target.value);
                                setphone(e.target.value)
                            }
                            }
                        />

                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Phone</Form.Label>
                            <Form.Control
                                type="text"
                                id="phone"
                                name="phone"
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setphone(e.target.value)
                                }
                                }
                            // {...register("file")}
                            />
                        </Form.Group> */}

                        <EmailField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Provide email address",
                                label: "EMAIL",
                                fieldId: "email",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setemail(e.target.value)}
                        />

                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Email</Form.Label>
                            <Form.Control
                                type="text"
                                id="email"
                                name="email"
                                onChange={(e) => setemail(e.target.value)}
                            // {...register("file")}
                            />
                        </Form.Group> */}


                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Address</Form.Label>
                            <Form.Control
                                type="textarea"
                                id="address"
                                name="address"
                                onChange={(e) => setaddress(e.target.value)}
                            // {...register("file")}
                            />
                        </Form.Group> */}

                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">LOGO</Form.Label>
                            <Form.Control style={{ maxWidth: '400px' }}
                                size='sm'
                                type="file"
                                id="file"
                                name="file"
                                onChange={onInputChange}
                            // {...register("file")}
                            />
                        </Form.Group>

                    </Row>
                </Container>

                {/* SUBTABS */}
                <Tabs defaultActiveKey='address'>
                    <Tab eventKey="address" title="ADDRESSL">
                        <Container className="mt-2" fluid>
                            <Row>
                                <TextArea
                                    register={register}
                                    errors={errors}
                                    field={{
                                        description: "Provide address",
                                        label: "ADDRESS",
                                        fieldId: "address",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the address name!"
                                    }}
                                    changeHandler={null}
                                    blurHandler={(e) => setaddress(e.target.value)}
                                />

                                <TextArea
                                    register={register}
                                    errors={errors}
                                    field={{
                                        description: "Provide shipping address",
                                        label: "SHIPPING ADDRESS",
                                        fieldId: "shippingaddress",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the address name!"
                                    }}
                                    changeHandler={null}
                                    blurHandler={(e) => setaddress(e.target.value)}
                                />

                                <TextArea
                                    register={register}
                                    errors={errors}
                                    field={{
                                        description: "Provide return address",
                                        label: "RETURN ADDRESS",
                                        fieldId: "returnaddress",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the address name!"
                                    }}
                                    changeHandler={null}
                                    blurHandler={(e) => setaddress(e.target.value)}
                                />
                            </Row>
                            {!isAddMode && <LogHistories documentPath={"customer"} documentId={id} />}
                        </Container>
                    </Tab>
                </Tabs>

            </AppContentBody>
        </Form>
    )
}
