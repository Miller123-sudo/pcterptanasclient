import { React, useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
// import 'react-toastify/dist/ReactToastify.css';
// import ReactStopwatch from 'react-stopwatch';
// import { lightGreen } from '@material-ui/core/colors';
import ApiService from '../../../helpers/ApiServices';
import { UserContext } from '../../../components/states/contexts/UserContext';


export default function JobOrder() {
    const [tabKey, setTabKey] = useState('components');
    const [timeStatus, settimeStatus] = useState('wating');
    const [state, setstate] = useState({});
    const [employeeList, setEmployeeList] = useState([])
    const [productList, setProductList] = useState([]);
    const [bomList, setBOMList] = useState([])
    const [uomList, setUOMList] = useState([]);
    const [workCenterList, setWorkCenterList] = useState([]);


    const history = useHistory();
    const { user } = useContext(UserContext)
    const { id } = useParams();
    // const id = history.location.pathname.split("/")[3];
    const isAddMode = !id;
    let endTime;
    let startTime;


    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            scheduledDate: new Date().toISOString().split("T")[0],
            quantity: 1
        }
    });
    const { append: componentsAppend, remove: componentsRemove, fields: componentsFields } = useFieldArray({ control, name: "components" });
    const { append: operationsAppend, remove: operationsRemove, fields: operationsFields } = useFieldArray({ control, name: "operations" });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        console.log(data);
        ApiService.setHeader();
        return ApiService.post('/jobOrder', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/manufacturings/jobOrders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        console.log(data);
        ApiService.setHeader();
        return ApiService.patch(`/jobOrder/${id}`, data).then(response => {
            if (response.data.isSuccess) {
                history.push("/manufacturings/jobOrders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const deleteDocument = () => {
        // ApiService.setHeader();
        // return ApiService.delete(`/loyalty/${id}`).then(response => {
        //     if (response.status == 204) {
        //         history.push("/pos/loyaltys");
        //     }
        // }).catch(e => {
        //     console.log(e);
        // })
    }

    if (isAddMode) {
        setValue('responsible', user.id)
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

        const uomResponse = await ApiService.get('uom');
        if (uomResponse.data.isSuccess) {
            setUOMList(uomResponse.data.documents)
        }

        const bomResponse = await ApiService.get('bom');
        if (bomResponse.data.isSuccess) {
            setBOMList(bomResponse.data.documents)
        }

        const workCenterResponse = await ApiService.get('workCenter');
        if (workCenterResponse.data.isSuccess) {
            setWorkCenterList(workCenterResponse.data.documents)
        }

        if (!isAddMode) {

            ApiService.setHeader();

            ApiService.get(`jobOrder/${id}`).then(response => {
                const jobOrder = response.data.document;
                setstate(jobOrder)
                reset(jobOrder);
                if (jobOrder.scheduledDate) {
                    setValue('scheduledDate', jobOrder.scheduledDate.split("T")[0]);
                }

            }).catch(e => {
                console.log(e)
            })
        }

    }, []);




    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>

            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-1 pb-2" fluid>
                    <Row>
                        <Col><h3>{isAddMode ? "New Job Order" : state.name}</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            <Button as={Link} to="/manufacturings/joborders" variant="light" size="sm">DISCARD</Button>
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
                    {/* <Row className="p-0 mt-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && <Button onClick={handleInvoicePrinting} type="button" variant="primary">PRINT INVOICE</Button>}
                                {state.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleConfirmButton} type="button" variant="light">ADD CREDIT NOTE</Button> : ""}
                                {state.status == "Posted" ? <Button onClick={handleConfirmButton} type="button" variant="light">RESET TO DRAFT</Button> : ""}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                             <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.status == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div> 
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
                            </div>
                        </Col>
                    </Row> */}

                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Product</Form.Label>
                                <Form.Select
                                    id="product"
                                    name="product"
                                    {...register("product")}
                                    onChange={async (e) => {
                                        const billOfMetirials = await ApiService.get("bom/" + e.target.value)

                                        setValue(`components`, billOfMetirials.data.document.components)
                                        setValue(`operations`, billOfMetirials.data.document.operations)
                                    }}
                                >
                                    <option value={null}>Choose...</option>
                                    {
                                        productList?.map((e) => {
                                            return <option value={e.id} key={e.id}>{e.name}</option>
                                        })
                                    }
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Quantity</Form.Label>
                                <Form.Control min={1}
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    // disabled={true}
                                    {...register("quantity")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Scheduled Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    // disabled={true}
                                    {...register("scheduledDate")}
                                />
                            </Form.Group>
                        </Row>

                        <Row>

                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Responsible</Form.Label>

                                <Form.Select id="responsible" name="responsible" {...register("responsible", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {employeeList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
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
                                                    <th style={{ minWidth: "16rem" }}>To Consume</th>
                                                    <th style={{ minWidth: "16rem" }}>Unit</th>
                                                    <th></th>

                                                </tr>
                                            </thead>
                                            <tbody>

                                                {componentsFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select id="component" name="component" {...register(`components.${index}.component`)}
                                                                    onChange={async (e) => {
                                                                        const p = await ApiService.get("product/" + e.target.value)
                                                                        setValue(`components.${index}.unit`, p.data.document.uom)
                                                                    }}
                                                                >
                                                                    <option value={null}>Choose...</option>
                                                                    {
                                                                        productList?.map((e) => {
                                                                            return <option value={e.id} key={e.id}>{e.name}</option>
                                                                        })
                                                                    }
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`components.${index}.quantity`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select
                                                                    type="number"
                                                                    id="unit"
                                                                    name="unit"
                                                                    {...register(`components.${index}.unit`)}
                                                                >
                                                                    <option value={null}>Choose...</option>
                                                                    {
                                                                        uomList?.map((e) => {
                                                                            return <option value={e.id} key={e.id}>{e.name}</option>
                                                                        })
                                                                    }
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    componentsRemove(index)

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => componentsAppend({ component: null, quantity: 1, unit: null })} >Add a line</Button>
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
                                        <Table responsive striped hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Operation</th>
                                                    <th style={{ minWidth: "16rem" }}>Work Center</th>
                                                    <th style={{ minWidth: "10rem" }}>Start Date</th>
                                                    <th style={{ minWidth: "10rem" }}>End Date</th>
                                                    <th style={{ minWidth: "10rem" }}>Expected Duration</th>
                                                    <th style={{ minWidth: "10rem" }}>Real Duration</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Status</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Action</th>}
                                                    <th></th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {operationsFields.map((field, index) => {
                                                    return <tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control id="operation" name="operation" {...register(`operations.${index}.operation`)}>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        {/* <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="steps"
                                                                    name="steps"
                                                                    {...register(`operations.${index}.steps`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td> */}
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select id="workCenter" name="workCenter" {...register(`operations.${index}.workCenter`)}>
                                                                    <option value={null}>Choose..</option>
                                                                    {workCenterList.map((element, index) => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled type="text" id="startDate" name="startDate" {...register(`operations.${index}.startDate`)}>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control disabled
                                                                    type="text"
                                                                    id="endDate"
                                                                    name="endDate"
                                                                    {...register(`operations.${index}.endDate`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="expectedDuration"
                                                                    name="expectedDuration"
                                                                    {...register(`operations.${index}.expectedDuration`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        <td>

                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="realDuration"
                                                                    name="realDuration"
                                                                    {...register(`operations.${index}.realDuration`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>

                                                        {/* <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="realDurationEnd"
                                                                    name="realDurationEnd"
                                                                    {...register(`operations.${index}.realDurationEnd`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td> */}

                                                        {!isAddMode && <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="status"
                                                                    name="status"
                                                                    disabled
                                                                    {...register(`operations.${index}.status`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>}

                                                        {!isAddMode && timeStatus === "wating" && <td>

                                                            <Button style={{ minWidth: "4rem" }} size="sm" variant="primary"
                                                                onClick={() => {
                                                                    setValue(`operations.${index}.startDate`, new Date().toISOString().split("T")[0])
                                                                    setValue(`operations.${index}.status`, "In Progress")
                                                                    settimeStatus('inProgress')
                                                                    startTime = new Date().toLocaleString().split(",")[1].split(" ")[1]
                                                                }}
                                                            >Start</Button>
                                                        </td>}

                                                        {!isAddMode && timeStatus === "inProgress" && <td>
                                                            <Button style={{ minWidth: "4rem" }} size="sm" variant="warning"
                                                                onClick={() => {
                                                                    let realDuration = 0;

                                                                    setValue(`operations.${index}.endDate`, new Date().toISOString().split("T")[0])
                                                                    settimeStatus('done')

                                                                    endTime = new Date().toLocaleString().split(",")[1].split(" ")[1]
                                                                    console.log(endTime?.split(":"));

                                                                    if ((parseInt(endTime?.split(":")[0]) - parseInt(startTime?.split(":")[0])) == 0) {
                                                                        realDuration += 0;
                                                                        console.log(realDuration);
                                                                    } else {
                                                                        const timeDifference = parseInt(endTime?.split(":")[0]) - parseInt(startTime?.split(":")[0])
                                                                        realDuration += parseInt(timeDifference * 60);
                                                                        console.log(realDuration);
                                                                    }
                                                                    if ((parseInt(endTime?.split(":")[1]) - parseInt(startTime?.split(":")[1])) == 0) {
                                                                        realDuration += 0;
                                                                        console.log(realDuration);
                                                                    } else {
                                                                        const timeDifference = parseInt(endTime?.split(":")[1]) - parseInt(startTime?.split(":")[1])
                                                                        realDuration += timeDifference;
                                                                        console.log(realDuration);
                                                                    }
                                                                    console.log(realDuration);
                                                                    setValue(`operations.${index}.realDuration`, realDuration)

                                                                }}
                                                            >Done</Button>
                                                            {/* <Button style={{ minWidth: "4rem" }} size="sm" variant="success" >Done</Button> */}
                                                        </td>}


                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    operationsRemove(index)

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                    </tr>
                                                })}

                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => operationsAppend({})} >Add a line</Button>
                                                    </td>
                                                </tr>


                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab >
                            <Tab eventKey="miscellaneous" title="Miscellaneous">

                            </Tab>

                        </Tabs >
                    </Container >

                </Container >
            </Form >

        </Container >
    )

}
