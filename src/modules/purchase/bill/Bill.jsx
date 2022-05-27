import { React, useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, Breadcrumb, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import { PurchaseOrderPDF } from '../../../helpers/PDF';
import { UserContext } from '../../../components/states/contexts/UserContext';

export default function Bill() {
    const { user, dispatch } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    let { path, url } = useRouteMatch();
    const [state, setState] = useState({});
    const [billtotal, setbilltotal] = useState(0);
    const [billsgsttotal, setbillsgsttotal] = useState(0);
    const [billcgsttotal, setbillcgsttotal] = useState(0);
    const [billsubtotal, setbillsubtotal] = useState(0);
    const [accountList, setAccountList] = useState([])
    const [billList, setbillList] = useState([])
    const [journals, setJournals] = useState([])
    const [tabKey, setTabKey] = useState('invoiceLines');
    const [productList, setProductList] = useState([]);
    const [supplierList, setSupplierList] = useState([])

    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            total: 0,
            currency: null,
            subsidiary: null,
            location: null
        }
    });
    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        if (state.paymentStatus == "Paid") {
            alert("you can'tupdate this document")
        } else {
            ApiService.setHeader();
            return ApiService.post('/bill', data).then(response => {
                if (response.data.isSuccess) {
                    history.push("/purchase/vendorbills");
                }
            }).catch(e => {
                console.log(e.response?.data.message);
                errorMessage(e, dispatch)
            })
        }

    }

    const updateDocument = (id, data) => {
        if (state.status == "Posted") {
            alert("you can'tupdate this document")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/bill/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    history.push("/purchase/vendorbills");
                }
            }).catch(e => {
                console.log(e.response?.data.message);
                errorMessage(e, dispatch)
            })
        }


    }

    const validateReceivedProducts = () => {

        ApiService.setHeader();
        return ApiService.patch(`/itemReceipt/${id}`, { isReceived: true }).then(async (response) => {
            if (response.data.isSuccess) {
                state.items.forEach(async (item) => {
                    console.log(item._id)
                    const res = await ApiService.patch('product/' + item.item, { totalPurchasedQuantity: item.quantity, onHand: item.quantity });
                    console.log(res)
                });

                await ApiService.patch('purchaseOrder/' + state.createdFrom?.id, { status: 'Waiting Bills' })
                history.push("/purchase/vendorbills");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {

        return ApiService.delete(`bill/${id}`).then(response => {
            history.push("/purchase/bills");

        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })
    }

    const handleConfirmButton = async () => {
        console.log(state)
        try {
            const response = await ApiService.patch('bill/' + state.id, { status: "Posted", total: billtotal, referenceNumber: getValues('referenceNumber') });
            console.log(response)
            if (response.data.isSuccess) {
                const itemReceipt = response.data.document;
                setState(itemReceipt)
                reset(itemReceipt);
                if (itemReceipt.billDate) {
                    setValue('billDate', itemReceipt.billDate.split("T")[0]);
                }
            }
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        }
    }

    const handleRegisterPaymentButton = async () => {
        // setShowRegisterPaymentModal(true);
        // history.push("/purchase/billpayment/" + state.id);
        await ApiService.post("/billPayment/createStandaloneBillPayment", state).then((res) => {
            if (res.data.isSuccess) {
                console.log(res.data.document.id);
                history.push('/purchase/billpayment/' + res.data.document.id)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })
    }

    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generateBillPDF(state.id);
        return;
    }

    const handleBillPayment = () => {
        history.push(`/purchase/bill/billpayments/${state?._id}`)
    }


    useEffect(async () => {
        try {
            setLoderStatus("RUNNING");
            ApiService.setHeader();
            const supplierResponse = await ApiService.get('vendor');
            if (supplierResponse.data.isSuccess) {
                setSupplierList(supplierResponse.data.documents)
            }

            const accountResponse = await ApiService.get('account');
            if (accountResponse.data.isSuccess) {
                setAccountList(accountResponse.data.documents);
            }

            const productResponse = await ApiService.get('product');
            if (productResponse.data.isSuccess) {
                setProductList(productResponse.data.documents)
            }

            if (isAddMode) {
                setLoderStatus("SUCCESS");
            }

            if (!isAddMode) {
                ApiService.setHeader();
                const response = await ApiService.get(`bill/${id}`)
                if (response.data.isSuccess) {
                    setLoderStatus("SUCCESS");
                    const itemReceipt = response.data.document;
                    setState(itemReceipt)
                    console.log(itemReceipt);
                    reset(itemReceipt);
                    if (itemReceipt.billDate) {
                        setValue('billDate', itemReceipt.billDate.split("T")[0]);
                    }
                }

                const values = getValues('invoiceLines')
                let tot = 0;
                let cgsttot = 0;
                let sgsttot = 0;
                let subtot = 0;
                values.map(e => {
                    // tot += ((parseFloat(e.subTotal) * parseInt(e.taxes)) / 100) + parseFloat(e.subTotal)
                    tot += parseFloat(e.subTotal)
                    cgsttot += ((parseFloat(e.subTotal) * (parseInt(e.taxes) / 2)) / 100)
                    sgsttot += ((parseFloat(e.subTotal) * (parseInt(e.taxes) / 2)) / 100)
                    subtot += parseFloat(e.subTotal)
                })
                setbilltotal(tot)
                setbillcgsttotal(cgsttot)
                setbillsgsttotal(sgsttot)
                setbillsubtotal(subtot)

                // Find all bill payments related to each record
                const allBills = await ApiService.get(`billPayment/findBillsById/${response?.data.document?._id}`)
                if (allBills?.data.isSuccess) {
                    console.log(allBills?.data.documents);
                    setbillList(allBills?.data.documents)
                }
            }
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)

        }

    }, []);

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
                        <Col>


                            <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item>
                                {
                                    state?.sourceDocument ? <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item> :
                                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/order/${state?.attachedPO?._id}?mode=view` }} ><span className="breadcrum-label">{state?.attachedPO?.name}</span></Breadcrumb.Item>
                                }
                                {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {/* <Button type="submit" variant="primary" size="sm">SAVE</Button> */}
                            <Button as={Link} to={state?.attachedPO ? `/purchase/order/${state?.attachedPO?._id}` : `/${url?.split('/')[1]}/bills`} variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && state.status === "Draft" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}

                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">

                                {state.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                                {(state.status == "Posted" && state.paymentStatus == "Not Paid") || (state.status == "Posted" && state.paymentStatus == "Partially Paid") ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                                {!isAddMode && state.status === "Posted" && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            {
                                <div className="m-2 d-flex justify-content-end">
                                    {!isAddMode && billList?.length ? <Button size="sm" onClick={handleBillPayment} varient="primary">Bill Payments</Button> : ""}
                                </div>
                            }
                            {/* <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> */}
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.paymentStatus}</div>}
                            </div>
                        </Col>
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Source Document</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="sourceDocument"
                                    name="sourceDocument"
                                    disabled={true}
                                    {...register("sourceDocument.name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Vendor</Form.Label>
                                <Form.Select id="vendor" name="vendor" {...register("vendor")}>
                                    <option value={null}>Choose..</option>
                                    {supplierList && supplierList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bill Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="billDate"
                                    name="billDate"
                                    // disabled={true}
                                    {...register("billDate")}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Recipient Bank</Form.Label>
                                <Form.Select id="recepientAccount" name="recepientAccount" {...register("recepientAccount")}>
                                    <option value={null}>Choose..</option>
                                    {accountList && accountList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Reference Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="referenceNumber"
                                    name="referenceNumber"
                                    // disabled={true}
                                    {...register("referenceNumber")}
                                />
                            </Form.Group> */}
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Remaining Amount To Pay</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="remainAmountToPay"
                                    name="remainAmountToPay"
                                    disabled={true}
                                    {...register("remainAmountToPay")}
                                />
                            </Form.Group>
                        </Row>

                    </Container>
                    <Container className='p-0' fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)}>
                            <Tab eventKey="invoiceLines" title="Invoice Lines">
                                <Card className='p-0 m-0' style={{ width: "100%" }}>
                                    <Card.Header>Invoice Lines</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Label</th>
                                                    <th style={{ minWidth: "16rem" }}>Account</th>
                                                    <th style={{ minWidth: "2rem" }}>Quantity</th>
                                                    <th style={{ minWidth: "2rem" }}>HSN Code</th>
                                                    <th style={{ minWidth: "2rem" }}>IGST</th>
                                                    <th style={{ minWidth: "2rem" }}>CGST</th>
                                                    <th style={{ minWidth: "2rem" }}>SGST</th>
                                                    <th style={{ minWidth: "8rem" }}>Unit Price</th>
                                                    <th style={{ minWidth: "8rem" }}>Amount</th>


                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceLineFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select disabled id="product" name="product" {...register(`invoiceLines.${index}.product`)}>

                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>

                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="text"
                                                                    id="label"
                                                                    name="label"
                                                                    {...register(`invoiceLines.${index}.label`)}
                                                                >
                                                                    {/* <option value={null}>Select...</option>
                                                                {unitList && unitList.map((element, index) => {
                                                                    return <option key={index} value={element._id}>{element.value}</option>
                                                                })} */}
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select disabled id="account" name="account" {...register(`invoiceLines.${index}.account`)}>
                                                                    <option value={null}>Choose..</option>
                                                                    {accountList && accountList.map((element, index) => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>


                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`invoiceLines.${index}.quantity`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="hsnCode"
                                                                    name="hsnCode"
                                                                    {...register(`invoiceLines.${index}.hsnCode`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="taxes"
                                                                    name="taxes"
                                                                    {...register(`invoiceLines.${index}.taxes`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="sgst"
                                                                    name="sgst"
                                                                    {...register(`invoiceLines.${index}.sgst`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="cgst"
                                                                    name="cgst"
                                                                    {...register(`invoiceLines.${index}.cgst`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`invoiceLines.${index}.unitPrice`)}
                                                                    onBlur={() => {
                                                                        const values = getValues([`items.${index}.unitPrice`, `items.${index}.quantity`])
                                                                        console.log(values);
                                                                        setValue(`items.${index}.subTotal`, parseInt(values[0]) * parseInt(values[1]))
                                                                        let grandtot = 0;
                                                                        const vals = getValues('items')
                                                                        console.log(vals);
                                                                        vals.map((val) => {
                                                                            grandtot = grandtot + parseInt(val.subTotal);
                                                                            console.log(grandtot);
                                                                        })
                                                                        setValue("total", grandtot)
                                                                        grandtot = 0;
                                                                    }}
                                                                >
                                                                    {/* <option value={null}>Select...</option>
                                                                    {unitList && unitList.map((element, index) => {
                                                                        return <option key={index} value={element._id}>{element.value}</option>
                                                                    })} */}
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`invoiceLines.${index}.subTotal`)} />
                                                            </Form.Group>
                                                        </td>

                                                        {/* <td>
                                                            <Button style={{ minWidth: "8rem" }} size="sm" variant="danger"
                                                                onClick={() => {
                                                                    invoiceLineRemove(index)

                                                                }}
                                                            >Delete</Button>
                                                        </td> */}
                                                    </tr>
                                                    )
                                                })}
                                                {/* <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => invoiceLineAppend({})} >Add a line</Button>
                                                    </td>
                                                </tr> */}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="journalItems" title="Journal Items">
                                <Card style={{ width: '100%', marginLeft: -1, marginTop: 0 }}>
                                    <Card.Header>Journals</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Account</th>
                                                    <th style={{ minWidth: "16rem" }}>Label</th>
                                                    <th style={{ minWidth: "16rem" }}>Debit</th>
                                                    <th style={{ minWidth: "16rem" }}>Credit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {journalItemFields.map((field, index) => {
                                                    return <tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select disabled id="account" name="account" {...register(`journalItems.${index}.account`)}>
                                                                    <option value={null}>Choose..</option>
                                                                    {accountList && accountList.map((element, index) => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="text"
                                                                    id="label"
                                                                    name="label"
                                                                    {...register(`journalItems.${index}.label`)} />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="debit"
                                                                    name="debit"
                                                                    {...register(`journalItems.${index}.debit`)} />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="credit"
                                                                    name="credit"
                                                                    {...register(`journalItems.${index}.credit`)} />
                                                            </Form.Group>
                                                        </td>
                                                    </tr>
                                                })}

                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>

                        </Tabs>
                    </Container>
                    <Container className="mt-4 mb-4" style={{ marginTop: -10 }} fluid>
                        <Row style={{ marginTop: -5 }}>
                            <Col sm="12" md="8">
                                {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group> */}
                            </Col>
                            <Col sm="12" md="4">
                                <Card>
                                    {/* <Card.Header as="h5">Featured</Card.Header> */}
                                    <Card.Body>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>Sub Total:</Col>
                                            <Col>{formatNumber(state.estimation?.untaxedAmount)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>CGST:</Col>
                                            <Col>{formatNumber(state.estimation?.cgst)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>SGST:</Col>
                                            <Col>{formatNumber(state.estimation?.sgst)}</Col>
                                        </Row>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state.estimation?.total)}</Col>
                                        </Row>


                                        {/* <Row style={{ textAlign: 'right', fontSize: '20px' }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(billtotal)}</Col>
                                        </Row> */}

                                    </Card.Body>
                                </Card>

                            </Col>
                        </Row>

                    </Container>
                </Container>
            </Form>
        </Container>
    )
}

