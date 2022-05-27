import { React, useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Breadcrumb, Card, Table, Button, Col, ButtonGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { BsTrash } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { SalesOrderPDF } from '../../../helpers/PDF';
import { errorMessage } from '../../../helpers/Utils';
import { UserContext } from '../../../components/states/contexts/UserContext';


export default function ProductDelivery() {
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setState] = useState({});
    const [tabKey, setTabKey] = useState('operations');
    const [productList, setProductList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const history = useHistory();
    let { path, url } = useRouteMatch();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            currency: null,
            subsidiary: null,
            location: null
        }
    });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "operations" });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/productDelivery', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/sales/delivery");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        });

    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/productDelivery/${id}`, data).then(response => {
            if (response.data.isSuccess) {
                // history.push("/sales/productDelivery");
                history.push("/sales/deliveries");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        });

    }

    const isLessQuantityProcess = (data) => {
        let isLess = false;
        data.forEach(el => {
            if (el.demandQuantity > parseInt(el.doneQuantity))
                isLess = true;
            console.log(isLess);
        });
        return isLess;
    }

    const isProcessAll = (data) => {
        let isProcess = true;
        data.forEach(el => {
            if (parseInt(el.doneQuantity) !== 0) {
                isProcess = false;
            }
        });
        return isProcess;
    }

    // let total = 0;
    const validateDeliveryProducts = () => {
        const operations = getValues('operations');
        const isProcess = isProcessAll(operations);
        if (isProcess) {
            alert("You have not recorded done quantities yet, by clicking on Ok PCTeRP will process all the quantities.");
            const productDelivery = new Object();
            const operationProcessed = new Array();

            operations.map((product, index) => {
                const operation = new Object();
                operation.productIdentifier = product.productIdentifier;
                operation.product = product.product;
                operation.name = product.name;
                operation.description = product.description;
                operation.demandQuantity = parseInt(product.demandQuantity);
                operation.doneQuantity = parseInt(product.demandQuantity);
                operationProcessed.push(operation)
            });
            productDelivery.status = "Done";
            productDelivery.isFullyDelivered = true;
            productDelivery.customer = state.customer;
            productDelivery.effectiveDate = state.effectiveDate;
            productDelivery.deliveryDate = state.deliveryDate;
            productDelivery.estimation = state.estimation;
            productDelivery.sourceDocument = state.sourceDocument;
            productDelivery.deliveryAddress = state.deliveryAddress;
            productDelivery.operations = operationProcessed;

            return ApiService.patch('productDelivery/delivered/' + state.id, productDelivery).then(async response => {
                history.push("/sales/order/" + state.sourceDocument.id);
            }).catch(e => {
                console.log(e.response?.data.message);
                errorMessage(e, dispatch)
            });
        }


        const isLessProcess = isLessQuantityProcess(operations);

        if (isLessProcess) {
            alert("You are process less products");
            const productDelivery = new Object();
            const operationProcessed = new Array();
            operations.map((product, index) => {
                if (parseInt(product.doneQuantity) > 0) {
                    const operation = new Object();
                    operation.productIdentifier = product.productIdentifier;
                    operation.product = product.product;
                    operation.name = product.name;
                    operation.description = product.description;
                    operation.demandQuantity = parseInt(product.doneQuantity);
                    operation.doneQuantity = parseInt(product.doneQuantity);
                    operationProcessed.push(operation)

                }
            });
            productDelivery.status = "Done";
            productDelivery.customer = state.customer;
            productDelivery.effectiveDate = state.effectiveDate;
            productDelivery.deliveryDate = state.deliveryDate;
            productDelivery.estimation = state.estimation;
            productDelivery.sourceDocument = state.sourceDocument;
            productDelivery.deliveryAddress = state.deliveryAddress;
            productDelivery.operations = operationProcessed;

            ApiService.patch('productDelivery/delivered/' + state.id, productDelivery).then(async response => {

                if (response.data.isSuccess) {
                    const newProductDelivery = new Object();
                    const operationNeedToProcess = new Array();
                    operations.map((product, index) => {
                        if ((product.demandQuantity - parseInt(product.doneQuantity)) > 0) {
                            const operation = new Object();
                            operation.productIdentifier = product.productIdentifier;
                            operation.product = product.product;
                            operation.name = product.name;
                            operation.description = product.description;
                            operation.demandQuantity = product.demandQuantity - parseInt(product.doneQuantity);
                            operation.doneQuantity = 0;
                            operationNeedToProcess.push(operation)
                        }
                    });
                    newProductDelivery.customer = state.customer;
                    newProductDelivery.backOrderOf = state.id;
                    newProductDelivery.effectiveDate = state.effectiveDate;
                    newProductDelivery.sourceDocument = state.sourceDocument;
                    newProductDelivery.operations = operationNeedToProcess;

                    ApiService.post('productDelivery/procedure', newProductDelivery).then(response => {
                        history.push("/sales/order/" + state.sourceDocument.id);
                    }).catch(e => {
                        console.log(e.response?.data.message);
                        errorMessage(e, dispatch)
                    });
                }
            }).catch(e => {
                console.log(e.response?.data.message);
                errorMessage(e, dispatch)
            })
            // End of update the current productDelivery with doneQuantity

        } else {
            console.log("Fully Receipt");
            console.log("State", state);
            console.log("Receipt Id", id);
            console.log("Operations", operations)

            ApiService.setHeader();
            const allProductDelivery = new Object();
            const finalOperationProcesses = new Array();
            operations.map((product, index) => {
                const operation = new Object();
                operation.productIdentifier = product.productIdentifier;
                operation.product = product.product;
                operation.name = product.name;
                operation.description = product.description;
                operation.demandQuantity = parseInt(product.doneQuantity);
                operation.doneQuantity = parseInt(product.doneQuantity);
                finalOperationProcesses.push(operation)
            });
            allProductDelivery.status = "Done";
            allProductDelivery.isFullyDelivered = true;
            allProductDelivery.customer = state.customer;
            allProductDelivery.effectiveDate = state.effectiveDate;
            allProductDelivery.sourceDocument = state.sourceDocument;
            allProductDelivery.operations = finalOperationProcesses;

            console.log("Before", allProductDelivery)

            ApiService.patch('productDelivery/delivered/' + id, allProductDelivery).then(async response => {
                if (response.data.isSuccess) {
                    console.log("After", response.data.document)
                    history.push("/sales/order/" + state.sourceDocument.id);
                }
            }).catch(e => {
                console.log(e.response?.data.message);
                errorMessage(e, dispatch)
            });
        }

    }

    const deleteDocument = () => {
        return ApiService.delete(`productDelivery/${id}`).then(response => {
            history.push("/sales/productdeliveries");

        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })
    }

    const handleDeliveryPrinting = async () => {
        SalesOrderPDF.generateDeliveryPDF(state.id);
        return;
    }


    useEffect(async () => {
        try {
            setLoderStatus("RUNNING");
            ApiService.setHeader();

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

            if (isAddMode) {
                setLoderStatus("SUCCESS");
            }

            if (!isAddMode) {

                ApiService.setHeader();
                const response = await ApiService.get(`productDelivery/${id}`)
                console.log(response.data.document);
                if (response.data.isSuccess) {
                    setLoderStatus("SUCCESS");
                    const itemReceipt = response.data.document;
                    setState(itemReceipt)
                    reset(itemReceipt);
                    if (itemReceipt.effectiveDate) {
                        setValue('effectiveDate', itemReceipt.effectiveDate.split("T")[0])
                    }
                    // // Get SO data
                    // const SODocument = await ApiService.get("salesOrder/" + itemReceipt.sourceDocument);
                    // setSOObject(SODocument.data.document);
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
                <Container className="pct-app-content-header   m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/sales/orders' }} ><h3 className="breadcrum-label">Sales Orders</h3></Breadcrumb.Item>
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/sales/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            {/* <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "} */}
                            <Button as={Link} to="/sales/productdeliveries" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item> */}
                                <Dropdown.Divider />
                                {
                                    state.status !== "Invoiced" && <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                                }
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {state.status == "Ready" && <Button onClick={validateDeliveryProducts} variant="primary">VALIDATE</Button>}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">UNLOCK</Button> */}
                                {!isAddMode && <Button onClick={handleDeliveryPrinting} type="button" variant="primary">PRINT DELIVERY</Button>}
                            </ButtonGroup>

                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
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
                                    readOnly={true}
                                    {...register("sourceDocument.name")}
                                    onClick={() => {
                                        history.replace(`/sales/order/${state.sourceDocument.id}`)
                                    }}
                                // {...register("sourceDocument")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Deliver To</Form.Label>
                                <Form.Select id="customer" name="customer" {...register("customer")}>
                                    <option value={null}>Choose..</option>
                                    {customerList && customerList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="effectiveDate"
                                    name="effectiveDate"
                                    // disabled={true}
                                    {...register("effectiveDate")}
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Delivery Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="deliveryAddress"
                                    name="deliveryAddress"
                                    {...register("deliveryAddress")}
                                />
                            </Form.Group>
                        </Row>

                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="operations" title="Operations">

                                <Card style={{ width: '100%', marginLeft: -2, marginTop: 2 }}>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    <th style={{ minWidth: "16rem" }}>Delivered Quantity</th>
                                                    <th style={{ minWidth: "16rem" }}>Availability</th>
                                                    {/* <th></th> */}

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select disabled id="product" name="product" {...register(`operations.${index}.product`)}>

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
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`operations.${index}.description`)}
                                                                // onChange={(e) => {
                                                                //     const rate = getValues(`items.${index}.rate`);
                                                                //     const quantity = e.target.value;
                                                                //     setValue(`items.${index}.grossAmount`, rate * quantity)
                                                                // }}
                                                                />
                                                            </Form.Group>
                                                        </td>


                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="number"
                                                                    id="demandQuantity"
                                                                    name="demandQuantity"
                                                                    {...register(`operations.${index}.demandQuantity`)}
                                                                // onChange={(e) => {
                                                                //     const rate = getValues(`items.${index}.rate`);
                                                                //     const quantity = e.target.value;
                                                                //     setValue(`items.${index}.grossAmount`, rate * quantity)
                                                                // }}
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="doneQuantity"
                                                                    name="doneQuantity"
                                                                    disabled={state.status == "Done" ? true : false}
                                                                    {...register(`operations.${index}.doneQuantity`)}
                                                                    onChange={(e) => { setValue(`operations.${index}.doneQuantity`, e.target.value) }}

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
                                                                    type="text"
                                                                    id="isAvailable"
                                                                    name="isAvailable"
                                                                    {...register(`operations.${index}.isAvailable`)}
                                                                // onChange={(e) => {
                                                                //     const rate = getValues(`items.${index}.rate`);
                                                                //     const quantity = e.target.value;
                                                                //     setValue(`items.${index}.grossAmount`, rate * quantity)
                                                                // }}
                                                                />
                                                            </Form.Group>
                                                        </td>


                                                        {/* <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    itemRemove(index)

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td> */}
                                                    </tr>
                                                    )
                                                })}
                                                {/* <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({})} >Add a line</Button>
                                                    </td>
                                                </tr> */}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>

                        </Tabs>
                    </Container>
                </Container>



            </Form >
        </Container >
    )
}