import { React, useEffect, useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import SizesList from './SizesList';
const moment = require('moment');

export default function SizeList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();
    const history = useHistory();
    // const { id } = useParams();
    let id = history?.location.pathname.split("/")[3];
    const isAddMode = !id;
    console.log("isAddMode Top", isAddMode);

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
        }
    });

    const onSubmit = async (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        try {
            ApiService.setHeader();
            // setLoderStatus("RUNNING");
            const res = await ApiService.post('/sizeList', data)
            console.log(res.data.document);
            if (res.data.isSuccess) {
                // console.log(res.data.document);
                // const response = await ApiService.get('sizeList');
                // console.log(response.data.documents)
                // setstate(response.data.documents)

                history.push("/purchase/sizeLists");
                // setLoderStatus("SUCCESS");
            }

        } catch (err) {
            alert(err)
        }
    }

    const updateDocument = (id, data) => {

        ApiService.setHeader();
        return ApiService.patch(`/sizeList/${id}`, data).then(response => {
            if (response.data.isSuccess) {
                history.push("/purchase/sizeLists");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const deleteDocument = () => {
        return ApiService.delete(`bill/${id}`).then(response => {
            history.push("/purchase/bills");

        }).catch(e => {
            console.log(e);
        })
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            console.log("isAddMode", isAddMode);

            ApiService.setHeader();
            const response = await ApiService.get(`sizeList/${id}`)
            if (response.data.isSuccess) {
                setLoderStatus("SUCCESS");
                const itemReceipt = response.data.document;
                // setState(itemReceipt)
                console.log(itemReceipt);
                reset(itemReceipt);
            }
        }

        setLoderStatus("SUCCESS");
    }, [])

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col>
                            <h3>Size List</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/purchase/orders' }} ><h3 className="breadcrum-label">Purchase Orders</h3></Breadcrumb.Item>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/purchase/order/${state?.sourceDocument?.id}?mode=view` }} ><span className="breadcrum-label">{state?.sourceDocument?.name}</span></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            <Button as={Link} to={`/${url?.split('/')[1]}/sizeLists`} variant="light" size="sm">DISCARD</Button>
                            {/* {!isAddMode && state.status === "Draft" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>} */}

                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Size</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    {...register("name")}
                                />
                            </Form.Group>
                        </Row>

                    </Container>

                </Container>
                <Container fluid>
                    {/* {
                        state && (
                            <SizesList data={state} />
                        )
                    } */}
                </Container>
            </Form>

        </Container>
    )
}
