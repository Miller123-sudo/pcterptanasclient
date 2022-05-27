import { React, useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { PurchaseOrderPDF } from '../../../helpers/PDF';

export default function ProductReceive() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setState] = useState({});
    const [tabKey, setTabKey] = useState('operations');
    const [productList, setProductList] = useState([]);
    const [vendorList, setVendorList] = useState([])

    const history = useHistory();
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
        console.log(formData)
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/productReceipt', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/purchase/receivedproducts");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const updateDocument = (id, data) => {
        if (state.status == "Done") {
            alert("you can't modify the document")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/productReceipt/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    history.push("/purchase/receivedproducts");
                }
            }).catch(e => {
                console.log(e);
            })
        }
    }

    const isLessQuantityProcess = (data) => {
        let isLess = false;
        data.forEach(el => {
            if (parseInt(el.demandQuantity) > parseInt(el.doneQuantity))
                isLess = true;
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

    const validateReceivedProducts = () => {

        const operations = getValues('operations');
        const isProcess = isProcessAll(operations);
        if (isProcess) {
            alert("You have not recorded done quantities yet, by clicking on Ok PCTeRP will process all the quantities.");
            // Creating Product Receipt Object.
            const productReceipt = new Object();
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
            productReceipt.status = "Done";
            productReceipt.isFullyReceived = true;
            productReceipt.notes = getValues('notes');
            productReceipt.vendor = state.vendor;
            productReceipt.effectiveDate = state.effectiveDate;
            productReceipt.sourceDocument = state.sourceDocument;
            productReceipt.operations = operationProcessed;
            return ApiService.patch('productReceipt/received/' + state.id, productReceipt).then(response => {
                history.push("/purchase/order/" + state.sourceDocument.id);
            })

        }

        const isLessProcess = isLessQuantityProcess(operations);
        if (isLessProcess) {
            alert("You are process less products");
            const productReceipt = new Object();
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
            productReceipt.status = "Done";
            productReceipt.notes = getValues('notes');
            productReceipt.vendor = state.vendor;
            productReceipt.effectiveDate = state.effectiveDate;
            productReceipt.sourceDocument = state.sourceDocument;
            productReceipt.operations = operationProcessed;

            ApiService.patch('productReceipt/received/' + state.id, productReceipt).then(response => {

                const newProductReceipt = new Object();
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
                newProductReceipt.vendor = state.vendor;
                newProductReceipt.notes = getValues('notes');
                newProductReceipt.backOrderOf = state.id;
                newProductReceipt.effectiveDate = state.effectiveDate;
                newProductReceipt.sourceDocument = state.sourceDocument;
                newProductReceipt.operations = operationNeedToProcess;

                ApiService.post('productReceipt/procedure', newProductReceipt).then(response => {

                    history.push("/purchase/order/" + state.sourceDocument.id);
                })
            });

        } else {

            console.log("Fully Receipt");
            console.log("State", state);
            console.log("Receipt Id", id);
            console.log("Operations", operations)

            ApiService.setHeader();
            const fullProductReceipt = new Object();
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
            fullProductReceipt.status = "Done";
            fullProductReceipt.isFullyReceived = true;
            fullProductReceipt.notes = getValues('notes');
            fullProductReceipt.vendor = state.vendor;
            fullProductReceipt.effectiveDate = state.effectiveDate;
            fullProductReceipt.sourceDocument = state.sourceDocument;
            fullProductReceipt.operations = finalOperationProcesses;

            console.log("Before", fullProductReceipt)

            ApiService.patch('productReceipt/received/' + id, fullProductReceipt).then(async response => {
                if (response.data.isSuccess) {
                    console.log("After", response.data.document)
                    history.push("/purchase/order/" + state.sourceDocument.id);
                }
            });
        }
    }

    const deleteDocument = () => {

        return ApiService.delete(`productReceipt/${id}`).then(response => {
            history.push("/purchase/receivedproducts");

        }).catch(e => {
            console.log(e);
            alert(e.response.data.message)
        })
    }


    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generateProductReceivedPDF(state.id);
        return;
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        ApiService.setHeader();

        const vendorResponse = await ApiService.get('vendor');
        if (vendorResponse.data.isSuccess) {
            setVendorList(vendorResponse.data.documents)
        }

        const productResponse = await ApiService.get('product');

        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
        }

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            try {
                ApiService.setHeader();
                const response = await ApiService.get(`productReceipt/${id}`)
                if (response.data.isSuccess) {
                    setLoderStatus("SUCCESS");
                    const itemReceipt = response.data.document;
                    setState(itemReceipt)
                    reset(itemReceipt);
                    if (itemReceipt.effectiveDate) {
                        setValue('effectiveDate', itemReceipt.effectiveDate.split("T")[0])
                    }
                }
            } catch (err) {
                console.log(err);
                alert(err.response.data.message)
            }
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
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col>
                            <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                            </Breadcrumb>

                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {/* <Button type="submit" variant="primary" size="sm">SAVE</Button> */}
                            <Button as={Link} to="/purchase/receivedproducts" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && state.status === "Ready" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}

                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {state.status == "Ready" && <Button onClick={validateReceivedProducts} variant="primary">RECEIVE</Button>}
                                {/* {state.status == "Ready" && <Button variant="primary">SET QUANTITIES</Button>} */}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">UNLOCK</Button> */}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT RECEIVE</Button>}
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
                                    disabled={true}
                                    {...register("sourceDocument.name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Receive From</Form.Label>
                                <Form.Select id="vendor" name="vendor" {...register("vendor")}>
                                    <option value={null}>Choose..</option>
                                    {vendorList && vendorList.map((element, index) => {
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
                            {state.backOrderOf?.length > 0 ? <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Back Order of</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="backOrderOf"
                                    name="backOrderOf"
                                    disabled={true}
                                    {...register("backOrderOf")}
                                />
                            </Form.Group> : ""}
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
                                <Form.Label className="m-0">Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="notes"
                                    name="notes"
                                    // disabled={true}
                                    {...register("notes")}
                                />
                            </Form.Group>
                        </Row>

                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="operations" title="Operations">
                                <Card style={{ marginLeft: 1, marginRight: 1, width: '100%' }} >
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Demand Quantity</th>
                                                    <th style={{ minWidth: "16rem" }}>Received Quantity</th>
                                                    <th></th>

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
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control disabled
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`operations.${index}.description`)}
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
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="doneQuantity"
                                                                    name="doneQuantity"
                                                                    {...register(`operations.${index}.doneQuantity`)}
                                                                    onChange={(e) => { setValue(`operations.${index}.doneQuantity`, e.target.value) }}

                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>


                                                        <td>
                                                            {/* <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    itemRemove(index)

                                                                }}
                                                            ><BsTrash /></Button> */}
                                                        </td>
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
