import { React, useContext, useState, useEffect } from 'react';
import { BsTrash } from 'react-icons/bs';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import 'tippy.js/themes/light.css'; // optional
import 'tippy.js/animations/scale.css';
import 'tippy.js/animations/scale-subtle.css';
import 'tippy.js/animations/scale-extreme.css';
import { useHistory, useParams } from 'react-router';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import { SalesOrderPDF } from '../../../helpers/PDF';
import { UserContext } from '../../../components/states/contexts/UserContext';


export default function SalesOrder() {
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [productDeliveryCount, setProductDeliveryCount] = useState(0);
    const [invoicedCount, setInvoicedCount] = useState(0);
    const [state, setstate] = useState({
        estimation: {
            untaxedAmount: 0,
            sgst: 0,
            cgst: 0,
            igst: 0,
            total: 0,
        }
    });
    const [customerList, setCustomerList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [productInfo, setproductInfo] = useState({});
    const [uomList, setuomList] = useState([]);
    const [tabKey, setTabKey] = useState('products');
    const [isstatetax, setisstatetax] = useState(false);
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;
    // let statetax = false;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            customer: null,
            total: 0,
            invoiceStatus: 'Nothing to Invoice',
            deliveryDate: new Date().toISOString().split("T")[0],
            date: new Date().toISOString().split("T")[0]
        }
    });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });

    const onSubmit = (formData) => { return isAddMode ? createDocument(formData) : updateDocument(id, formData); }

    let totalSalesQuantity = 0;
    let totalInvoicedQuantity = 0;
    let totalDeliveredQuantity = 0;
    let totalDelivered = 0;
    let totalInvoiced = 0;

    const createDocument = (data) => {
        console.log(data);
        ApiService.setHeader();
        return ApiService.post('/salesOrder/procedure', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/sales/orders");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/salesOrder/procedure/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/sales/orders");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })
    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/salesOrder/delete/${id}`).then(response => {
            if (response.status == 204) {
                history.push("/sales/orders");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })
    }

    const handleDeliveryProducts = () => {
        history.push("/sales/productdelivery/" + state.productDelivery);
    }

    const openDeliveredProduct = () => {
        history.push("/sales/delivered/" + state.id);
    }

    const handleCreateInvoice = async () => {
        state?.products?.map(e => {
            totalDelivered += parseInt(e.delivered)
            totalInvoiced += parseInt(e.invoiced)
        })
        if (totalDelivered === totalInvoiced) {
            alert("Please Delivered product first!!!")
        } else {
            try {
                const response = await ApiService.post('invoice', { sourceDocument: state.id })
                if (response.data.isSuccess) {
                    //
                    const res = await ApiService.patch('salesOrder/decreseProductOnhandAndAvailabel/' + response.data.document._id, response.data.document)
                    if (res.data.isSuccess) {
                        const PO = await ApiService.get('salesOrder/' + state.id);
                        console.log(PO);
                        PO.data.document?.products?.map(e => {
                            console.log(e);
                            totalSalesQuantity += parseInt(e.quantity);
                            totalInvoicedQuantity += parseInt(e.invoiced);
                            totalDeliveredQuantity += parseInt(e.delivered);
                        })
                        console.log("totalSalesQuantity: ", totalSalesQuantity);
                        console.log("totalInvoicedQuantity: ", totalInvoicedQuantity);
                        console.log("totalDeliveredQuantity: ", totalDeliveredQuantity);

                        if (totalSalesQuantity === totalDeliveredQuantity && totalSalesQuantity === totalInvoicedQuantity) {
                            await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Invoiced' }).then(async res => {
                                if (res.data.isSuccess) {
                                    // await ApiService.patch('salesOrder/decreseProductOnhandAndAvailabel/' + res.data.document._id, res.data.document).then(r => {
                                    //     if (r.data.isSuccess) {
                                    history.push("/sales/invoice/" + response.data.document.id);
                                    //     }
                                    // })
                                }
                            }).catch(e => {
                                console.log(e.response?.data.message);
                                errorMessage(e, dispatch)
                            });
                        } else if (totalSalesQuantity === totalInvoicedQuantity) {
                            await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Delivered / Partially Invoiced' })
                        } else {
                            await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Partially Delivered / Invoiced' })
                        }
                        // await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
                        history.push("/sales/invoice/" + response.data.document.id);
                    } else {
                        alert("something wrong in calculating product onhand qty!!!")
                    }
                    //

                    // const PO = await ApiService.get('salesOrder/' + state.id);
                    // console.log(PO);
                    // PO.data.document?.products?.map(e => {
                    //     console.log(e);
                    //     totalSalesQuantity += parseInt(e.quantity);
                    //     totalInvoicedQuantity += parseInt(e.invoiced);
                    //     totalDeliveredQuantity += parseInt(e.delivered);
                    // })
                    // console.log("totalSalesQuantity: ", totalSalesQuantity);
                    // console.log("totalInvoicedQuantity: ", totalInvoicedQuantity);
                    // console.log("totalDeliveredQuantity: ", totalDeliveredQuantity);

                    // if (totalSalesQuantity === totalDeliveredQuantity && totalSalesQuantity === totalInvoicedQuantity) {
                    //     await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Invoiced' }).then(async res => {
                    //         if (res.data.isSuccess) {
                    //             // await ApiService.patch('salesOrder/decreseProductOnhandAndAvailabel/' + res.data.document._id, res.data.document).then(r => {
                    //             //     if (r.data.isSuccess) {
                    //             history.push("/sales/invoice/" + response.data.document.id);
                    //             //     }
                    //             // })
                    //         }
                    //     })

                    // } else if (totalSalesQuantity === totalInvoicedQuantity) {
                    //     await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Fully Delivered / Partially Invoiced' })
                    // } else {
                    //     await ApiService.patch('salesOrder/' + state.id, { invoiceStatus: 'Partially Delivered / Invoiced' })
                    // }

                    // // await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
                    // history.push("/sales/invoice/" + response.data.document.id);
                }
            } catch (e) {
                console.log(e.response?.data.message);
                errorMessage(e, dispatch)
            }
        }
    }

    const handleCustomerInvoice = async () => {
        history.push("/sales/invoiced/" + state.id);
    }

    const handleCreateProductDelivery = async () => {
        history.push("/sales/delivery/" + state.productDelivery);
    }

    const handlePrintOrder = async () => {
        SalesOrderPDF.generateSalesOrderPDF(state.id);
        return;
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        try {
            const customerResponse = await ApiService.get('customer');
            console.log(customerResponse.data.documents)
            if (customerResponse.data.isSuccess) {
                setCustomerList(customerResponse.data.documents)
            }

            const productResponse = await ApiService.get('product');
            console.log(productResponse.data.documents)
            if (productResponse.data.isSuccess) {
                setProductList(productResponse.data.documents)
            }

            const uomResponse = await ApiService.get('uom');
            console.log(uomResponse.data.documents)
            if (uomResponse.data.isSuccess) {
                setuomList(uomResponse.data.documents)
            }

            if (isAddMode) {
                setLoderStatus("SUCCESS");
            }

            if (!isAddMode) {
                ApiService.setHeader();

                const productDeliveryResponse = await ApiService.get('productDelivery/searchBySO/' + id);
                if (productDeliveryResponse.data.isSuccess) {
                    setProductDeliveryCount(productDeliveryResponse.data.results);
                }

                const invoiceResponse = await ApiService.get('invoice/searchBySO/' + id);
                if (invoiceResponse.data.isSuccess) {
                    setInvoicedCount(invoiceResponse.data.results)
                }

                const response = await ApiService.get(`salesOrder/${id}`)
                setLoderStatus("SUCCESS");
                const purchaseOrder = response.data.document;
                console.log(purchaseOrder);
                setstate(purchaseOrder)
                reset(purchaseOrder);
                if (purchaseOrder.date) {
                    setValue('date', purchaseOrder.date.split("T")[0])
                    setValue('deliveryDate', purchaseOrder.deliveryDate.split("T")[0])
                }
            }

        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)

        }

    }, []);
    let grandtot = 0;
    let estimationArray = new Array();

    const updateOrderLines = (index) => {
        let cumulativeSum = 0, cgstSum = 0, sgstSum = 0, igstSum = 0;
        const products = getValues('products')
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

    console.log(loderStatus)

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
                        <Col>
                            <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/sales/orders' }} ><h3 className="breadcrum-label">Sales Orders</h3></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {
                                productDeliveryCount > 0 || state.status === "Fully Invoiced" ? " " : <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            }

                            <Button as={Link} to="/sales/orders" variant="light" size="sm">DISCARD</Button>
                            {productDeliveryCount > 0 || state.status === "Fully Invoiced" ? " " : <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>

                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mb-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && !state.isFullyDelivered ? <Button variant="primary" onClick={handleDeliveryProducts}>DELIVERY PRODUCTS</Button> : ""}
                                {!isAddMode && state.invoiceStatus !== "Fully Invoiced" ? <Button onClick={handleCreateInvoice} variant="primary">CREATE INVOICE</Button> : ""}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">LOCK</Button> */}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>

                            <div className="m-2 d-flex justify-content-end">
                                {/* {!isAddMode && state.invoiceStatus !== "Nothing to Invoice" ? <Button size="sm" onClick={handleDeliveryProducts} varient="primary">1 Delivery</Button> : ""} */}
                                {/* {!isAddMode && state.productDelivery !== null ? <Button size="sm" onClick={handleDeliveryProducts} varient="primary">1 Delivery</Button> : ""} */}
                                {!isAddMode && invoicedCount > 0 ? <Button size="sm" onClick={handleCustomerInvoice} varient="primary">{invoicedCount} Customer Invoices</Button> : ""}
                                {!isAddMode && productDeliveryCount > 0 ? <Button size="sm" onClick={openDeliveredProduct} varient="primary">{productDeliveryCount} Deliveries</Button> : ""}

                                {/* {
                                    !isAddMode && state.productDeliveryarray ? (
                                        <Dropdown as={ButtonGroup} size="sm">
                                            <Button variant="success">{state.productDeliveryarray.length} Deliverys</Button>

                                            <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

                                            <Dropdown.Menu>
                                                {
                                                    state.productDeliveryarray?.map(e => (
                                                        <Dropdown.Item onClick={() => handleDeliveryProducts(e.pdId.id)}>{`${e.pdId.name} (${e.pdId.status})`}</Dropdown.Item>
                                                    ))
                                                }

                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : ""
                                }
                                {
                                    !isAddMode && state.invoice ? (
                                        <Dropdown as={ButtonGroup} size="sm">
                                            <Button variant="success">{state.invoice.length} Invoices</Button>

                                            <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

                                            <Dropdown.Menu>
                                                {
                                                    state.invoice?.map(e => (
                                                        <Dropdown.Item onClick={() => handleInvoice(e.invId.id)}>{`${e.invId.name} (${e.invId.status})`}</Dropdown.Item>
                                                    ))
                                                }

                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : ""
                                } */}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.invoiceStatus}</div>}
                            </div>
                        </Col>
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Sales Order</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    disabled={true}
                                    {...register("name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Customer Name</Form.Label>
                                <Form.Select id="customer" name="customer" {...register("customer", { required: true })} data-live-search="true"
                                    onChange={async (e) => {

                                        const response = await ApiService.get('customer/' + e.target.value);
                                        setValue('shippingAddress', response.data.document.address)
                                        setValue('billingAddress', response.data.document.address)
                                        response.data.document.addresses.map((e) => {
                                            if (e.shipping) {
                                                console.log(e.state);
                                                if (e.state == "WB") {
                                                    setisstatetax(true)
                                                    // statetax = true
                                                }
                                            }
                                        })

                                    }}>
                                    <option value={null}>Choose..</option>
                                    {customerList.map((element, index) => {
                                        // return <option data-tokens="element.id" key={index} value={element.id}>{element.name}</option>
                                        return <option value={element.id} key={index}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="date"
                                    name="date"
                                    {...register("date")} />
                            </Form.Group>
                        </Row>
                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Billing Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="billingAddress"
                                    name="billingAddress"
                                    {...register("billingAddress")}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Shipping Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="shippingAddress"
                                    name="shippingAddress"
                                    {...register("shippingAddress")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Delivery Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="deliveryDate"
                                    name="deliveryDate"
                                    {...register("deliveryDate")} />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Remark</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="remark"
                                    name="remark"
                                    {...register("remark")}
                                />
                            </Form.Group>
                        </Row>

                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="products" title="Products">
                                <Card style={{ width: '100%', marginLeft: -2, marginTop: 2 }}>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "2rem" }}>#</th>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Delivered</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Invoiced</th>}
                                                    <th style={{ minWidth: "16rem" }}>Unit Rate</th>
                                                    <th style={{ minWidth: "16rem" }}>Taxes (%)</th>
                                                    <th style={{ minWidth: "16rem" }}>Amount</th>
                                                    {
                                                        productDeliveryCount > 0 ? "" : <th></th>
                                                    }

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (
                                                        <tr key={field.id} >
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Tippy animation={"scale"} theme={"light"} content={<ProductDetails data={productInfo} />}>
                                                                        <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}
                                                                            onChange={async (e) => {
                                                                                const product = await ApiService.get('product/' + e.target.value);
                                                                                setValue(`products.${index}.account`, product.data.document.assetAccount);
                                                                                setValue(`products.${index}.name`, product.data.document.name);
                                                                                setValue(`products.${index}.description`, product.data.document.description);
                                                                                setValue(`products.${index}.unit`, product.data.document.uom);
                                                                                setValue(`products.${index}.quantity`, 1);
                                                                                setValue(`products.${index}.unitPrice`, product.data.document.salesPrice.toFixed(2));
                                                                                setValue(`products.${index}.taxes`, product.data.document.igstRate);
                                                                                setValue(`products.${index}.cgstRate`, product.data.document.cgstRate);
                                                                                //setValue(`products.${index}.cgst`, product.data.document.igstRate);
                                                                                setValue(`products.${index}.sgstRate`, product.data.document.sgstRate);
                                                                                //setValue(`products.${index}.sgst`, product.data.document.igstRate);
                                                                                setValue(`products.${index}.igstRate`, product.data.document.igstRate);
                                                                                //setValue(`products.${index}.igst`, product.data.document.igstRate);

                                                                                const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`, `products.${index}.product`]);
                                                                                const val = getValues('products');
                                                                                setValue(`products.${index}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(values[1])).toFixed(2));

                                                                                console.log(val);
                                                                                console.log(e.target.value);
                                                                                let i = 0;
                                                                                val?.map(ele => {
                                                                                    // console.log(typeof e.target.value);
                                                                                    if (ele.product == e.target.value) {
                                                                                        console.log(parseInt(ele.quantity) + 1);
                                                                                        let qty = parseInt(ele.quantity) + 1
                                                                                        console.log(parseFloat(parseFloat(values[0]) * parseInt(qty)));
                                                                                        setValue(`products.${i}.quantity`, qty);

                                                                                        setValue(`products.${i}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(qty)).toFixed(2));
                                                                                        itemRemove(index)
                                                                                    }
                                                                                    i++;
                                                                                })

                                                                                updateOrderLines(index)

                                                                            }}
                                                                            onMouseEnter={async e => {
                                                                                // console.log(e.target.value);
                                                                                const product = await ApiService.get('product/' + e.target.value);
                                                                                console.log(product.data.document);
                                                                                setproductInfo(product.data.document)
                                                                            }}
                                                                        >
                                                                            <option value={null}></option>
                                                                            {productList.map(element => {
                                                                                return <option key={element.id} value={element.id}>{element.name}</option>
                                                                            })}
                                                                        </Form.Select>
                                                                    </Tippy>
                                                                    {/* <Form.Control as="select" id="product" {...register(`products.${index}.product`)}
                                                                    onChange={async (e) => {
                                                                        const product = await ApiService.get('product/' + e.target.value);
                                                                        setValue(`products.${index}.units`, product.data.document.units);
                                                                        setValue(`products.${index}.rate`, product.data.document.basePrice);
                                                                        setValue(`products.${index}.description`, product.data.document.productDescription);
                                                                    }} >
                                                                    <option value={null}>Select...</option>
                                                                    {productList && productList.map((element, index) => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Control> */}
                                                                </Form.Group>
                                                            </td>

                                                            <td>
                                                                <Form.Group >
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="description"
                                                                        name="description"

                                                                        {...register(`products.${index}.description`)} />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <Form.Control
                                                                        type="number"
                                                                        id="quantity"
                                                                        name="quantity"

                                                                        {...register(`products.${index}.quantity`)}
                                                                        onBlur={(e) => {
                                                                            const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                            setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));
                                                                            updateOrderLines(index)
                                                                        }}
                                                                    />
                                                                </Form.Group>
                                                            </td>
                                                            {
                                                                !isAddMode && <td>
                                                                    <Form.Group >
                                                                        <Form.Control
                                                                            type="number"
                                                                            id="delivered"
                                                                            name="delivered"
                                                                            disabled
                                                                            {...register(`products.${index}.delivered`)} />
                                                                    </Form.Group>
                                                                </td>
                                                            }
                                                            {
                                                                !isAddMode && <td>
                                                                    <Form.Group >
                                                                        <Form.Control
                                                                            type="number"
                                                                            id="invoiced"
                                                                            name="invoiced"
                                                                            disabled
                                                                            {...register(`products.${index}.invoiced`)} />
                                                                    </Form.Group>
                                                                </td>
                                                            }
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        step="0.001"
                                                                        type="number"
                                                                        id="unitPrice"
                                                                        name="unitPrice"

                                                                        {...register(`products.${index}.unitPrice`)}
                                                                        onBlur={() => {
                                                                            const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`]);
                                                                            setValue(`products.${index}.unitPrice`, parseFloat(values[0]).toFixed(2))
                                                                            setValue(`products.${index}.subTotal`, parseFloat(parseFloat(values[0]) * parseInt(values[1])).toFixed(2));
                                                                            updateOrderLines(index)
                                                                        }}
                                                                    >

                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            {/* <td>
                                                                <Form.Group >
                                                                    <Form.Control
                                                                        disabled={!isAddMode ? true : false}
                                                                        // step="0.001"
                                                                        type="text"
                                                                        id="discount"
                                                                        name="discount"
                                                                        {...register(`products.${index}.discount`)}
                                                                        onBlur={() => {
                                                                            const values = getValues([`products.${index}.subTotal`, `products.${index}.discount`, `products.${index}.taxes`]);
                                                                            let discount = values[1];
                                                                            let subTotal = parseFloat(values[0]);
                                                                            console.log(subTotal)

                                                                            if (discount.includes('%')) {
                                                                                let valueAfterDiscount = parseFloat((values[0] * discount.split("%")[0]) / 100)
                                                                                let finalSubtotalValue = subTotal - valueAfterDiscount;
                                                                                console.log(valueAfterDiscount)
                                                                                console.log(finalSubtotalValue)
                                                                                setValue(`products.${index}.subTotal`, finalSubtotalValue)
                                                                            } else if (!discount.includes('%')) {
                                                                                let valueAfterDiscount = parseFloat(values[0]) - parseFloat(discount);
                                                                                let finalSubtotalValue = subTotal - valueAfterDiscount;
                                                                                setValue(`products.${index}.subTotal`, finalSubtotalValue)
                                                                            }
                                                                        }}
                                                                    />
                                                                </Form.Group>
                                                            </td> */}
                                                            <td>
                                                                <Form.Group >
                                                                    <Form.Control
                                                                        disabled
                                                                        // step="0.001"
                                                                        type="number"
                                                                        id="taxes"
                                                                        name="taxes"
                                                                        {...register(`products.${index}.taxes`)} />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <Form.Control
                                                                        // step="0.001"
                                                                        type="number"
                                                                        id="subTotal"
                                                                        name="subTotal"
                                                                        disabled
                                                                        {...register(`products.${index}.subTotal`)} />
                                                                </Form.Group>
                                                            </td>

                                                            {
                                                                productDeliveryCount > 0 ? "" :
                                                                    <td>
                                                                        <Button size="sm" variant="light"
                                                                            onClick={() => {
                                                                                itemRemove(index)
                                                                                updateOrderLines(index)
                                                                            }}
                                                                        ><BsTrash /></Button>
                                                                    </td>
                                                            }
                                                        </tr>
                                                    )
                                                })}
                                                {
                                                    productDeliveryCount > 0 ? "" :
                                                        <tr>
                                                            <td colSpan="14">
                                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ product: null, description: '', quantity: 1, delivered: 0, invoiced: 0, unitPrice: 0, subTotal: 0, netamount: 0 })} >Add a product</Button>
                                                            </td>
                                                        </tr>
                                                }

                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            {/* <Tab eventKey="otherInformations" title="Other Informations">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Product Deliverys</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>#Id</th>
                                                    <th>Name</th>
                                                    <th>Source Document</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    state.productDeliveryarray?.map((e) => {
                                                        return (
                                                            <tr>
                                                                <td>{e.pdId.id}</td>
                                                                <td>{e.pdId.name}</td>
                                                                <td>{e.pdId.sourceDocument}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                                <Row>

                                    <Form.Group as={Col} md="4" className="mb-2">
                                        <Form.Label className="m-0">Purchase Representative</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="purchaseRep"
                                            name="purchaseRep"
                                            // disabled={true}
                                            {...register("purchaseRep")}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="4" className="mb-2">
                                        <Form.Label className="m-0">Billing Status</Form.Label>
                                        <Form.Control
                                            disabled
                                            type="text"
                                            id="billingStatus"
                                            name="billingStatus"
                                            // disabled={true}
                                            {...register("billingStatus")}
                                        />
                                    </Form.Group>
                                </Row>

                            </Tab> */}

                        </Tabs>
                    </Container>
                    <Container className="mt-4 mb-4" fluid>
                        <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            <Col sm="12" md="4">
                                <Card>
                                    {/* <Card.Header as="h5">Featured</Card.Header> */}
                                    <Card.Body>
                                        <Row style={{ textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>
                                            <Col>SubTotal:</Col>
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

const ProductDetails = ({ data }) => {
    console.log(data);
    return (
        <div>
            <p>
                <span>Product Name: {data?.name}</span>
            </p>
            <p>
                <span>OnHand: {data?.onHand}</span>
            </p>
            <p>
                <span>Commited: {data?.commited}</span>
            </p>
            <p>
                <span>Available: {data?.available}</span>
            </p>
        </div>
    )
}
