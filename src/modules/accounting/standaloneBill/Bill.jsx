import { React, useState, useEffect, useContext } from 'react'
import { BsTrash } from 'react-icons/bs';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, Breadcrumb, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import ApiService from '../../../helpers/ApiServices';
import { PurchaseOrderPDF } from '../../../helpers/PDF';
import { UserContext } from '../../../components/states/contexts/UserContext';

export default function Bill() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    // const [state, setState] = useState({});
    const [state, setstate] = useState({
        estimation: {
            untaxedAmount: 0,
            sgst: 0,
            cgst: 0,
            igst: 0,
            total: 0,
        }
    });
    const [accountList, setAccountList] = useState([])
    const [journals, setJournals] = useState([])
    const [tabKey, setTabKey] = useState('invoiceLines');
    const [productList, setProductList] = useState([]);
    const [billList, setbillList] = useState([])
    const [supplierList, setSupplierList] = useState([])
    const { dispatch, user } = useContext(UserContext)

    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            billDate: new Date().toISOString().split("T")[0]
        }
    });
    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    const onSubmit = (formData) => {
        // formData.total = total.total;
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        data.isStandalone = true;
        ApiService.setHeader();
        return ApiService.post('/bill/stansaloneBill', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/vendorbills/list`);
            }
        }).catch(e => {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)
        })

    }

    const updateDocument = (id, data) => {
        data.isStandalone = true;
        if (state.status !== "Posted") {
            ApiService.setHeader();
            return ApiService.patch(`/bill/updateStansaloneBill/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    navigate(`/${rootPath}/vendorbills/list`);
                }
            }).catch(e => {
                console.log(e.response.data.message);
                errorMessage(e, dispatch)
            })
        } else {
            alert("You can not update this document, as it is in Posted state.")
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
                navigate("/purchase/vendorbills");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        return ApiService.delete(`bill/${id}`).then(response => {
            navigate(`/${rootPath}/vendorbills/list`);

        }).catch(e => {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)
        })
    }

    const handleConfirmButton = async () => {
        console.log(state)
        const response = await ApiService.patch('bill/' + state.id, { status: "Posted", referenceNumber: getValues('referenceNumber') });
        console.log(response)
        if (response.data.isSuccess) {
            const itemReceipt = response.data.document;
            setstate(itemReceipt)
            reset(itemReceipt);
            if (itemReceipt.billDate) {
                setValue('billDate', itemReceipt.billDate.split("T")[0]);
            }


        }
    }

    const handleRegisterPaymentButton = async () => {
        await ApiService.post("/billPayment/createStandaloneBillPayment", state).then((res) => {
            if (res.data.isSuccess) {
                //history.push("/accountings/billpayment/" + )
                navigate(`/${rootPath}/billpayment/${res.data.document.id}`);
            }
        });
    }

    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generateStandaloneBillPDF(state.id);
        return;
    }

    const handleBillPayment = () => {
        navigate(`/accountings/bill/billpayments/${state?._id}`)
        //navigate(`/${rootPath}/billpayment/${res.data.document.id}`);
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");

        try {
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
                    console.log(itemReceipt);
                    setstate(itemReceipt)
                    reset(itemReceipt);
                    if (itemReceipt.billDate) {
                        setValue('billDate', itemReceipt.billDate.split("T")[0]);
                    }
                }

                // Find all bill payments related to each record
                const allBills = await ApiService.get(`billPayment/findBillsById/${response?.data.document?._id}`)
                if (allBills?.data.isSuccess) {
                    console.log(allBills?.data.documents);
                    setbillList(allBills?.data.documents)
                }
            }
        } catch (e) {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)

        }

    }, []);


    let grandtot = 0;
    let estimationArray = new Array();
    const updateOrderLines = (index) => {
        let cumulativeSum = 0, cgstSum = 0, sgstSum = 0, igstSum = 0;
        const products = getValues('invoiceLines')
        products.map((val) => {
            cumulativeSum += parseFloat(val.subTotal);
            cgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
            sgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
            igstSum += parseFloat(((val.taxes) * val.subTotal) / 100);
        });

        setValue("estimation", {
            untaxedAmount: cumulativeSum,
            cgst: cgstSum,
            sgst: sgstSum,
            igst: igstSum,
            total: parseFloat(cumulativeSum + igstSum)
        });
        setstate(prevState => ({
            ...prevState,    // keep all other key-value pairs
            estimation: {
                untaxedAmount: cumulativeSum,
                cgst: cgstSum,
                sgst: sgstSum,
                igst: igstSum,
                total: parseFloat(cumulativeSum + igstSum)
            }
        }));

    }


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
                        <Col><h3>{isAddMode ? "New Bill" : state.status + " Bill *" + state.name}</h3></Col>
                        {/* <Col>

                            <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col> */}
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/${rootPath}/bills`} variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item>
                                <Dropdown.Divider /> */}
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
                                {state.status == "Posted" && state.paymentStatus == "Paid" ? "" : <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button>}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
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
                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bill</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    disabled={true}
                                    {...register("name")}
                                />
                            </Form.Group> */}
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
                        <Row>
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
                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Recipient Bank</Form.Label>
                                <Form.Select id="recepientAccount" name="recepientAccount" {...register("recepientAccount")}>
                                    <option value={null}>Choose..</option>
                                    {accountList && accountList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group> */}

                        </Row>

                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="invoiceLines" title="Bill Lines">
                                <Card style={{ width: '100%', marginLeft: -2 }}>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Label</th>
                                                    {/* <th style={{ minWidth: "16rem" }}>Account</th> */}
                                                    <th style={{ minWidth: "2rem" }}>Quantity</th>
                                                    <th style={{ minWidth: "8rem" }}>Unit Price</th>
                                                    <th style={{ minWidth: "8rem" }}>Amount</th>
                                                    <th>Action</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceLineFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select id="product" name="product" {...register(`invoiceLines.${index}.product`)}
                                                                    onChange={async (e) => {
                                                                        const item = await ApiService.get('product/' + e.target.value);
                                                                        setValue(`invoiceLines.${index}.account`, item.data.document.assetAccount);
                                                                        setValue(`invoiceLines.${index}.unitPrice`, item.data.document.salesPrice);
                                                                        setValue(`invoiceLines.${index}.label`, item.data.document.description);
                                                                        setValue(`invoiceLines.${index}.taxes`, item.data.document.igstRate);
                                                                        setValue(`invoiceLines.${index}.cgstRate`, item.data.document.cgstRate);
                                                                        //setValue(`invoiceLines.${index}.cgst`, item.data.document.igstRate);
                                                                        setValue(`invoiceLines.${index}.sgstRate`, item.data.document.sgstRate);
                                                                        //setValue(`invoiceLines.${index}.sgst`, item.data.document.igstRate);
                                                                        setValue(`invoiceLines.${index}.igstRate`, item.data.document.igstRate);
                                                                        //setValue(`invoiceLines.${index}.igst`, item.data.document.igstRate);

                                                                        const values = getValues([`invoiceLines.${index}.unitPrice`, `invoiceLines.${index}.quantity`])
                                                                        console.log(values);
                                                                        setValue(`invoiceLines.${index}.subTotal`, parseInt(values[0]) * parseInt(values[1]))

                                                                        updateOrderLines(index)
                                                                    }}
                                                                >
                                                                    <option value={null}>Choose..</option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>

                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="label"
                                                                    name="label"
                                                                    {...register(`invoiceLines.${index}.label`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        {/* <td>
                                                            <Form.Group>
                                                                <Form.Select id="account" name="account" {...register(`invoiceLines.${index}.account`)}>
                                                                    <option value={null}>Choose..</option>
                                                                    {accountList && accountList.map((element, index) => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td> */}


                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`invoiceLines.${index}.quantity`)}
                                                                    onBlur={(e) => {
                                                                        const values = getValues([`invoiceLines.${index}.unitPrice`, `invoiceLines.${index}.quantity`])
                                                                        console.log(values);
                                                                        setValue(`invoiceLines.${index}.subTotal`, parseInt(values[0]) * parseInt(values[1]))
                                                                        updateOrderLines(index)
                                                                    }}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control

                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`invoiceLines.${index}.unitPrice`)}
                                                                    onBlur={() => {
                                                                        const values = getValues([`invoiceLines.${index}.unitPrice`, `invoiceLines.${index}.quantity`])
                                                                        console.log(values);
                                                                        setValue(`invoiceLines.${index}.subTotal`, parseInt(values[0]) * parseInt(values[1]))
                                                                        updateOrderLines(index)
                                                                    }}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`invoiceLines.${index}.subTotal`)} />
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    invoiceLineRemove(index)
                                                                    updateOrderLines(index)
                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => invoiceLineAppend({ label: "", quantity: 1, unitPrice: 0, subTotal: 0 })} >Add a line</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            {
                                !isAddMode && (
                                    <Tab eventKey="journalItems" title="Journal Items">
                                        <Card style={{ width: '100%', marginLeft: -2 }}>
                                            <Card.Header>Journal Items</Card.Header>
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
                                )
                            }

                        </Tabs>
                    </Container>
                    <Container className="mt-4 mb-4" fluid>
                        <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            <Col sm="12" md="4" >
                                <Card style={{ marginTop: -3 }}>
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

