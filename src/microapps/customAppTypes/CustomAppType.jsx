import { React, useState, useEffect } from 'react'
import { Col, Row, Button, Container, DropdownButton, Dropdown, ButtonGroup, Form, Tabs, Tab, Table, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { BsTrash } from 'react-icons/bs'
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../../helpers/ApiServices';
import { errorMessage } from '../../helpers/Utils';
import AppContentBody from '../../pcterp/builder/AppContentBody';
import AppContentForm from '../../pcterp/builder/AppContentForm';
import AppContentHeader from '../../pcterp/builder/AppContentHeader';
import AppContentLine from '../../pcterp/builder/AppContentLine';
import AppLoader from '../../pcterp/components/AppLoader';
import AsyncSelectField from '../../pcterp/field/AsyncSelectField';
import ColorField from '../../pcterp/field/ColorField';
import TextArea from '../../pcterp/field/TextArea';
import TextField from '../../pcterp/field/TextField';

export default function CustomDocumentType() {
    const [state, setState] = useState(null);
    const [fields, setFields] = useState(null)
    const [loderStatus, setLoderStatus] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors, } } = useForm();
    const { append: appendDocumentTab, remove: removeDocumentTab, fields: fieldsDocumentTab } = useFieldArray({ control, name: 'documentTabs' });
    const { append: appendField, remove: removeField, fields: fieldsField } = useFieldArray({ control, name: 'fields' });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/customDocumentType', data).then(response => {
            console.log(response)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/customapptype/list`);
            }
        }).catch(e => {
            console.log(e);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/customDocumentType/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/customapptype/list`);
            }
        }).catch(e => {
            console.log(e);
            errorMessage(e, null)
        })
    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`customDocumentType/${id}`).then(response => {
            if (response.status === 204) {
                navigate(`/${rootPath}/customapptype/list`);
            }
        }).catch(e => {
            console.log(e);
            errorMessage(e, null)
        })

    }

    useEffect(() => {


        if (!isAddMode) {
            setLoderStatus("RUNNING");
            ApiService.setHeader();
            ApiService.get(`customDocumentType/${id}`).then(response => {
                console.log(response)
                const documents = response.data.document;
                reset(documents);
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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/customapptype/list` }}>   <div className='breadcrum-label'>CUSTOM APPS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {getValues("documentTypeName")}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button size='sm' type='submit'>SAVE</Button>{" "}
                            <Button variant="seconday" size='sm' as={Link} to={`/${rootPath}/customapptype/list`}>CANCEL</Button>
                            <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>
                        </Col>
                    </Row>
                </Container>
            </AppContentHeader>
            <AppContentBody>
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Custom Application Name",
                                label: "APP NAME",
                                fieldId: "documentTypeName",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the app name!"
                            }}
                            changeHandler={(event, data) => {

                                console.log(event, data)
                                if (!data) return

                                if (data?.targetValue === "")
                                    setValue("documentTypeId", "")

                                const newId = data?.targetValue?.replace(/\s+/g, "_");
                                setValue("documentTypeId", newId)

                            }}
                            blurHandler={null}

                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Custom Application Name ID",
                                label: "APP ID",
                                fieldId: "documentTypeId",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the app name id!"
                            }}
                            changeHandler={null}
                            blurHandler={null}

                        />


                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Description of the custom application.",
                                label: "DESCRIPTION",
                                fieldId: "description",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the app name id!"
                            }}
                            changeHandler={null}
                            blurHandler={null}

                        />

                        {/* <AsyncSelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Icon",
                                label: "ICON",
                                fieldId: "icon",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "role",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}

                        <ColorField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Please select any dark color.",
                                label: "ICON COLOR",
                                fieldId: "color",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the app name id!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <ColorField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Please select any light color.",
                                label: "BACKGROUND COLOR",
                                fieldId: "backgroundColor",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the app name id!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                    </Row>
                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey="documentTabs" >
                        <Tab eventKey="documentTabs" title="SUBTABS">
                            <AppContentLine>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}>#</th>
                                            <th style={{ minWidth: "2rem" }}></th>
                                            <th style={{ minWidth: "16rem" }}>NAME</th>
                                            <th style={{ minWidth: "16rem" }}>FIELD ID</th>
                                            <th style={{ minWidth: "16rem" }}>TYPE</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            fieldsDocumentTab && fieldsDocumentTab.map((field, index) => {
                                                return <tr>
                                                    <td><Button size='sm' variant='secondary' onClick={() => (removeDocumentTab(index))}><BsTrash /></Button></td>
                                                    <td style={{ textAlign: 'center', paddingTop: '8px' }}>{index + 1}</td>
                                                    <td>
                                                        <Form.Control
                                                            size='sm'
                                                            type="text"
                                                            id="label"
                                                            name="label"
                                                            {...register(`documentTabs.${index}.label`)} />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            size='sm'
                                                            type="text"
                                                            id="tabId"
                                                            name="tabId"
                                                            {...register(`documentTabs.${index}.tabId`)} />
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            size='sm'
                                                            type="text"
                                                            id="tabType"
                                                            name="tabType"
                                                            {...register(`documentTabs.${index}.tabType`)} >
                                                            <option value="Block">Block</option>
                                                            <option value="Line">Line</option>
                                                        </Form.Select>
                                                    </td>

                                                </tr>
                                            })
                                        }

                                        <tr>
                                            <td colSpan="12">
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => appendDocumentTab({})} >Add a Tab</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </AppContentLine>
                        </Tab>
                        {!isAddMode && <Tab eventKey="fields" title="ADD FIELDS">
                            <Button size='sm' as={Link} to={`/${rootPath}/customapptype/customfield/add?doctype=${id}`}>ADD FIELD</Button>
                            <AppContentLine>
                                <Table className='mt-1' striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "2rem" }}>#</th>
                                            <th>LABEL</th>
                                            <th>FIELD ID</th>
                                            <th>TYPE</th>
                                            <th>DISPLAY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            getValues('customFields') && getValues('customFields').map((field, index) => {
                                                return <tr>
                                                    <td>{index + 1}</td>
                                                    <td><Link to={`/${rootPath}/customapptype/customfield/edit/${field._id}?doctype=${id}`}>{field.label}</Link></td>
                                                    <td>{field.fieldId}</td>
                                                    <td>{field.type}</td>
                                                    <td>{field.displayLocation}</td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </Table>
                            </AppContentLine>
                        </Tab>}
                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
