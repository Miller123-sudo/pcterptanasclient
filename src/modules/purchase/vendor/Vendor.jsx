import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb, Modal } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { PropagateLoader } from "react-spinners";
import { BsTrash } from 'react-icons/bs';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../../helpers/ApiServices';
import { formatAddress } from '../../../helpers/Utils';

export default function Vendor() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({})
    const [tabKey, setTabKey] = useState('address');
    const [isShippingTick, setIsShippingTick] = useState([]);
    const [isShippingTickAdd, setIsShippingTickAdd] = useState(false);
    const [show, setShow] = useState(false);
    const [addressLineId, setaddressLineId] = useState();

    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "addresses" });


    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/vendor', data).then(response => {
            if (response.data.isSuccess) {
                navigate("/purchase/vendors");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/vendor/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate("/purchase/vendors");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/vendor/${id}`).then(response => {
            console.log(response.data)
            navigate("/purchase/vendors");
        }).catch(e => {
            console.log(e);
        })

    }

    const openHandleShow = () => {
        setShow(true);
        console.log(addressLineId);
        setValue("modal.addressLineId", addressLineId); setValue("modal.billing", false); setValue("modal.shipping", false); setValue("modal.default", false); setValue("modal.return", false); setValue("modal.country", ""); setValue("modal.addressee", ""); setValue("modal.phone", ""); setValue("modal.address1", ""); setValue("modal.address2", ""); setValue("modal.address3", ""); setValue("modal.city", ""); setValue("modal.state", ""); setValue("modal.zip", "")
    }
    const closeHandleShow = () => setShow(false);

    const submitModal = () => {
        let array = new Array()
        const values = getValues()
        console.log("addresses: ", values.addresses);
        console.log("moda;: ", values.modal);
        // array = values.addresses
        values.addresses?.map(e => {
            if (e.addressLineId == values.modal.addressLineId) {
                values.addresses.push(e)
            } else {
                values.addresses.push(e)
            }
        })


        array.push(values.modal)
        setValue("addresses", array)
        closeHandleShow()

    }

    useEffect(() => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`vendor/${id}`).then(response => {
                if (response.data.isSuccess) {
                    setLoderStatus("SUCCESS");
                    console.log(response.data.document)
                    setstate(response.data.document)
                    reset(response.data.document);
                }

            }).catch(e => {
                console.log(e)
            })
        }
    }, [])


    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>{isAddMode ? "Create New Vendor" : state.name}</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/purchase/vendors" variant="light" size="sm">DISCARD</Button>{" "}
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item> */}
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" fluid>
                    <Row className="m-0 p-0">
                    </Row>
                    <Container fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    {...register("name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Phone</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="phone"
                                    name="phone"
                                    {...register("phone")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="email"
                                    name="email"
                                    {...register("email")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">GSTIN</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="gstin"
                                    name="gstin"
                                    {...register("gstin")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Address</Form.Label>
                                <Form.Control
                                    disabled
                                    as="textarea"
                                    id="address"
                                    name="address"
                                    {...register("address")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Agent</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="agent"
                                    name="agent"
                                    {...register("agent")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">City</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="city"
                                    name="city"
                                    {...register("city")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Market</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="market"
                                    name="market"
                                    {...register("market")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Discount % less</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="discountLess"
                                    name="discountLess"
                                    {...register("discountLess")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Box less</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="boxLess"
                                    name="boxLess"
                                    {...register("boxLess")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Per pcs less</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="perPcsLess"
                                    name="perPcsLess"
                                    {...register("perPcsLess")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Per meter less</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="perMeterLess"
                                    name="perMeterLess"
                                    {...register("perMeterLess")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bank name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="bankName"
                                    name="bankName"
                                    {...register("bankName")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bank branch</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="bankBranch"
                                    name="bankBranch"
                                    {...register("bankBranch")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Bank account number</Form.Label>
                                <Form.Control
                                    type="number"
                                    id="bankAccountNumber"
                                    name="bankAccountNumber"
                                    {...register("bankAccountNumber")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">IFCI</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="IFCI"
                                    name="IFCI"
                                    {...register("IFCI")}
                                />
                            </Form.Group>
                        </Row>
                    </Container>

                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="address" title="Address">
                                <Card style={{ width: '100%', marginLeft: -2 }}>
                                    <Card.Header>Address</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "0.5rem" }}>#</th>
                                                    <th style={{ minWidth: "1rem" }}>Billing</th>
                                                    <th style={{ minWidth: "1rem" }}>Shipping</th>
                                                    <th style={{ minWidth: "1rem" }}>Default</th>
                                                    <th style={{ minWidth: "1rem" }}>Return</th>
                                                    <th style={{ minWidth: "16rem" }}>Country</th>
                                                    <th style={{ minWidth: "16rem" }}>Addressee</th>
                                                    <th style={{ minWidth: "16rem" }}>Phone</th>
                                                    <th style={{ minWidth: "16rem" }}>Address1</th>
                                                    <th style={{ minWidth: "16rem" }}>Address2</th>
                                                    <th style={{ minWidth: "16rem" }}>Address3</th>
                                                    <th style={{ minWidth: "16rem" }}>City</th>
                                                    <th style={{ minWidth: "16rem" }}>State</th>
                                                    <th style={{ minWidth: "16rem" }}>Zip</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (
                                                        <tr key={field.id} >
                                                            <td>
                                                                {index + 1}
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <input
                                                                        type="checkbox"
                                                                        id="billing"
                                                                        name="billing"
                                                                        {...register(`addresses.${index}.billing`)} />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <input
                                                                        type="checkbox"
                                                                        id="shipping"
                                                                        name="shipping"
                                                                        {...register(`addresses.${index}.shipping`)}

                                                                    />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <input
                                                                        type="checkbox"
                                                                        id="default"
                                                                        name="default"
                                                                        {...register(`addresses.${index}.default`)}
                                                                    />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <input
                                                                        type="checkbox"
                                                                        id="return"
                                                                        name="return"
                                                                        {...register(`addresses.${index}.return`)}
                                                                    />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="country"
                                                                        name="country"
                                                                        {...register(`addresses.${index}.country`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="addressee"
                                                                        name="addressee"
                                                                        {...register(`addresses.${index}.addressee`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="number"
                                                                        id="phone"
                                                                        name="phone"
                                                                        {...register(`addresses.${index}.phone`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="address1"
                                                                        name="address1"
                                                                        {...register(`addresses.${index}.address1`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="address2"
                                                                        name="address2"
                                                                        {...register(`addresses.${index}.address2`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="address3"
                                                                        name="address3"
                                                                        {...register(`addresses.${index}.address3`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="city"
                                                                        name="city"
                                                                        {...register(`addresses.${index}.city`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        id="state"
                                                                        name="state"
                                                                        {...register(`addresses.${index}.state`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    >
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Form.Group >
                                                                    <Form.Control
                                                                        type="number"
                                                                        id="zip"
                                                                        name="zip"
                                                                        {...register(`addresses.${index}.zip`)}
                                                                        onBlur={() => {
                                                                            const values = getValues();
                                                                            const v = formatAddress(values)
                                                                            setValue("address", v);
                                                                        }}
                                                                    />
                                                                </Form.Group>
                                                            </td>
                                                            <td>
                                                                <Button size="sm" variant="light"
                                                                    onClick={() => {
                                                                        // openHandleShow()
                                                                        // setaddressLineId(field?.id)
                                                                        // setValue(`addresses.${index}.addressLineId`, field?.id)
                                                                        itemRemove(index)
                                                                    }}
                                                                ><BsTrash /></Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }}
                                                            onClick={() => {
                                                                itemAppend({ billing: false, shipping: false, label: '', country: '', state: '', zip: "" })
                                                            }} >Add a Address</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    </Container>
                    <Modal show={show}>
                        <Modal.Header closeButton>
                            <Modal.Title>Address</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Container>
                                <Row>
                                    <Col>
                                        <Form.Group >
                                            <Form.Label className="m-0">Billing</Form.Label>
                                            <input
                                                type="checkbox"
                                                id="billing"
                                                name="billing"
                                                {...register(`modal.billing`)} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group >
                                            <Form.Label className="m-0">Shipping</Form.Label>
                                            <input
                                                type="checkbox"
                                                id="shipping"
                                                name="shipping"
                                                {...register(`modal.shipping`)} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group >
                                            <Form.Label className="m-0">Default</Form.Label>
                                            <input
                                                type="checkbox"
                                                id="default"
                                                name="default"
                                                {...register(`modal.default`)} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group >
                                            <Form.Label className="m-0">Return</Form.Label>
                                            <input
                                                type="checkbox"
                                                id="return"
                                                name="return"
                                                {...register(`modal.return`)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Country</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="country"
                                                name="country"
                                                {...register(`modal.country`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Addressee</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="addressee"
                                                name="addressee"
                                                {...register(`modal.addressee`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Phone</Form.Label>
                                            <Form.Control
                                                type="number"
                                                id="phone"
                                                name="phone"
                                                {...register(`modal.phone`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Address1</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="address1"
                                                name="address1"
                                                {...register(`modal.address1`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Address2</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="address2"
                                                name="address2"
                                                {...register(`modal.address2`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Address3</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="address3"
                                                name="address3"
                                                {...register(`modal.address3`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="city"
                                                name="city"
                                                {...register(`modal.city`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="state"
                                                name="state"
                                                {...register(`modal.state`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0">Zip</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="zip"
                                                name="zip"
                                                {...register(`modal.zip`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label className="m-0"></Form.Label>
                                            <Form.Control
                                                type="text"
                                                // defaultValue={addressLineId}
                                                id="zip"
                                                name="zip"
                                                {...register(`modal.addressLineId`)}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Container>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={submitModal}>Submit Modal</Button>
                            <Button variant="secondary" onClick={closeHandleShow}>Close Modal</Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </Form >
        </Container >
    )
}

