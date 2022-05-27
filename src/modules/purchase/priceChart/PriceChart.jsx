import { React, useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, Breadcrumb, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { PurchaseOrderPDF } from '../../../helpers/PDF';
import axios from "axios";
import * as xlxs from "xlsx";

export default function PriceChart() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    let { path, url } = useRouteMatch();
    const [state, setState] = useState({});
    const [fileUpload, setfileUpload] = useState();
    const [xlfile, setxlfile] = useState();
    const [billtotal, setbilltotal] = useState(0);
    const [billsgsttotal, setbillsgsttotal] = useState(0);
    const [billcgsttotal, setbillcgsttotal] = useState(0);
    const [billsubtotal, setbillsubtotal] = useState(0);
    const [accountList, setAccountList] = useState([])
    const [journals, setJournals] = useState([])
    const [tabKey, setTabKey] = useState('invoiceLines');
    const [productList, setProductList] = useState([]);
    const [supplierList, setSupplierList] = useState([])

    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            total: 0,
            currency: null,
            subsidiary: null,
            location: null
        }
    });
    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    const onSubmit = async (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        console.log(xlfile);
        const wb = xlxs.read(xlfile, { type: "buffer" })
        const wbName = wb.SheetNames[0]
        const ws = wb.Sheets[wbName]
        const xlData = xlxs.utils.sheet_to_json(ws)
        console.log(xlData);

        try {
            ApiService.setHeader();

            const response = await ApiService.delete('/priceChartUpload/procedure')
            if (response.data.isSuccess) {
                const res = await ApiService.post('/priceChartUpload/procedure', xlData)
                if (res.data.isSuccess) {
                    console.log(res.data.documents);
                    history.push("/purchase/priceCharts");
                }
            }
        } catch (err) {
            alert(err)
        }
    }

    const updateDocument = (id, data) => {
        if (state.status == "Posted") {
            alert("you can'tupdate this document")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/bill/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    history.push("/purchase/vendorbills");
                }
            }).catch(e => {
                console.log(e);
            })
        }


    }

    const deleteDocument = () => {

        return ApiService.delete(`bill/${id}`).then(response => {
            history.push("/purchase/bills");

        }).catch(e => {
            console.log(e);
        })
    }

    const formatingXlData = (data) => {

    }


    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content">
                <Container className="pct-app-content-header m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>Price Chart Upload</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>
                            <Button as={Link} to={`/${url?.split('/')[1]}/bills`} variant="light" size="sm">DISCARD</Button>
                            {/* {!isAddMode && state.status !== "Posted" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">

                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>} */}

                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mt-2 m-0">
                        {/* <Col>
                            <ButtonGroup size="sm">

                                {state.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                                {state.status == "Posted" && state.paymentStatus == "Not Paid" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
                            </ButtonGroup>
                        </Col> */}
                        {/* <Col style={{ display: 'flex', justifyContent: 'end' }}>
                           
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.status}</div>}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.paymentStatus}</div>}
                            </div>
                        </Col> */}
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

