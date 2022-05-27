import { React, useEffect, useState } from 'react';
import { Navbar, Row, Col, Table, Tabs, Tab, Container, Nav, NavDropdown, Form, Button, Breadcrumb, DropdownButton, Dropdown, ButtonGroup } from 'react-bootstrap';
import { Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

import { AppController, MOUNT } from '../controllers/controller';
import { DateField, SelectField, TextArea, TextField, CheckboxField } from '../../../pcterp/field/Index';
import LineContent from '../../../pcterp/components/LineContent';
import AppContentLine from '../../../pcterp/builder/AppContentLine';
import AppContentHeader from '../../../pcterp/builder/AppContentHeader';
import AppContentBody from '../../../pcterp/builder/AppContentBody';
import AppContentForm from '../../../pcterp/builder/AppContentForm';
import NumberField from '../../../pcterp/field/NumberField';
import Decimal128Field from '../../../pcterp/field/Decimal128Field';
import LogHistories from '../../../pcterp/components/LogHistories';
import AppLoader from '../../../pcterp/components/AppLoader';



export default function Document() {
    const [loaderStatus, setLoaderStatus] = useState(null)
    const [searchParams] = useSearchParams();
    const [model, setModel] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    MOUNT.ROOT_PATH = rootPath;
    MOUNT.NAVIGATE = useNavigate();
    MOUNT.PARAMS = useParams();
    MOUNT.DOCUMENT_TYPE_ID = searchParams.get('doctype')
    MOUNT.LOADER = loaderStatus;
    MOUNT.SET_LOADER_FUN = setLoaderStatus;
    const { id } = useParams();
    const isAddMode = !id;
    MOUNT.ISADDMODE = !id;
    MOUNT.CURRENT_RECORD_ID = id;


    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors, } } = useForm();


    let watchValues = watch();

    const onSubmit = (formData) => {
        AppController.handleSubmit(formData);
    }

    const deleteHandler = () => {
        AppController.deleteDocument();
    }

    // Global Hander
    const bodyFieldChangeHandler = (event, value) => {

        AppController.handleBodyFieldChangeEvent(event, value, getValues, setValue);
    }
    const bodyFieldBlurHandler = (event, value) => {
        //bodyFieldBlurController(event, getValues, setValue)
    };

    const lineFieldChangeHandler = (event, value) => {

    }
    const lineFieldBlurHandler = (event, value) => {

    }

    useEffect(() => {
        setLoaderStatus("RUNNING");
        AppController.initFormSchema(setModel);

    }, [])


    useEffect(() => {

        if (!isAddMode) {
            setLoaderStatus("RUNNING");
            AppController.initForm(reset)
        }

    }, []);

    if (loaderStatus === "RUNNING") {
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
                                <Breadcrumb.Item className='breadcrumb-item-active' linkAs={Link} linkProps={{ to: `/` }}>   <div className='breadcrum-label'>{model && model?.documentTypeName}</div></Breadcrumb.Item>

                            </Breadcrumb>
                        </Col>

                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {model && [
                                {
                                    "name": "Save",
                                    "id": "action_save",
                                    "type": "submit",
                                    "variant": "primary",
                                    "disabled": false
                                },
                                {
                                    "name": "Cancel",
                                    "id": "action_cancel",
                                    "type": "button",
                                    "variant": "secondary",
                                    "disabled": false
                                }
                            ]?.map((button, index) => {
                                return <Button className='me-1' key={index} name={button.name} id={button.id}
                                    variant={button.variant} size='sm'
                                    type={button.type} onClick={button.type === "button" ? AppController.buttonActionController : null}>
                                    {button.name}
                                </Button>
                            })}
                            <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteHandler} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                <Container fluid>
                    <Row>
                        {model && model?.customFields?.map((field, index) => {
                            if (field.displayLocation !== 'Body') return;

                            switch (field.type) {
                                case 'String':
                                    return <TextField key={index} field={field} index={index} register={register} errors={errors} watchValues={watchValues} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                case 'Long String':
                                    return <TextArea key={index} field={field} index={index} register={register} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                case 'Number':
                                    return <NumberField key={index} field={field} index={index} register={register} errors={errors} watchValues={watchValues} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                case 'Decimal':
                                    return <Decimal128Field key={index} field={field} index={index} register={register} errors={errors} watchValues={watchValues} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                case 'App':
                                    return <SelectField key={index} field={field} index={index} control={control} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                case 'Date':
                                    return <DateField key={index} field={field} index={index} register={register} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                case 'Boolean':
                                    return <CheckboxField key={index} field={field} index={index} register={register} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                default:
                                    return <h3 key={index}>NO Content</h3>;
                            }
                        })}
                    </Row>
                </Container>
                {/* "Tab" */}
                <Container className='mt-2' fluid>
                    {
                        model?.documentTabs &&

                        <Tabs defaultActiveKey={`${model?.documentTabs.length > 0 ? model?.documentTabs[0].tabId : ""}`}>
                            {
                                model?.documentTabs?.map((tab, index) => {
                                    switch (tab.tabType) {
                                        case 'Line':
                                            return <Tab key={tab.tabId} eventKey={tab.tabId} title={tab.label}>
                                                <AppContentLine>
                                                    <LineContent model={tab.tabId} fieldList={tab.customFields} control={control} errors={errors} register={register} changeHandler={lineFieldChangeHandler} blurHandler={lineFieldBlurHandler} />
                                                </AppContentLine>
                                            </Tab>
                                        case 'Block':
                                            return <Tab key={tab.tabId} eventKey={tab.tabId} title={tab.label}>
                                                <Container fluid>
                                                    <Row>
                                                        {tab && tab.customFields?.map((field, index) => {
                                                            console.log("hf", field)
                                                            switch (field.type) {
                                                                case 'String':
                                                                    return <TextField key={index} field={field} index={index} register={register} errors={errors} watchValues={watchValues} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                case 'Long String':
                                                                    return <TextArea key={index} field={field} index={index} register={register} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                case 'Number':
                                                                    return <NumberField key={index} field={field} index={index} register={register} errors={errors} watchValues={watchValues} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                case 'Decimal':
                                                                    return <Decimal128Field key={index} field={field} index={index} register={register} errors={errors} watchValues={watchValues} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                case 'App':
                                                                    return <SelectField key={index} field={field} index={index} control={control} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                case 'Date':
                                                                    return <DateField key={index} field={field} index={index} register={register} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                case 'Boolean':
                                                                    return <CheckboxField key={index} field={field} index={index} register={register} errors={errors} changeHandler={bodyFieldChangeHandler} blurHandler={bodyFieldBlurHandler} />
                                                                default:
                                                                    return <h3 key={index}>NO Content</h3>;
                                                            }
                                                        })}
                                                    </Row>
                                                </Container>
                                            </Tab>
                                        default:
                                            return <Tab key={tab.id} eventKey={tab.id} title={tab.label}>
                                                <h3>No Content</h3>
                                            </Tab>
                                    }
                                })
                            }
                            {/* {!isAddMode && <Tab eventKey="auditTrail" title="Audit Trail">
                                <Container className="mt-2" fluid>
                                    <Row>

                                    </Row>
                                    {!isAddMode && <LogHistories documentPath={"customDocumentType/customDocument"} docType={searchParams.get('doctype')} documentId={id} />}
                                </Container>
                            </Tab>} */}
                        </Tabs>
                    }
                </Container>
            </AppContentBody>
        </AppContentForm>
    )
}
