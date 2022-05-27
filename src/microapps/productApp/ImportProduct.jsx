import { React, useState, useEffect } from 'react'
import { useParams } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, Breadcrumb, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import * as xlxs from "xlsx";
import ApiService from '../../helpers/ApiServices';
import { errorMessage, infoNotification } from '../../helpers/Utils';

export default function ImportProduct() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    // let { path, url } = useRouteMatch();
    const [state, setState] = useState({});
    const [fileUpload, setfileUpload] = useState();
    const [xlfile, setxlfile] = useState();
    const location = useLocation();
    const navigate = useNavigate();
    const rootPath = location?.pathname?.split('/')[1];

    // const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {}
    });


    const onSubmit = async (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        console.log(xlfile);
        // const wb = xlxs.read(xlfile, { type: "buffer" })
        // const wbName = wb.SheetNames[0]
        // const ws = wb.Sheets[wbName]
        // const xlData = xlxs.utils.sheet_to_json(ws)
        const xlData = getxlData()
        console.log(xlData);

        try {
            ApiService.setHeader();
            const res = await ApiService.post('/product/import', xlData)
            if (res.data.isSuccess) {
                console.log(res.data.documents);
                navigate(`/${rootPath}/product/list`);
            }

        } catch (e) {
            errorMessage(e, null)
        }
    }

    const updateDocument = (id, data) => {
        if (state.status == "Posted") {
            infoNotification("you can'tupdate this document")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/bill/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    navigate("/purchase/vendorbills");
                }
            }).catch(e => {
                errorMessage(e, null)
            })
        }


    }

    const getxlData = () => {
        const wb = xlxs.read(xlfile, { type: "buffer" })
        const wbName = wb.SheetNames[0]
        const ws = wb.Sheets[wbName]
        const xlData = xlxs.utils.sheet_to_json(ws)

        return xlData;
    }


    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content">
                <Container className="pct-app-content-header m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>Product Upload</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">IMPORT</Button>
                            <Button as={Link} to={`/${rootPath}/product/list`} variant="light" size="sm">DISCARD</Button>

                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="12" className="mb-2">
                                <Form.Label className="m-0">Upload file</Form.Label>
                                <Form.Control
                                    type="file"
                                    id="file"
                                    name="file"
                                    {...register("file")}
                                    onChange={(e) => {
                                        console.log(e.target.files[0]);
                                        setfileUpload(e.target.files[0])
                                        let reader = new FileReader()
                                        reader.readAsArrayBuffer(e.target.files[0])
                                        reader.onload = (e => {
                                            setxlfile(e.target.result)

                                        })
                                    }}
                                />
                            </Form.Group>

                        </Row>

                    </Container>

                </Container>
            </Form>
        </Container>
    )
}

