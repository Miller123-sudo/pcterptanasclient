import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';

import { PropagateLoader } from "react-spinners";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import GLList from './GLList';
import { useLocation } from 'react-router-dom';


export default function AddEditBillPayment() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({});
    const [tabKey, setTabKey] = useState('gls');
    const [accountList, setAccountList] = useState([])
    const [glList, setglList] = useState([])
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation()
    const isAddMode = !id;
    console.log(location);

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
        ApiService.setHeader();
        return ApiService.patch('/billPayment/updateBillPaymentAndBill/' + state.id, data).then(response => {
            if (response.data.isSuccess) {
                navigate("/accountings/billpayments");
            }
        }).catch(e => {
            console.log(e.response.data.message);
        })
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");
        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents);
        }

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            let gl;
            let array = new Array()

            ApiService.setHeader();
            const gls = await ApiService.get(`generalLedger`)
            if (gls?.data.isSuccess) {
                console.log(gls?.data.documents);
                gls?.data.documents?.map(e => {
                    if (e.journalEntry?.id == id) {
                        array.push(e)
                    }
                })

                setglList(array)
            }

            ApiService.get(`billPayment/${id}`).then(response => {
                setLoderStatus("SUCCESS");
                console.log(response.data.document)
                const billDocument = response.data.document;
                reset(billDocument)
                setstate(response.data.document)
                setValue('bankAccount', billDocument.bankAccount);
                setValue('paymentDate', billDocument.paymentDate.split("T")[0]);
                setValue('journalType', billDocument.journalType);
                setValue('amount', billDocument.estimation.total);
                setValue('memo', billDocument.name);

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
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            {/* <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item> */}
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/accountings/bill/${state?.bill?.id}?mode=view` }} ><span className="breadcrum-label">{state?.bill?.name}</span></Breadcrumb.Item>
                            {/* <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/bill/${state?.id}?mode=view` }} ><span className="breadcrum-label">{state?.name}</span></Breadcrumb.Item> */}
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>Register Payment</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            {
                                state.bill?.paymentStatus !== "Paid" && <Button type="submit" variant="primary" size="sm">CREATE SA PAYMENT</Button>
                            }
                            <Button as={Link} to="/accountings/billpayments" variant="light" size="sm">DISCARD</Button>{" "}

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
                                    // disabled
                                    step="0.0001"
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    {...register("amount")}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bank</Form.Label>
                                <Form.Select id="bankAccount" name="bankAccount" {...register("bankAccount", { required: true })}>
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
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Reference Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="referenceNumber"
                                    name="referenceNumber"
                                    // disabled={true}
                                    {...register("referenceNumber")}
                                />
                            </Form.Group>
                        </Row>



                    </Container>

                    {
                        !isAddMode && (
                            <Container fluid>
                                <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                                    <Tab eventKey="gls" title="GL List">
                                        <GLList data={glList} />
                                    </Tab>

                                </Tabs>
                            </Container>
                        )
                    }


                </Container>
            </Form>
        </Container>
    )
}

