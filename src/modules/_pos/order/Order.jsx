import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb, FormSelect } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
// import { useHistory, useParams } from 'react-router';
// import { Link, useLocation } from 'react-router-dom';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { PropagateLoader } from "react-spinners";
import { BsTrash } from 'react-icons/bs';
import { isAfter } from 'date-fns';
import ApiService from '../../../helpers/ApiServices';
import PCTCustomer from '../../../components/form/searchAndSelect/PCTCustomer';
import PCTEmployee from '../../../components/form/searchAndSelect/PCTEmployee';
import PCTProduct from '../../../components/form/searchAndSelect/PCTProduct';

export default function Order() {
    // const [state, setstate] = useState({})
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({ total: 0 });
    const [tabKey, setTabKey] = useState('address');
    const [isShippingTick, setIsShippingTick] = useState([]);
    const [isShippingTickAdd, setIsShippingTickAdd] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [productList, setProductList] = useState([]);
    // const history = useHistory();
    // const { id } = useParams();
    // const isAddMode = !id;

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const stack = query.get('stack');

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });

    // const { append, remove, fields } = useFieldArray({ control, name: "addresses" });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });



    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        console.log(data)
        return ApiService.post('/cashSale', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/pos/orders`);
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        console.log(data)
        ApiService.setHeader();
        return ApiService.patch(`/cashSale/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/pos/orders`);
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/cashSale/${id}`).then(response => {
            console.log(response.data)
            navigate(`/pos/orders`);
        }).catch(e => {
            console.log(e);
        })

    }

    useEffect(() => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        ApiService.get(`/customer`).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                setCustomerList(response.data.documents);
            }
        }).catch(e => {
            console.log(e);
        })

        ApiService.get(`/employee`).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                setEmployeeList(response.data.documents)
            }
        }).catch(e => {
            console.log(e);
        })

        ApiService.get(`/product`).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                setProductList(response.data.documents)
            }
        }).catch(e => {
            console.log(e);
        })

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`/cashSale/${id}`).then(response => {
                setLoderStatus("SUCCESS");
                console.log(response.data.document)
                setstate(response.data.document)
                reset(response.data.document);
                setValue('date', response.data.document.date.split("T")[0])

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
        <Container className="pct-app-content-container p-0 m-0 mt-2" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        {/* <Col><h3>{isAddMode ? "New cashSale" : state.name}</h3></Col> */}
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: `/pos/orders` }} style={{ textDecoration: 'none !important' }} ><h3 className="breadcrum-label" style={{ textDecoration: 'none !important' }}>Cash Sale</h3></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.cashSaleId}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/pos/orders`} variant="light" size="sm">DISCARD</Button>{" "}
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item> */}
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Container fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Cash Sale ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="cashSaleId"
                                    name="cashSaleId"
                                    {...register("cashSaleId")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Customer</Form.Label>
                                <PCTCustomer control={control} name={"customer"} />
                                {/* <FormSelect id="customer" name="customer" {...register("customer")} >
                                    <option value={null}>Choose..</option>
                                    {customerList && customerList.map((value, index) => {
                                        return <option key={index} value={value.id}>{value.name}</option>
                                    })}
                                </FormSelect> */}
                            </Form.Group>
                            <Form.Group as={Col} md="3" className="mb-2">
                                <Form.Label className="m-0">Employee</Form.Label>
                                <PCTEmployee control={control} name={"salesRep"} />
                                {/* <FormSelect id="salesRep" name="salesRep" {...register("salesRep")} >
                                    <option value={null}>Choose..</option>
                                    {employeeList && employeeList.map((value, index) => {
                                        return <option key={index} value={value.id}>{value.name}</option>
                                    })}
                                </FormSelect> */}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="date"
                                    name="date"
                                    {...register("date")}
                                />
                            </Form.Group>
                        </Row>
                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="address" title="Address">
                                <Card style={{ width: '100%' }}>
                                    <Card.Header>Address</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Size</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    <th style={{ minWidth: "16rem" }}>Unit Price</th>
                                                    <th style={{ minWidth: "16rem" }}>Sub Total</th>
                                                    <th style={{ minWidth: "16rem" }}>MRP</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <PCTProduct control={control} name={"product"} {...register(`products.${index}.product`, { required: true })} onBlur={async (e) => {
                                                                    console.log(e.target.value);

                                                                    const product = await ApiService.get(`product/search/${e.target.value}`);
                                                                    console.log(product.data.document);

                                                                    setValue(`products.${index}.name`, product.data.document[0]?.name);
                                                                    setValue(`products.${index}.quantity`, 1);
                                                                    setValue(`products.${index}.description`, product.data.document[0]?.description);
                                                                    setValue(`products.${index}.size`, product.data.document[0]?.size);
                                                                    setValue(`products.${index}.unitRate`, product.data.document[0]?.salesPrice);
                                                                    setValue(`products.${index}.subTotal`, (product.data.document[0]?.salesPrice * 1));
                                                                    setValue(`products.${index}.mrp`, product.data.document[0]?.salesPrice);
                                                                }} />
                                                                {/* <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}>
                                                                    <option value={null}></option>
                                                                    {productList.map(element => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select> */}
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
                                                                    type="text"
                                                                    id="size"
                                                                    name="size"
                                                                    {...register(`products.${index}.size`)} />
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
                                                                        setstate(prevState => ({
                                                                            // object that we want to update
                                                                            ...prevState,    // keep all other key-value pairs
                                                                            total: cumulativeSum       // update the value of specific key

                                                                        }));
                                                                        console.log("New State", state)

                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="unitRate"
                                                                    name="unitRate"
                                                                    {...register(`products.${index}.unitRate`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`products.${index}.subTotal`)}
                                                                >
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="number"
                                                                    id="mrp"
                                                                    name="mrp"
                                                                    {...register(`products.${index}.mrp`)}
                                                                >
                                                                </Form.Control>
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
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ product: null, description: '', quantity: 1, unitPrice: 0, subTotal: 0 })} >Add a product</Button>
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


