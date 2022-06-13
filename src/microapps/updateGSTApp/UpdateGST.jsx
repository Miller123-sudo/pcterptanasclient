import { React, useState, useEffect } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Breadcrumb, Form, Card, FormSelect, OverlayTrigger, Popover } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsArrowLeft, BsArrowRight, BsPauseBtnFill, BsFillCreditCardFill, BsFillBarChartFill, BsSaveFill } from 'react-icons/bs';
import { DiGhostSmall } from "react-icons/di";
import ApiService from '../../helpers/ApiServices'
import { errorMessage, infoNotification } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppFormTitle from '../../pcterp/components/AppFormTitle'
import TextField from '../../pcterp/field/TextField'
import LogHistories from '../../pcterp/components/LogHistories';
import AppLoader from '../../pcterp/components/AppLoader';
import swal from "sweetalert2"
import { BarcodePDF } from '../../helpers/PDF';

export default function UpdateGST() {
    const [state, setState] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const [loderStatus, setLoderStatus] = useState(null);
    const { id } = useParams();
    // const history = useHistory();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {}
    });


    // Functions
    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            && createDocument(formData)
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.patch('/product/updateMassgst', data).then(response => {
            console.log(response.data.document);
            if (response.data.document.nModified) {
                navigate(`/${rootPath}/product/list`)
            } else if (response.data.document.n == 0) {
                infoNotification("There are no product with given old GST value")
            } else if (response.data.document.nModified == 0) {
                infoNotification("Products are not updated")
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }


    useEffect(async () => {

    }, []);


    // if (loderStatus === "RUNNING") {
    //     return (
    //         <AppLoader />
    //     )
    // }

    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' active>   <div className='breadcrum-label'>UPDATE GST</div></Breadcrumb.Item>

                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col md="4" className='p-0 ps-1'>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/${rootPath}/product/list`} variant="secondary" size="sm">DISCARD</Button>

                        </Col>

                    </Row>
                </Container>
            </AppContentHeader>
            <AppContentBody>
                <Container className=" bg-light p-0 m-0" fluid>

                </Container>
                {/* BODY FIELDS */}
                <Container className='mt-2' fluid>

                    <Row>
                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Enter old GST value which will be updated by new one given in the field next to it",
                                label: "OLD GST VALUE",
                                fieldId: "oldgstValue",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter old GST value"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Enter the new GST value. This value will be updated in all product's which have the old GST value entered in previous field",
                                label: "NEW GST VALUE",
                                fieldId: "newgstValue",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter new GST value"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                    </Row>

                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey='generalInformations'>

                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
