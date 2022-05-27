import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { FadeLoader, PropagateLoader } from "react-spinners";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';


export default function InvoicePayment() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState();
    const [accountList, setAccountList] = useState([])
    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            journalType: "Bank",
            paymentDate: new Date().toISOString().split("T")[0]
        }
    });

    const onSubmit = (formData) => {
        return createDocument(formData)
    }

    const createDocument = (data) => {
        console.log(data);
        ApiService.setHeader();
        return ApiService.patch('/invoicePayment/' + state.id, data).then(response => {
            if (response.data.isSuccess) {
                navigate("/accountings/invoicepayments");
            }
        }).catch(e => {
            console.log(e);
        })
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log(id);
        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents);
        }

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`invoicePayment/${id}`).then(response => {
                setLoderStatus("SUCCESS");
                console.log(response.data.document)
                const invoiceDocument = response.data.document;
                reset(invoiceDocument)
                setstate(response.data.document)
                setValue('paymentDate', invoiceDocument.paymentDate.split("T")[0]);
                setValue('journalType', invoiceDocument.journalType);
                setValue('amount', invoiceDocument.amount.toFixed(2));
                setValue('memo', invoiceDocument.name);

            }).catch(e => {
                console.log(e)
            })
        }
    }, [])

    console.log(state);

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            {/* <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/sales/orders' }} ><span className="breadcrum-label">Sales Orders</span></Breadcrumb.Item> */}
                            {/* <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/sales/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item> */}
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/accountings/invoice/${state?.invoice.id}?mode=view` }} ><span className="breadcrum-label">{state?.invoice.name}</span></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>Register Payment</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            {
                                state?.invoice.paymentStatus !== "Paid" && <Button type="submit" variant="primary" size="sm">CREATE PAYMENT</Button>
                            }
                            <Button as={Link} to="/accountings/invoicepayments" variant="light" size="sm">DISCARD</Button>{" "}

                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" fluid>
                    <Row className="m-0 p-0">
                        {/* <Col>Header</Col>
                    <Col>
                        In:11 <br />
                        Out:10

                    </Col> */}

                    </Row>
                    <Container fluid>
                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Journal Type</Form.Label>
                                <Form.Select id="journalType" name="journalType" {...register("journalType", { required: true })}>
                                    <option value="Bank">Bank</option>
                                    <option value="Cash">Cash</option>

                                </Form.Select>
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Amount</Form.Label>
                                <Form.Control
                                    disabled
                                    step="0.0001"
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    {...register("amount")}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bank</Form.Label>
                                <Form.Select id="bankAccount" name="bankAccount" {...register("bankAccount")}>
                                    <option value={null}>Choose..</option>
                                    {accountList && accountList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>


                        </Row>

                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="paymentDate"
                                    name="paymentDate"
                                    {...register("paymentDate")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Memo</Form.Label>
                                <Form.Control
                                    disabled
                                    type="text"
                                    id="memo"
                                    name="memo"
                                    {...register("memo")}
                                />
                            </Form.Group>
                        </Row>



                    </Container>

                </Container>
            </Form>
        </Container>
    )
}

