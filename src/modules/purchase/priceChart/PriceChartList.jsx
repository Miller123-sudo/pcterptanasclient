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
const moment = require('moment');

export default function PriceChartList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();
    const { id } = useParams();

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
        }
    });

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }
    const handleSearch = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const handleExportAsCsv = (e) => {
        gridApi.exportDataAsCsv();
    }

    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        // {
        //     headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
        //         <>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}`}><BsBoxArrowInUpRight /></Button>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}`}><BsEyeFill /></Button>
        //         </>
        // },
        { headerName: 'Range0', field: 'range0' },
        { headerName: 'Range1', field: 'range1' },
        { headerName: 'Other Percentage', field: 'otherPercentage' },
        { headerName: 'Profit Percentage', field: 'profitPercentage' },
        { headerName: 'GST Percentage', field: 'gstPercentage' },
        { headerName: 'Basic Calculation', field: 'basicCalculation' },
        { headerName: 'Old System Calculation', field: 'oldSystemCalculation' },
        { headerName: 'Difference', field: 'difference' },
        { headerName: 'Other Difference', field: 'otherDifference' },
        { headerName: 'MRP', field: 'MRP' },
    ]

    const findMRP = async () => {
        if (value) {
            const response = await ApiService.patch(`priceChartUpload/findMRP?search=${value}`);
            if (response.data.isSuccess) {
                setValue("mrp", response.data.document.MRP)
            }
        }

    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('priceChartUpload');
        console.log(response.data.documents)
        setstate(response.data.documents)
        setLoderStatus("SUCCESS");
    }, [])

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>Price Chart</h3></Col>
                    </Row>

                    <Row>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Cost</Form.Label>
                            <Form.Control
                                type="text"
                                id="range"
                                name="range"

                                onBlur={async (e) => {
                                    console.log(e.target.value);
                                    if (e.target.value) {
                                        setvalue(e.target.value)
                                    } else {
                                        setValue("mrp", " ")
                                    }

                                }}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Button variant="primary" size="md" onClick={findMRP} style={{ marginTop: 26 }}>Calculate</Button>
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">MRP</Form.Label>
                            <Form.Control
                                disabled
                                type="text"
                                id="mrp"
                                name="mrp"
                                {...register("mrp")}
                            />
                        </Form.Group>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                        <AgGridReact
                            onGridReady={onGridReady}
                            rowData={state}
                            columnDefs={columns}
                            defaultColDef={{
                                editable: false,
                                sortable: true,
                                flex: 1,
                                minWidth: 100,
                                filter: true,
                                resizable: true,
                                minWidth: 200
                            }}
                            pagination={true}
                            paginationPageSize={50}
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th >#ID</th>
                                <th >Product Name</th>
                                <th >Description</th>
                                <th >Sales Price</th>
                                <th >Cost</th>
                                <th >Quantity On Hand</th>
                                <th >Forecasted Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/product/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>

                                        </td>
                                        <td>{element.name}</td>
                                        <td>{element.description}</td>
                                        <td>{formatNumber(element.salesPrice)}</td>
                                        <td>{formatNumber(element.cost)}</td>
                                        <td>{element.onHand}</td>
                                        <td>{element.available}</td>
                                    </tr>
                                })
                            }


                        </tbody>
                    </Table> */}
                    {/* {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>No product found. Let's create one!</h4>
                        <h6>You must define a product for everything you sell or purchase, whether it's a storable product, a consumable or a service.</h6>
                    </Container> : ""} */}

                </Container>


            </Container>
        </Container>
    )
}
