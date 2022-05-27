import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';


export default function AddEditBillPayment() {
    const [state, setstate] = useState();
    const [accountList, setAccountList] = useState([])
    const history = useHistory();
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

    const createDocument = async (data) => {
        console.log(data);
        try {
            ApiService.setHeader();
            const response = await ApiService.patch('/billPayment/updateBillPaymentAndBill/' + state.id, data)
            if (response.data.isSuccess) {
                // history.push("/purchase/bill/" + id);
                history.push("/purchase/billpayments");
            }
        } catch (err) {
            console.log(err.response.data.message);
            alert(err.response.data.message)
        }

    }


    useEffect(async () => {
        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents);
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`billPayment/${id}`).then(response => {
                console.log(response.data.document)
                const billPayment = response.data.document;
                setstate(response.data.document)
                setValue('bill', billPayment?.bill);
                setValue('journalType', billPayment.journalType);
                setValue('amount', billPayment.amount);
                setValue('memo', billPayment.name);
                setValue('bankAccount', billPayment.bankAccount);
                setValue('referenceNumber', billPayment.referenceNumber);
                setValue('paymentDate', billPayment.paymentDate.split("T")[0]);

            }).catch(e => {
                console.log(e)
            })
        }
    }, [])




    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item>
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/order/${state?.POId?.id}?mode=view` }} ><span className="breadcrum-label">{state?.POId?.name}</span></Breadcrumb.Item>
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/bill/${state?.bill?.id}?mode=view` }} ><span className="breadcrum-label">{state?.bill?.name}</span></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>Register Payment</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            {
                                state?.bill?.paymentStatus !== "Paid" && <Button type="submit" variant="primary" size="sm">CREATE PAYMENT</Button>
                            }
                            <Button as={Link} to="/purchase/billpayments" variant="light" size="sm">DISCARD</Button>{" "}

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
                                <Form.Select id="journalType" name="journalType" disabled={!isAddMode ? true : false} {...register("journalType", { required: true })}>
                                    <option value="Bank">Bank</option>
                                    <option value="Cash">Cash</option>

                                </Form.Select>
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Amount</Form.Label>
                                <Form.Control
                                    // disabled
                                    // step="0.0001"
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    {...register("amount")}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bank</Form.Label>
                                <Form.Select id="bankAccount" name="bankAccount" disabled={!isAddMode ? true : false} {...register("bankAccount", { required: true })}>
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
                                    disabled={!isAddMode ? true : false}
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
                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">referenceNumber</Form.Label>
                                <Form.Control
                                    disabled={!isAddMode ? true : false}
                                    type="text"
                                    id="referenceNumber"
                                    name="referenceNumber"
                                    {...register("referenceNumber")}
                                />
                            </Form.Group> */}
                        </Row>



                    </Container>

                </Container>
            </Form>
        </Container>
    )
}

