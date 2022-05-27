import { React, useState, useEffect, useRef } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { useHistory, useParams } from 'react-router';

// import { Select, Tag } from 'antd';
import ApiService from '../../../helpers/ApiServices';
// const { Option } = Select;

export default function BOM() {
    const [state, setstate] = useState({ total: 0 });
    const [tabKey, setTabKey] = useState('components');
    const [productList, setProductList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [workCenterList, setWorkCenterList] = useState([])
    const [employeeList, setEmployeeList] = useState();
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
        }
    });
    const { append: componentAppend, remove: componentRemove, fields: componentFields } = useFieldArray({ control, name: "components" });
    const { append: operationAppend, remove: operationRemove, fields: operationFields } = useFieldArray({ control, name: "operations" });

    const roles = [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'Sales Manager' },
        { id: 3, name: 'Account Manager' }
    ]

    const onSubmit = (formData) => {
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/bom', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/manufacturings/boms");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/bom/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/manufacturings/boms");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/bom/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                history.push("/manufacturings/bom");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    useEffect(async () => {
        const employeeResponse = await ApiService.get('employee');
        if (employeeResponse.data.isSuccess) {
            setEmployeeList(employeeResponse.data.documents)
        }

        const productResponse = await ApiService.get('product');
        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
        }

        const unitResponse = await ApiService.get('uom');
        if (unitResponse.data.isSuccess) {
            setUnitList(unitResponse.data.documents)
        }

        const workCenterResponse = await ApiService.get('workCenter');
        if (workCenterResponse.data.isSuccess) {
            setWorkCenterList(workCenterResponse.data.documents)
        }






        if (!isAddMode) {
            ApiService.setHeader();

            ApiService.get(`bom/${id}`).then(response => {
                const employee = response.data.document;
                setstate(employee)
                reset(employee);

            }).catch(e => {
                console.log(e)
            })
        }
    }, []);

    console.log(errors.passwordConfirm)

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/manufacturings/boms' }} ><h3 className="breadcrum-label">Bills of Materials</h3></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.product?.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/manufacturings/boms" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Product</Form.Label>
                                <Form.Select id="product" name="product" {...register(`product`)}>
                                    <option value="">Select...</option>
                                    {productList.map(element => {
                                        return <option value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Unit</Form.Label>
                                <Form.Select id="unit" name="unit" {...register(`unit`)}>
                                    <option value="">Select...</option>
                                    {unitList.map(element => {
                                        return <option value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="notes"
                                    name="notes"
                                    {...register("notes")}
                                />
                            </Form.Group>

                        </Row>
                    </Container>

                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="components" title="Components">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Components</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th style={{ minWidth: "16rem" }}>Component</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    <th style={{ minWidth: "16rem" }}>Unit</th>
                                                    <th></th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {componentFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select id="component" name="component" {...register(`components.${index}.component`)}>
                                                                    <option value="">Select...</option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>

                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`components.${index}.quantity`)}
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Select id="unit" name="unit" {...register(`components.${index}.unit`)}>
                                                                    <option value="">Select...</option>
                                                                    {unitList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    componentRemove(index)

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => componentAppend({})} >Add a line</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="operations" title="Operations">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Operations</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Steps</th>
                                                    <th style={{ minWidth: "16rem" }}>Operation Name</th>
                                                    <th style={{ minWidth: "16rem" }}>Work Center</th>
                                                    <th style={{ minWidth: "16rem" }}>Duration</th>
                                                    <th></th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {operationFields.map((field, index) => {
                                                    return (<tr key={field.id}>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="steps"
                                                                    name="steps"
                                                                    defaultValue={index + 1}
                                                                    {...register(`operations.${index}.steps`)}
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="operation"
                                                                    name="operation"
                                                                    {...register(`operations.${index}.operation`)}
                                                                />

                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group >
                                                                <Form.Select id="workCenter" name="workCenter" {...register(`operations.${index}.workCenter`)}>
                                                                    <option value="">Select...</option>
                                                                    {workCenterList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="duration"
                                                                    name="duration"
                                                                    {...register(`operations.${index}.duration`)}
                                                                />
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    operationRemove(index)

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => operationAppend({})} >Add a line</Button>
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
