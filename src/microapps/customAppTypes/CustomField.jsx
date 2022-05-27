import { React, useState, useEffect } from 'react'
import { Col, Row, Button, Container, Form, Tabs, Tab, Table, Dropdown, ButtonGroup, DropdownButton, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import ApiService from '../../helpers/ApiServices';
import AppContentBody from '../../pcterp/builder/AppContentBody';
import AppContentForm from '../../pcterp/builder/AppContentForm';
import AppContentHeader from '../../pcterp/builder/AppContentHeader';
import AppLoader from '../../pcterp/components/AppLoader';

export default function CustomField() {
    const [isSelectApp, setIsSelectApp] = useState(true);
    const [isValidateMessage, setIsValidateMessage] = useState(false)
    const [loderStatus, setLoderStatus] = useState(null);
    const [searchParams] = useSearchParams();
    const [state, setState] = useState(null);
    const [documentTabs, setDocumentTabs] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;


    const { register, control, reset, handleSubmit, getValues, setValue, watch, setError, clearErrors, formState: { errors, } } = useForm();

    const onSubmit = (formData) => {
        console.log(formData)
        return isAddMode ? createDocument(formData) : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post(`/customDocumentType/customField?docType=${searchParams.get('doctype')}`, data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/customapptype/edit/` + searchParams.get('doctype'));
            } else {
                alert("Field Id is already present!")
            }
        }).catch(e => {
            alert("Field Id is already present!")
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/customDocumentType/customField/${id}?docType=${searchParams.get('doctype')}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/customapptype/edit/` + searchParams.get('doctype'));
            } else {
                alert("Field Id is already present!")
            }
        }).catch(e => {
            alert("Field Id is already present!")
        })
    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/customDocumentType/customField/${id}?docType=${searchParams.get('doctype')}`).then(response => {
            console.log(response)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/customapptype/edit/` + searchParams.get('doctype'));
            }
        }).catch(e => {
            console.log(e);
        })
    }

    // const validateSpace = (e) => {
    //     if (e?.target?.value?.indexOf(" ") != -1) {
    //         setError("fieldId", { type: "custom", message: "Please remove spaces!" })
    //     } else {
    //         //clearErrors("fieldId")
    //     }
    // }

    useEffect(() => {
        setLoderStatus("RUNNING");

        ApiService.get('customDocumentType/documentTab?docType=' + searchParams.get('doctype')).then(response => {
            setDocumentTabs(response.data.document)
            setLoderStatus("SUCCESS");
        })

        if (!isAddMode) {


            ApiService.setHeader();
            ApiService.get(`customDocumentType/customField/${id}?docType=${searchParams.get('doctype')}`).then(response => {
                console.log(response)
                const documents = response.data.document;
                reset(documents);
                setIsValidateMessage(documents?.required)
                if (getValues('type') === "App")
                    setIsSelectApp(false)
                setLoderStatus("SUCCESS");
            }).catch(e => {
                console.log(e)
            })



        }

    }, [])

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }

    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Container fluid>
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/customapptype/edit/${searchParams.get('doctype')}` }}>   <div className='breadcrum-label'>ADD NEW FIELD</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {getValues("label")}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button size='sm' type='submit' >SAVE</Button>{" "}
                            <Button size='sm' variant='light' type='button' as={Link} to={`/${rootPath}/customapptype/edit/${searchParams.get('doctype')}`}>DISCARD</Button>{" "}
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">DELETE</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
            </AppContentHeader>
            <AppContentBody>
                <Container fluid>
                    <Row>
                        <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>Label</Form.Label>
                            <Form.Control
                                style={{ maxWidth: '400px' }}
                                size='sm'
                                type="text"
                                id="label"
                                name="label"
                                isInvalid={errors['label']}
                                {...register("label", { required: 'Please enter the field label.' })} />
                            <Form.Control.Feedback type="invalid">
                                {errors['label'] && errors['label']['message']}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>Field Id</Form.Label>
                            <Form.Control
                                disabled={!isAddMode}
                                style={{ maxWidth: '400px' }}
                                size='sm'
                                type="text"
                                id="fieldId"
                                name="fieldId"
                                isInvalid={errors['fieldId']}
                                {...register("fieldId", { required: 'Please enter the field Id.' })} />
                            <Form.Control.Feedback type="invalid">
                                {errors['fieldId'] && errors['fieldId']['message']}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                style={{ maxWidth: '400px' }}
                                size='sm'
                                as="textarea"
                                id="description"
                                name="description"
                                {...register("description")} />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                style={{ maxWidth: '400px' }}
                                size='sm'
                                type="text"
                                id="type"
                                name="type"
                                {...register("type")} onChange={(e) => {
                                    if (e.target.value === "App") {
                                        setIsSelectApp(false);
                                    } else {
                                        setIsSelectApp(true)
                                    }
                                }} >

                                <option value="String">String</option>
                                <option value="Long String">Long String</option>
                                <option value="App">App</option>
                                <option value="Boolean">Boolean</option>
                                <option value="Date">Date</option>
                                <option value="Decimal">Decimal</option>
                                <option value="Number">Number</option>



                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>Select App</Form.Label>
                            <Form.Select
                                disabled={isSelectApp}
                                style={{ maxWidth: '400px' }}
                                size='sm'
                                type="text"
                                id="selectRecordType"
                                name="selectRecordType"
                                {...register("selectRecordType")} >
                                <option value="">Select...</option>
                                <option value="account">Acount</option>
                                <option value="customer">Customer</option>
                                <option value="department">Department</option>
                                <option value="employee">Employee</option>
                                <option value="product">Product</option>
                                <option value="location">Location</option>
                                <option value="vendor">Vendor</option>

                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>{" "}</Form.Label>
                            <Form.Check
                                style={{ maxWidth: '400px' }}
                                label="Required"
                                size='sm'
                                type="checkbox"
                                id="required"
                                name="required"
                                {...register("required")} onChange={(e) => {
                                    if (e.target.checked === true) {
                                        setIsValidateMessage(true);
                                    } else {
                                        setIsValidateMessage(false);
                                    }

                                }} />
                        </Form.Group>


                    </Row>
                    <Row>
                        {isValidateMessage && <Form.Group as={Col} md="4" className="mb-3" >
                            <Form.Label>Validation Message</Form.Label>
                            <Form.Control

                                style={{ maxWidth: '400px' }}
                                size='sm'
                                as="textarea"
                                id="validationMessage"
                                name="validationMessage"
                                {...register("validationMessage", { required: "Please enter the validation message" })} />
                        </Form.Group>}



                    </Row>
                </Container>
                <Container fluid>
                    <Tabs className='mb-1' defaultActiveKey="location" >
                        <Tab eventKey="location" title="Location">
                            <Row>
                                <Form.Group as={Col} md="4" className="mb-3" >
                                    <Form.Label>Select Subtab</Form.Label>
                                    <Form.Select
                                        style={{ maxWidth: '400px' }}
                                        size='sm'
                                        id="displayLocation"
                                        name="displayLocation"
                                        {...register("displayLocation")} >
                                        <option value="Body">Body</option>
                                        {documentTabs?.map((tab, index) => {

                                            return <option key={index} value={tab.tabId}>{tab.name}</option>

                                        })}
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                        </Tab>
                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm >

    )
}
