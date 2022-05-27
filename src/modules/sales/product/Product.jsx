import { React, useEffect, useState } from 'react';
import { Form, Col, Button, Container, Row, Tabs, Tab, DropdownButton, Dropdown, ButtonGroup } from 'react-bootstrap';
import { useHistory, useParams, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { useFieldArray, useForm } from "react-hook-form";
import { BsArrowLeft, BsArrowRight, BsFillCreditCardFill, BsFillBarChartFill } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';


export default function Product() {
    let { path, url } = useRouteMatch();
    console.log(useRouteMatch())
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setstate] = useState({});
    const [accountList, setAccountList] = useState([]);
    const [uom, setuom] = useState([]);
    const [HSNSACS, setHSNSACS] = useState([]);
    const [tabKey, setTabKey] = useState('generalInformations');
    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            // incomeAccount: "617c907c42c45b4089d04410",
            incomeAccount: "61b839ddd6fe795ec8bf53fb",
            // expenseAccount: "617c90d842c45b4089d04416",
            expenseAccount: "61b839ddd6fe795ec8bf53f6",
            // assetAccount: "617c8fa842c45b4089d04402",
            assetAccount: "61b839ddd6fe795ec8bf53f7",
            totalPurchasedQuantity: 0,
            totalSoldQuantity: 0,
            onHand: 0,
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
        return ApiService.post('/product', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/sales/products");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/product/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/sales/products");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/product/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                history.push("/sales/products");
            }
        }).catch(e => {
            console.log(e);
        })
    }
    useEffect(async () => {
        setLoderStatus("RUNNING");

        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents);
        }

        const uomResponse = await ApiService.get('uom');
        if (uomResponse.data.isSuccess) {
            setuom(uomResponse.data.documents);
        }

        const HSNSACSResponse = await ApiService.get('gstRates');
        if (HSNSACSResponse.data.isSuccess) {
            setHSNSACS(HSNSACSResponse.data.documents);
        }

        if (isAddMode) {
            // setValue('incomeAccount', '617c907c42c45b4089d04410');
            // setValue('expenseAccount', '617c90d842c45b4089d04416');
            // setValue('assetAccount', '617c8fa842c45b4089d04402');

            setValue('incomeAccount', '61b839ddd6fe795ec8bf53fb');
            setValue('expenseAccount', '61b839ddd6fe795ec8bf53f6');
            setValue('assetAccount', '61b839ddd6fe795ec8bf53f7');
        }
        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`product/${id}`).then(response => {

                console.log(response.data.document)
                setstate(response.data.document)
                reset(response.data.document);
                setLoderStatus("SUCCESS");
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
                        <Col><h3>{isAddMode ? "Create New Product" : state.name}</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/${url?.split('/')[1]}/products`} variant="light" size="sm">DISCARD</Button>{" "}
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item> */}
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0" fluid>
                    <Container className=" bg-light p-0 m-0" style={{ backgroundColor: 'pink', height: '40px' }} fluid>
                        <Row className="m-0 p-0">
                            <Col className="m-0 p-0 text-center" sm="6" xs="6">
                                <div class="p-2 bg-light">
                                    <BsFillBarChartFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('totalSoldQuantity')} Units  Sold

                                </div>
                            </Col>
                            <Col className="m-0 p-0 text-center" sm="6" xs="6">
                                <div class="p-2 bg-light">
                                    <BsFillCreditCardFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('totalPurchasedQuantity')} Units  Purchased

                                </div>
                            </Col>
                        </Row>
                    </Container>
                    <Container className="mt-4" fluid>
                        <Row>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                <Form.Label className="m-0">Product Name</Form.Label>
                                <Form.Control id="name" name="name" {...register("name")} size="sm" type="text" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Sales Price</Form.Label>
                                <Form.Control id="salesPrice" name="salesPrice" {...register("salesPrice")} size="sm" step="0.001" type="number" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                <Form.Label className="m-0">Cost</Form.Label>
                                <Form.Control id="cost" name="cost" {...register("cost")} size="sm" step="0.001" type="number" />
                            </Form.Group>

                        </Row>
                        <Row>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Product Description</Form.Label>
                                <Form.Control id="description" name="description" {...register("description")} size="sm" as="textarea" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Remark</Form.Label>
                                <Form.Control id="remark" name="remark" {...register("remark")} size="sm" as="textarea" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Units</Form.Label>
                                <Form.Select id="uom" name="uom" {...register("uom")}>
                                    <option value={null}>Choose..</option>
                                    {uom.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="generalInformations" title="General Informations">
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Location</Form.Label>
                                        <Form.Control id="location" name="location" {...register("location")} size="sm" type="text" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Quantity On Hand</Form.Label>
                                        <Form.Control id="onHand" name="onHand" {...register("onHand")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Barcode</Form.Label>
                                        <Form.Control id="barcode" name="barcode" {...register("barcode")} size="sm" type="text" />
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Available</Form.Label>
                                        <Form.Control id="available" name="available" {...register("available")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Commited</Form.Label>
                                        <Form.Control id="commited" name="commited" {...register("commited")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Average Cost</Form.Label>
                                        <Form.Control id="averageCost" name="averageCost" {...register("averageCost")} size="sm" type="number" />
                                    </Form.Group>
                                </Row>
                            </Tab>
                            {/* <Tab eventKey="purchase" title="Purchase">

                            </Tab>*/}
                            <Tab eventKey="tax" title="Tax Information">
                                <Row><a href="https://cbic-gst.gov.in/gst-goods-services-rates.html" target="_blank">For more info about taxes....</a></Row>
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">HSN / SACS Code</Form.Label>
                                        <Form.Select id="HSNSACS" name="HSNSACS" {...register("HSNSACS")}
                                            onChange={async (e) => {
                                                const HSNSACSNo = await ApiService.get('gstRates/' + e.target.value);
                                                setValue(`cgstRate`, HSNSACSNo.data.document.cgstRate);
                                                setValue(`igstRate`, HSNSACSNo.data.document.igstRate);
                                                setValue(`sgstRate`, HSNSACSNo.data.document.sgstRate);
                                                setValue(`cess`, HSNSACSNo.data.document.cess);

                                            }}
                                        >
                                            <option value={null}>Choose..</option>
                                            {HSNSACS.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">CGST Rate(%)</Form.Label>
                                        <Form.Control id="cgstRate" name="cgstRate" {...register("cgstRate")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">SGST / UTGST(%)</Form.Label>
                                        <Form.Control id="sgstRate" name="sgstRate" {...register("sgstRate")} size="sm" type="number" />
                                    </Form.Group>

                                </Row>
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">IGST Rate(%)</Form.Label>
                                        <Form.Control id="igstRate" name="igstRate" {...register("igstRate")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Cess(%)</Form.Label>
                                        <Form.Control id="cess" name="cess" {...register("cess")} size="sm" type="number" />
                                    </Form.Group>

                                </Row>
                            </Tab>
                            <Tab eventKey="accounting" title="Accounting">
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Income Account</Form.Label>
                                        <Form.Select id="incomeAccount" name="incomeAccount" {...register("incomeAccount")}>
                                            <option value={null}>Choose..</option>
                                            {accountList.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>

                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Expense Account</Form.Label>
                                        <Form.Select id="expenseAccount" name="expenseAccount" {...register("expenseAccount")}>
                                            <option value={null}>Choose..</option>
                                            {accountList.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Asset Account</Form.Label>
                                        <Form.Select id="assetAccount" name="assetAccount" {...register("assetAccount")}>
                                            <option value={null}>Choose..</option>
                                            {accountList.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                    {/* <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Price Difference Account</Form.Label>
                                        <Form.Control id="barcode" name="barcode" {...register("barcode")} size="sm" type="text" />
                                    </Form.Group> */}
                                </Row>
                            </Tab>

                        </Tabs>
                    </Container>
                </Container>



            </Form >
        </Container >

    )
}