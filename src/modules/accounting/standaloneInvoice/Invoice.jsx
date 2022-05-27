import { React, useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form';
// import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import { Container, Form, Row, Tabs, Tab, Card, Breadcrumb, Table, Button, Col, ButtonGroup, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FadeLoader, PropagateLoader } from "react-spinners";
// import { requestForStandaloneInvoice, getStandaloneInvoiceData } from './../../../components/states/actions/standaloneInvoiceAction'
// import standaloneReducer from '../../../components/states/reducers/standaloneReducer';
import { formatNumber } from '../../../helpers/Utils';
import ApiService from '../../../helpers/ApiServices';
import { SalesOrderPDF } from '../../../helpers/PDF';



export default function Invoice() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [showRegisterPaymentModal, setShowRegisterPaymentModal] = useState(false);
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
    const [total, settotal] = useState({});
    const [accountList, setAccountList] = useState([])
    const [journals, setJournals] = useState([])
    const [tabKey, setTabKey] = useState('invoiceLines');
    const [productList, setProductList] = useState([]);
    const [customerList, setCustomerList] = useState([])


    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            // total: 0,
            invoiceDate: new Date().toISOString().split("T")[0],

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
        data.isStandalone = true;
        console.log(data);
        ApiService.setHeader();
        return ApiService.post('/invoice/createStandaloneInv', data).then(response => {
            if (response.data.isSuccess) {
                navigate("/accountings/invoices");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const updateDocument = (id, data) => {
        data.isStandalone = true;
        if (state.status !== "Posted") {
            ApiService.setHeader();
            return ApiService.patch(`/invoice/updateStandaloneInv/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    navigate("/accountings/invoices");
                }
            }).catch(e => {
                console.log(e);
            })
        } else {
            alert("you can not update this document!!!")
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
                navigate("/purchase/bills");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {

        return ApiService.delete(`invoice/${id}`).then(response => {
            navigate("/accountings/invoices");

        }).catch(e => {
            console.log(e);
        })
    }

    const handleConfirmButton = async () => {
        console.log(state)
        const response = await ApiService.patch('invoice/' + state.id, { status: "Posted" });
        console.log(response)
        if (response.data.isSuccess) {
            const itemReceipt = response.data.document;
            setstate(itemReceipt)
            reset(itemReceipt);
            if (itemReceipt.invoiceDate) {
                setValue('invoiceDate', itemReceipt.invoiceDate.split("T")[0]);
            }


        }
    }

    const handleRegisterPaymentButton = async () => {
        // setShowRegisterPaymentModal(true);
        await ApiService.post("/invoicepayment/stansaloneInvoice", state).then((res) => {
            if (res.data.isSuccess) {
                console.log(res.data.document.id);
                navigate('/accountings/invoicePayment/' + res.data.document.id)
            }
        });

    }

    const closeRegisterPaymentModel = () => {
        setShowRegisterPaymentModal(false);
    }


    const handleInvoicePrinting = async () => {
        SalesOrderPDF.generateStandaloneInvoicePdDF(state.id)
        return;
        // // setisPrint(false)
        // let itemObjects = new Array();
        // // console.log(state);
        // state.invoiceLines.map(async (item) => {
        //     let newObject = new Object();
        //     let itemData = await ApiService.get(`product/${item.product}`);

        //     newObject.product = itemData.data.document.name;
        //     newObject.label = item.label;
        //     newObject.quantity = item.quantity;
        //     newObject.unitPrice = item.unitPrice;
        //     newObject.subTotal = item.subTotal;


        //     // console.log(itemData.data.document.name);
        //     // console.log(newObject);
        //     itemObjects.push(newObject);
        // })
        // // console.log(itemObjects);

        // const customerData = await ApiService.get(`customer/${state.customer}`)
        // // console.log(supplierData);
        // // const POData = await ApiService.get(`purchaseOrder/${id}`)
        // // console.log(POData);
        // var doc = new jsPDF('p', "pt", "a4");

        // doc.setFontSize(12);
        // doc.text("Ship Address:", 40, 65);
        // // doc.line(40, 68, 90, 68)
        // doc.setFontSize(9);
        // doc.text(`${state.shipAddress}`, 40, 80);

        // doc.setFontSize(12);
        // doc.text("Customer Address:", 400, 65)
        // doc.setFontSize(9);
        // doc.text(`${customerData.data.document.address}`, 400, 80);

        // doc.setFontSize(19)
        // doc.text(`Invoice: #INV0000${state.InvoiceId}`, 40, 140)

        // // doc.setFontSize(12);
        // // doc.text("Purchase Representative", 40, 160)
        // // doc.setFontSize(9);
        // // doc.text(`Rehan Nawaz`, 40, 170);

        // doc.setFontSize(12);
        // doc.text(`Order Date: ${state.invoiceDate?.slice(0, 10)}`, 400, 160)
        // // doc.setFontSize(9);
        // // doc.text(`${state.date.slice(0, 10)}`, 400, 170);

        // let height = 0;

        // // Create the table of items data
        // doc.autoTable({
        //     margin: { top: 220 },
        //     styles: {
        //         lineColor: [44, 62, 80],
        //         lineWidth: 1,
        //     },
        //     columnStyles: {
        //         europe: { halign: 'center' },
        //         0: { cellWidth: 88 },
        //         2: { cellWidth: 40 },
        //         3: { cellWidth: 57 },
        //         4: { cellWidth: 65 },
        //     }, // European countries centered
        //     body: itemObjects,
        //     columns: [
        //         { header: 'Product', dataKey: 'product' },
        //         { header: 'Label', dataKey: 'label' },
        //         { header: 'Qty', dataKey: 'quantity' },
        //         { header: 'UnitPrice', dataKey: 'unitPrice' },
        //         { header: 'Sub Total', dataKey: 'subTotal' },
        //     ],
        //     didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        // })

        // console.log(height);
        // let h = height + 30;

        // doc.setFontSize(19);
        // doc.text(`Total: ${state.total}`, 400, h);

        // doc.save('INV.pdf');
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");
        ApiService.setHeader();


        const customerResponse = await ApiService.get('customer');
        console.log(customerResponse.data.documents)
        if (customerResponse.data.isSuccess) {
            setCustomerList(customerResponse.data.documents)
        }

        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents);
        }

        const productResponse = await ApiService.get('product');
        console.log(productResponse.data.documents)

        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
        }

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {

            ApiService.setHeader();
            const response = await ApiService.get(`invoice/${id}`)
            console.log(response);
            if (response.data.isSuccess) {
                setLoderStatus("SUCCESS");
                const itemReceipt = response.data.document;

                setstate(itemReceipt)
                reset(itemReceipt);
                if (itemReceipt.invoiceDate) {
                    setValue('invoiceDate', itemReceipt.invoiceDate.split("T")[0]);
                }
            }

            // let val = getValues('invoiceLines');
            // console.log(val);
            // let t = 0;
            // val.map((e) => {
            //     t += parseInt(e.subTotal);
            // })
            // console.log(t);
            // settotal({ total: t })
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
    } else {
        return (
            <Container className="pct-app-content-container p-0 m-0" fluid>
                <RegisterPaymentModal show={showRegisterPaymentModal} handleClose={closeRegisterPaymentModel} parentState={state} />
                <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                    <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                        <Row>
                            <Col><h3>{isAddMode ? "New Invoice" : state.status + " Invoice *" + state.name}</h3></Col>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                        <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/sales/orders' }} ><h3 className="breadcrum-label">Sales Orders</h3></Breadcrumb.Item>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/sales/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                        {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                    </Breadcrumb> */}
                        </Row>
                        <Row>
                            <Col>
                                <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                                <Button as={Link} to="/accountings/invoices" variant="light" size="sm">DISCARD</Button>
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
                                    {!isAddMode && <Button onClick={handleInvoicePrinting} type="button" variant="primary">PRINT INVOICE</Button>}
                                    {state.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                                    {state.status == "Posted" && state.paymentStatus == "Not Paid" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}

                                </ButtonGroup>
                            </Col>
                            <Col style={{ display: 'flex', justifyContent: 'end' }}>
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
                                    <Form.Label className="m-0">Invoice</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="name"
                                        name="name"
                                        disabled={true}
                                        {...register("name")}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} md="4" className="mb-2">
                                    <Form.Label className="m-0">Customer</Form.Label>
                                    <Form.Select id="customer" name="customer" {...register("customer", { required: true })} data-live-search="true">
                                        <option value={null}>Choose..</option>
                                        {customerList?.map((element, index) => {
                                            return <option key={index} value={element.id}>{element.name}</option>
                                        })}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group as={Col} md="4" className="mb-2">
                                    <Form.Label className="m-0">Invoice Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        id="invoiceDate"
                                        name="invoiceDate"
                                        // disabled={true}
                                        {...register("invoiceDate")}
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
                                    <Form.Label className="m-0">Invoice Date</Form.Label>
                                    <Form.Control
                                        disabled
                                        type="text"
                                        id="isStandalone"
                                        name="isStandalone"
                                        value={true}
                                        // disabled={true}
                                        {...register("isStandalone")}
                                    />
                                </Form.Group> */}
                            </Row>

                        </Container>
                        <Container fluid>
                            <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                                <Tab eventKey="invoiceLines" title="Invoice Lines" >
                                    <Card style={{ width: '100%' }}>
                                        <Card.Header>Products</Card.Header>
                                        <Card.Body className="card-scroll">
                                            <Table responsive striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th style={{ minWidth: "16rem" }}>Product</th>
                                                        <th style={{ minWidth: "16rem" }}>Label</th>
                                                        <th style={{ minWidth: "16rem" }}>Account</th>
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
                                                                        disabled={state.paymentStatus == "Paid" ? true : false}
                                                                        onChange={async (e) => {
                                                                            const item = await ApiService.get('product/' + e.target.value);
                                                                            setValue(`invoiceLines.${index}.units`, item.data.document.uom);
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

                                                                            // let val = getValues('invoiceLines');
                                                                            // let t = 0;
                                                                            // console.log(val);
                                                                            // val?.map((e) => {
                                                                            //     t += parseInt(e.subTotal);
                                                                            // })
                                                                            // settotal({ total: t })
                                                                        }}
                                                                    >
                                                                        <option value={null}>Select...</option>
                                                                        {productList.map(element => {
                                                                            return <option value={element.id}>{element.name}</option>
                                                                        })}
                                                                    </Form.Select>
                                                                    {/* <Form.Control as="select" id="item" {...register(`items.${index}.item`)}
                                                                onChange={async (e) => {
                                                                    const item = await ApiService.get('item/' + e.target.value);
                                                                    setValue(`items.${index}.units`, item.data.document.units);
                                                                    setValue(`items.${index}.rate`, item.data.document.basePrice);
                                                                    setValue(`items.${index}.description`, item.data.document.itemDescription);
                                                                }} >
                                                                <option value={null}>Select...</option>
                                                                {itemList && itemList.map((element, index) => {
                                                                    return <option key={index} value={element.id}>{element.name}</option>
                                                                })}
                                                            </Form.Control> */}
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        disabled={state.paymentStatus == "Paid" ? true : false}
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
                                                                    <Form.Select disabled={state.paymentStatus == "Paid" ? true : false} id="account" name="account" {...register(`invoiceLines.${index}.account`)}>
                                                                        <option value={null}>Choose..</option>
                                                                        {accountList && accountList.map((element, index) => {
                                                                            return <option key={index} value={element.id}>{element.name}</option>
                                                                        })}
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </td>


                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        disabled={state.paymentStatus == "Paid" ? true : false}
                                                                        type="number"
                                                                        id="quantity"
                                                                        name="quantity"
                                                                        {...register(`invoiceLines.${index}.quantity`)}
                                                                        onBlur={(e) => {
                                                                            const values = getValues([`invoiceLines.${index}.unitPrice`, `invoiceLines.${index}.quantity`]);
                                                                            setValue(`invoiceLines.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                            updateOrderLines(index)
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
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        disabled={state.paymentStatus == "Paid" ? true : false}
                                                                        type="number"
                                                                        id="unitPrice"
                                                                        name="unitPrice"
                                                                        {...register(`invoiceLines.${index}.unitPrice`)}
                                                                        onBlur={() => {
                                                                            const values = getValues([`invoiceLines.${index}.unitPrice`, `invoiceLines.${index}.quantity`]);
                                                                            setValue(`invoiceLines.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                            updateOrderLines(index)
                                                                        }}
                                                                    // onBlur={() => {
                                                                    //     const values = getValues([`invoiceLines.${index}.unitPrice`, `invoiceLines.${index}.quantity`])
                                                                    //     console.log(values);
                                                                    //     setValue(`invoiceLines.${index}.subTotal`, parseInt(values[0]) * parseInt(values[1]))

                                                                    //     let val = getValues('invoiceLines');
                                                                    //     let t = 0;
                                                                    //     val?.map((e) => {
                                                                    //         t += parseInt(e.subTotal);
                                                                    //     })
                                                                    //     console.log(t);
                                                                    //     settotal({ total: t })
                                                                    // }}
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
                                                                    <Form.Control
                                                                        disabled={state.paymentStatus == "Paid" ? true : false}
                                                                        type="number"
                                                                        id="subTotal"
                                                                        name="subTotal"
                                                                        {...register(`invoiceLines.${index}.subTotal`)} />
                                                                </Form.Group>
                                                            </td>

                                                            <td>
                                                                <Button style={{ minWidth: "8rem" }} size="sm" variant="danger"
                                                                    disabled={state.paymentStatus == "Paid" ? true : false}
                                                                    onClick={() => {
                                                                        invoiceLineRemove(index)
                                                                        updateOrderLines(index)
                                                                        // let val = getValues('invoiceLines');
                                                                        // console.log(val);
                                                                        // let t = 0;
                                                                        // val.map((e) => {
                                                                        //     t += parseInt(e.subTotal);
                                                                        // })
                                                                        // console.log(t);
                                                                        // settotal({ total: t })
                                                                    }}
                                                                >Delete</Button>
                                                            </td>
                                                        </tr>
                                                        )
                                                    })}
                                                    <tr>
                                                        <td colSpan="14">
                                                            <Button disabled={state.paymentStatus == "Paid" ? true : false} size="sm" style={{ minWidth: "8rem" }} onClick={() => invoiceLineAppend({ quantity: 1, subTotal: 0, unitPrice: 0, label: "" })} >Add a line</Button>
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
                                            <Card style={{ width: '100%' }}>
                                                <Card.Header>Products</Card.Header>
                                                <Card.Body className="card-scroll">
                                                    <Table responsive striped bordered hover size="sm">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ minWidth: "16rem" }}>Account</th>
                                                                <th style={{ minWidth: "16rem" }}>Label</th>
                                                                <th style={{ minWidth: "16rem" }}>Debit</th>
                                                                <th style={{ minWidth: "16rem" }}>Credit</th>
                                                                <th style={{ minWidth: "8rem" }}>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {journalItemFields.map((field, index) => {
                                                                return <tr key={field.id}>
                                                                    <td>
                                                                        <Form.Group>
                                                                            <Form.Select id="account" name="account" {...register(`journalItems.${index}.account`)}>
                                                                                <option value={null}>Choose..</option>
                                                                                {accountList && accountList.map((element, index) => {
                                                                                    return <option key={index} value={element.id}>{element.name}</option>
                                                                                })}
                                                                            </Form.Select>
                                                                        </Form.Group>
                                                                    </td>
                                                                    <td>
                                                                        <Form.Group >
                                                                            <Form.Control
                                                                                type="text"
                                                                                id="label"
                                                                                name="label"
                                                                                {...register(`journalItems.${index}.label`)} />
                                                                        </Form.Group>
                                                                    </td>
                                                                    <td>
                                                                        <Form.Group >
                                                                            <Form.Control
                                                                                type="number"
                                                                                id="debit"
                                                                                name="debit"
                                                                                {...register(`journalItems.${index}.debit`)} />
                                                                        </Form.Group>
                                                                    </td>
                                                                    <td>
                                                                        <Form.Group >
                                                                            <Form.Control
                                                                                type="number"
                                                                                id="credit"
                                                                                name="credit"
                                                                                {...register(`journalItems.${index}.credit`)} />
                                                                        </Form.Group>
                                                                    </td>
                                                                    <td>
                                                                        <Button style={{ minWidth: "8rem" }} size="sm" variant="danger"
                                                                            onClick={() => {
                                                                                journalItemRemove(index)

                                                                            }}
                                                                        >Delete</Button>
                                                                    </td>
                                                                </tr>
                                                            })}

                                                            <tr>
                                                                <td colSpan="14">
                                                                    <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => journalItemAppend({})} >Add a line</Button>
                                                                </td>
                                                            </tr>


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
                                    {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Control as="textarea" placeholder="Define your terms and conditions" rows={3} />
                            </Form.Group> */}
                                </Col>
                                <Col sm="12" md="4">
                                    <Card>
                                        {/* <Card.Header as="h5">Featured</Card.Header> */}
                                        <Card.Body>
                                            <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                                <Col>Untaxed Amount:</Col>
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


                                        </Card.Body>
                                    </Card>

                                </Col>
                            </Row>

                        </Container>
                    </Container>
                </Form >
            </Container >
        )
    }

}


function RegisterPaymentModal({ show, handleClose, parentState }) {
    const [state, setState] = useState({});
    const [accountList, setAccountList] = useState([]);
    console.log(parentState)
    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            journalType: 'Bank',
            account: parentState.recepientAccount,
            memo: parentState.name,
            amount: parentState.total,
            paymentDate: new Date().toISOString().split("T")[0]
        }
    });

    useEffect(() => {
        ApiService.get('account').then(response => {
            setAccountList(response.data.documents);
        });

        setValue('journalType', 'Bank');
        setValue('account', parentState.recepientAccount);
        setValue('memo', parentState.name);
        setValue('amount', parentState.total);
    }, [parentState])





    return <Modal size="lg" show={show} onHide={handleClose} animation={false}>
        <Modal.Header >
            <Modal.Title>Register Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Container fluid>
                <Form>
                    <Row>
                        <Form.Group as={Col} md="6" className="mb-2">
                            <Form.Label className="m-0">Journal</Form.Label>
                            <Form.Select id="journalType" name="journalType" {...register('journalType')} >
                                <option value="Bank">Bank</option>
                                <option value="Cash">Cash</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md="6" className="mb-2">
                            <Form.Label className="m-0">Amount</Form.Label>
                            <Form.Control
                                type="text"
                                id="amount"
                                name="amount" {...register('amount')}
                            />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col} md="6" className="mb-2">
                            <Form.Label className="m-0">Recipient Bank Account</Form.Label>
                            <Form.Select id="account" name="account" {...register("account")}>
                                <option value={null}>Choose..</option>
                                {accountList && accountList.map((element, index) => {
                                    return <option key={index} value={element.id}>{element.name}</option>
                                })}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md="6" className="mb-2">
                            <Form.Label className="m-0">Payment Date</Form.Label>
                            <Form.Control
                                type="date"
                                id="paymentDate"
                                name="paymentDate" {...register('paymentDate')}
                            />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col} md="6" className="mb-2">
                            <Form.Label className="m-0">Memo</Form.Label>
                            <Form.Control
                                type="text"
                                id="memo"
                                name="memo" {...register('memo')}
                            />
                        </Form.Group>

                    </Row>

                </Form>

            </Container>


        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                CANCEL
            </Button>
            <Button variant="primary" onClick={handleClose}>
                CREATE PAYMENT
            </Button>
        </Modal.Footer>
    </Modal>
}