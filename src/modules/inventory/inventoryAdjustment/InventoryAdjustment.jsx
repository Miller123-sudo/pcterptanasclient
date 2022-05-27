import { React, useState, useEffect } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { BsBoxArrowInUpRight, BsTrash, BsEyeFill } from 'react-icons/bs';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import { useHistory, useParams } from 'react-router';
import ApiService from '../../../helpers/ApiServices';


const options = [{ value: 'GST 5%' }, { value: 'GST 5% (RC)' }, { value: 'IGST 1%' }, { value: 'IGST 2%' }];

export default function InventoryAdjustment() {
    const [state, setState] = useState({ total: 0 });
    const [accountList, setAccountList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [tabKey, setTabKey] = useState('products');
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const mode = query.get('mode');

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            inventoryAdjustmentAccount: null,
            date: new Date().toISOString().split("T")[0]
        }
    });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    const onSubmit = (formData) => {
        // 1. Increse the on hand quantity of the selected product
        // 2. Create Inventory Adjustment record.
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/inventoryAdjustment', data).then(response => {
            if (response.data.isSuccess) {
                console.log(response.data.document)
                response.data.document.products.map(product => {
                    ApiService.patch('product/increase/onHand/' + product.product, { onHand: parseInt(product.quantity) });
                })

                history.push("/inventory/inventoryadjustments");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/inventoryAdjustment/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/inventory/inventoryadjustments");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/inventoryAdjustment/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                history.push("/inventory/inventoryadjustments");
            }
        }).catch(e => {
            console.log(e);
        })
    }


    useEffect(async () => {

        const productResponse = await ApiService.get('product');
        console.log(productResponse.data.documents)
        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
        }

        const accountResponse = await ApiService.get('account');
        console.log(accountResponse.data.documents)
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents)
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`inventoryAdjustment/${id}`).then(response => {
                const purchaseOrder = response.data.document;
                setState(purchaseOrder)
                reset(purchaseOrder);
                if (purchaseOrder.date) {
                    setValue('date', purchaseOrder.date.split("T")[0])
                }

            }).catch(e => {
                console.log(e)
            })
        }

    }, []);

    let grandtot = 0;

    const handleConfirmInventory = async () => {
        console.log("handleConfirmInventory() called")
        setIsConfirmed(true);
        const response = await ApiService.patch(`/inventoryAdjustment/${id}`, { status: "Confirmed" });
        console.log(response.data.document)
        if (response.data.isSuccess) {
            setState(response.data.document)
            reset(response.data.document);
        }
    }


    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col>
                            <h3>{isAddMode ? "Inventory Adjustment" : state.name}</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} >Purchase Orders</Breadcrumb.Item>
                                <Breadcrumb.Item active>New</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {mode === 'view' ? <Button as={Link} to={`/inventory/inventoryadjustment/${id}?mode=edit`} variant="primary" size="sm">EDIT</Button> : <Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to="/inventory/inventoryadjustments" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && (mode !== 'view') && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item eventKey="1">Archive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-2 m-0 mt-2" fluid>
                    <Row className="p-0 mb-2 m-0">
                        {/* <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && <Button variant="primary" onClick={handleConfirmInventory}>CONFIRM</Button>}
                            </ButtonGroup>
                        </Col> */}
                        {/* <Col> */}
                        {/* <ButtonGroup size="sm">
                                {!isAddMode && state.billingStatus == "Nothing to Bill" ? <Button variant="primary" onClick={handleReceiveProducts}>RECEIVE PRODUCTS</Button> : ""}
                                {!isAddMode && state.billingStatus == "Waiting Bills" ? <Button onClick={handleCreateBill} variant="primary">CREATE BILL</Button> : ""}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">LOCK</Button> */}
                        {/* </ButtonGroup> */}
                        {/* </Col> */}
                        {/* <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.billingStatus == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.billingStatus !== "Nothing to Bill" ? <Button size="sm" onClick={handleReceiveProducts} varient="primary">1 Receipt</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.billingStatus}</div>}
                            </div>
                        </Col> */}
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="record-view-label m-0">Inventory Adjustment Account</Form.Label>
                                {mode === 'view' ? <Form.Control
                                    className="record-view-list"
                                    as="select"
                                    id="inventoryAdjustmentAccount"
                                    name="inventoryAdjustmentAccount"
                                    {...register("inventoryAdjustmentAccount")}
                                >
                                    <option value={null}></option>
                                    {accountList.map(element => {
                                        return <option value={element.id}>{element.name}</option>
                                    })}
                                </Form.Control> :
                                    <Form.Select
                                        id="inventoryAdjustmentAccount"
                                        name="inventoryAdjustmentAccount"
                                        {...register("inventoryAdjustmentAccount")}
                                    >
                                        <option value={null}></option>
                                        {accountList.map(element => {
                                            return <option value={element.id}>{element.name}</option>
                                        })}
                                    </Form.Select>}
                            </Form.Group>
                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="record-view-label m-0">Date</Form.Label>
                                <Form.Select id="date" name="date" {...register("vendor", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {supplierList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group> */}
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="record-view-label m-0">Date</Form.Label>
                                {mode === 'view' ? <Form.Control
                                    plaintext
                                    readOnly
                                    disabled
                                    type="date"
                                    id="date"
                                    name="date"
                                    {...register("date")} /> : <Form.Control
                                    type="date"
                                    id="date"
                                    name="date"
                                    {...register("date")} />}
                            </Form.Group>
                        </Row>
                        <Row>

                            {/* <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="record-view-label m-0">Total</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="total"
                                    name="total"
                                    // disabled={true}
                                    {...register("total")}
                                />
                            </Form.Group> */}
                        </Row>



                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="products" title="Products">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    <th style={{ minWidth: "16rem" }}>Unit Rate</th>
                                                    <th style={{ minWidth: "16rem" }}>Amount</th>
                                                    {mode !== 'view' && <th></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                {mode === 'view' ? <Form.Control className="record-view-list" as="select" id="product" name="product" {...register(`products.${index}.product`, { required: true })}>
                                                                    <option value={null}></option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Control> :
                                                                    <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}
                                                                        onChange={async (e) => {
                                                                            const product = await ApiService.get('product/' + e.target.value);
                                                                            setValue(`products.${index}.account`, product.data.document.expenseAccount);
                                                                            setValue(`products.${index}.quantity`, 1);
                                                                            setValue(`products.${index}.description`, product.data.document.description);
                                                                            setValue(`products.${index}.unitPrice`, product.data.document.cost);

                                                                            const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                            setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));

                                                                            let cumulativeSum = 0;

                                                                            const vals = getValues('products')
                                                                            console.log(vals);
                                                                            vals.map((val) => {
                                                                                cumulativeSum += parseFloat(val.subTotal);
                                                                            })
                                                                            setValue("total", cumulativeSum);
                                                                            setState(prevState => ({
                                                                                // object that we want to update
                                                                                ...prevState,    // keep all other key-value pairs
                                                                                total: cumulativeSum       // update the value of specific key

                                                                            }));

                                                                        }}>
                                                                        <option value={null}></option>
                                                                        {productList.map(element => {
                                                                            return <option value={element.id}>{element.name}</option>
                                                                        })}
                                                                    </Form.Select>}
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
                                                                {mode === 'view' ? <Form.Control
                                                                    plaintext
                                                                    readOnly
                                                                    disabled
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`products.${index}.description`)} /> : <Form.Control
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`products.${index}.description`)} />}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === 'view' ? <Form.Control
                                                                    plaintext
                                                                    readOnly
                                                                    disabled
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`products.${index}.quantity`)}

                                                                /> : <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`products.${index}.quantity`)}
                                                                    onBlur={(e) => {
                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));

                                                                        let cumulativeSum = 0;

                                                                        const vals = getValues('products')
                                                                        console.log(vals);
                                                                        vals.map((val) => {
                                                                            cumulativeSum += parseFloat(val.subTotal);
                                                                        });
                                                                        console.log(cumulativeSum)
                                                                        setValue("total", cumulativeSum);
                                                                        setState(prevState => ({
                                                                            // object that we want to update
                                                                            ...prevState,    // keep all other key-value pairs
                                                                            total: cumulativeSum       // update the value of specific key

                                                                        }));
                                                                        console.log("New State", state)

                                                                    }}
                                                                />}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                {mode === 'view' ? <Form.Control
                                                                    plaintext
                                                                    readOnly
                                                                    disabled
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`products.${index}.unitPrice`)}
                                                                /> : <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`products.${index}.unitPrice`)}
                                                                    onBlur={() => {
                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                        console.log(values);
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]))

                                                                        const vals = getValues('products')
                                                                        console.log(vals);
                                                                        vals.map((val) => {
                                                                            grandtot = grandtot + parseFloat(val.subTotal);
                                                                            console.log(grandtot);
                                                                        })
                                                                        setValue("total", grandtot)

                                                                        setState(prevState => ({
                                                                            // object that we want to update
                                                                            ...prevState,    // keep all other key-value pairs
                                                                            total: grandtot       // update the value of specific key

                                                                        }));
                                                                    }}
                                                                />}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === 'view' ? <Form.Control
                                                                    plaintext
                                                                    readOnly
                                                                    disabled
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`products.${index}.subTotal`)} /> : <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`products.${index}.subTotal`)} />}
                                                            </Form.Group>
                                                        </td>
                                                        {mode !== 'view' && <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    itemRemove(index)

                                                                    const vals = getValues('products')
                                                                    console.log(vals);
                                                                    vals.map((val) => {
                                                                        grandtot = grandtot + parseFloat(val.subTotal);
                                                                        console.log(grandtot);
                                                                    })
                                                                    setValue("total", grandtot);
                                                                    setState(prevState => ({
                                                                        // object that we want to update
                                                                        ...prevState,    // keep all other key-value pairs
                                                                        total: grandtot       // update the value of specific key

                                                                    }));

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>}
                                                    </tr>
                                                    )
                                                })}
                                                {mode !== 'view' && <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ product: null, description: '', quantity: 1, unitPrice: 0, subTotal: 0 })} >Add a product</Button>
                                                    </td>
                                                </tr>}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            {!isAddMode && <Tab eventKey="journalItems" title="Journal Items">
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
                                                    {mode !== 'view' && <th style={{ minWidth: "8rem" }}>Action</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {journalItemFields.map((field, index) => {
                                                    return <tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                {mode === 'view' ?
                                                                    <Form.Control className="record-view-list" as="select" id="account" name="account" {...register(`journalItems.${index}.account`)}>
                                                                        <option value={null}>Choose..</option>
                                                                        {accountList && accountList.map((element, index) => {
                                                                            return <option key={index} value={element.id}>{element.name}</option>
                                                                        })}
                                                                    </Form.Control>
                                                                    : <Form.Select id="account" name="account" {...register(`journalItems.${index}.account`)}>
                                                                        <option value={null}>Choose..</option>
                                                                        {accountList && accountList.map((element, index) => {
                                                                            return <option key={index} value={element.id}>{element.name}</option>
                                                                        })}
                                                                    </Form.Select>
                                                                }
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === 'view' ?
                                                                    <Form.Control
                                                                        plaintext
                                                                        readOnly
                                                                        disabled
                                                                        type="text"
                                                                        id="label"
                                                                        name="label"
                                                                        {...register(`journalItems.${index}.label`)} />
                                                                    : <Form.Control
                                                                        type="text"
                                                                        id="label"
                                                                        name="label"
                                                                        {...register(`journalItems.${index}.label`)} />
                                                                }
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === 'view' ?
                                                                    <Form.Control
                                                                        plaintext
                                                                        readOnly
                                                                        disabled
                                                                        type="number"
                                                                        id="debit"
                                                                        name="debit"
                                                                        {...register(`journalItems.${index}.debit`)} />
                                                                    : <Form.Control
                                                                        type="number"
                                                                        id="debit"
                                                                        name="debit"
                                                                        {...register(`journalItems.${index}.debit`)} />
                                                                }
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                {mode === 'view' ?
                                                                    <Form.Control
                                                                        plaintext
                                                                        readOnly
                                                                        disabled
                                                                        type="number"
                                                                        id="credit"
                                                                        name="credit"
                                                                        {...register(`journalItems.${index}.credit`)} />
                                                                    : <Form.Control
                                                                        type="number"
                                                                        id="credit"
                                                                        name="credit"
                                                                        {...register(`journalItems.${index}.credit`)} />
                                                                }
                                                            </Form.Group>
                                                        </td>
                                                        {mode !== 'view' && <td>
                                                            <Button style={{ minWidth: "8rem" }} size="sm" variant="danger"
                                                                onClick={() => {
                                                                    journalItemRemove(index)

                                                                }}
                                                            >Delete</Button>
                                                        </td>}
                                                    </tr>
                                                })}
                                                {mode !== 'view' && <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => journalItemAppend({})} >Add a line</Button>
                                                    </td>
                                                </tr>}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>}
                            {/* <Tab eventKey="otherInformations" title="Other Informations">
                                <Row>

                                    <Form.Group as={Col} md="4" className="mb-2">
                                        <Form.Label className="record-view-label m-0">Purchase Representative</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="purchaseRep"
                                            name="purchaseRep"
                                            // disabled={true}
                                            {...register("purchaseRep")}
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="4" className="mb-2">
                                        <Form.Label className="record-view-label m-0">Billing Status</Form.Label>
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
                    {/* <Container className="mt-4 mb-4" fluid> */}
                    {/* <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            {/* <Col sm="12" md="4">
                                <Card>
                                    {/* <Card.Header as="h5">Featured</Card.Header> */}
                    {/* <Card.Body>

                                        <Row style={{ textAlign: 'right', fontSize: '20px' }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state.total)}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                            </Col> */}
                    {/* </Row> */}

                    {/* </Container> */}
                </Container>
            </Form>
        </Container>
    )
}

