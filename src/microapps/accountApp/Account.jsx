
import { React, useState, useEffect } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import SelectField from '../../pcterp/field/SelectField'
import TextField from '../../pcterp/field/TextField'
import TextArea from '../../pcterp/field/TextArea'
import AppLoader from '../../pcterp/components/AppLoader'

export default function Account() {
    const [loderStatus, setLoderStatus] = useState(null);
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
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/account', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/accounts/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/account/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/accounts/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/account/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/accounts/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/account/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            if (document.date) {
                setValue('date', document.date.split("T")[0])
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
                <Row>
                    <Col><h4>Account</h4></Col>
                    <Col></Col>
                </Row>
                <Col>
                    <Col>
                        <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                        <Button as={Link} to={`/${rootPath}/accounts/list`} variant="light" size="sm">DISCARD</Button>
                        {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                            <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                        </DropdownButton>}
                    </Col>
                </Col>

            </AppContentHeader>
            <AppContentBody>
                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Account Number",
                                fieldId: "accountNumber",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Account Name",
                                fieldId: "title",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the Account Name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Account Type",
                                fieldId: "accountType",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "accountType"

                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Description",
                                fieldId: "description",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />


                    </Row>
                </Container>

                {/* SUBTABS */}

            </AppContentBody>
        </AppContentForm>
    )
}
