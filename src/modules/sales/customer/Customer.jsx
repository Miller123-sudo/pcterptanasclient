import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { BsTrash } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { formatAddress } from '../../../helpers/Utils';

export default function Customer() {
    // const [state, setstate] = useState({})
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({ total: 0 });
    const [tabKey, setTabKey] = useState('address');
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });

    // const { append, remove, fields } = useFieldArray({ control, name: "addresses" });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "addresses" });


    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/customer', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/sales/customers");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/customer/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/sales/customers");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/customer/${id}`).then(response => {
            console.log(response.data)
            history.push("/sales/customers");
        }).catch(e => {
            console.log(e);
        })

    }

    useEffect(() => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }
        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`customer/${id}`).then(response => {
                setLoderStatus("SUCCESS");
                console.log(response.data.document)
                setstate(response.data.document)
                reset(response.data.document);

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
                        <Col><h3>{isAddMode ? "Create New Customer" : state.name}</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/sales/customers" variant="light" size="sm">DISCARD</Button>{" "}
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
                                                                        itemRemove(index)
                                                                    }}
                                                                ><BsTrash /></Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ billing: false, shipping: false, label: '', country: '', state: '', zip: "" })} >Add a Address</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    </Container>

                </Container>
            </Form>
        </Container>
    )
}
