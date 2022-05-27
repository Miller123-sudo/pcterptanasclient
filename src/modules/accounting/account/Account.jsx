import { React, useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Breadcrumb, Table, DropdownButton, Dropdown } from 'react-bootstrap';
import { FadeLoader, PropagateLoader } from "react-spinners";
import { Link, useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../../helpers/ApiServices';

export default function Account() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setState] = useState({});
    const [accountTypeList, setAccountTypeList] = useState([])
    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
        }
    });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/account/procedure', data).then(response => {
            if (response.data.isSuccess) {
                navigate("/accountings/accounts");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/account/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate("/accountings/accounts");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/account/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                navigate("/accountings/accounts");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const accountTypeResponse = await ApiService.get('accountType');
        console.log(accountTypeResponse.data.documents)
        if (accountTypeResponse.data.isSuccess) {
            setAccountTypeList(accountTypeResponse.data.documents)
        }

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`account/${id}`).then(response => {
                setLoderStatus("SUCCESS");
                const employee = response.data.document;
                setState(employee)
                reset(employee);
                if (employee.date) {
                    setValue('date', employee.date.split("T")[0])
                }

            }).catch(e => {
                console.log(e)
            })
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
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Breadcrumb style={{ fontSize: '24px' }}>
                            <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: '/accountings/accounts' }} ><h3 className="breadcrum-label">Chart of Accounts</h3></Breadcrumb.Item>
                            {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>{state.name}</span></Breadcrumb.Item>}
                        </Breadcrumb>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/accountings/accounts" variant="light" size="sm">DISCARD</Button>
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
                                <Form.Label className="m-0">Account Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="accountNumber"
                                    name="accountNumber"
                                    {...register("accountNumber")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Account Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="title"
                                    name="title"
                                    {...register("title")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Account Type</Form.Label>
                                <Form.Select id="accountType" name="accountType" {...register("accountType")}>
                                    <option value={null}>Choose..</option>
                                    {accountTypeList.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>

                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    {...register("description")}
                                />
                            </Form.Group>
                        </Row>
                    </Container>

                </Container>
            </Form>
        </Container>
    )
}


