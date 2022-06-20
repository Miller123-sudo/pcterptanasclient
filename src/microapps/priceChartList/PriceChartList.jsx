import { React, useEffect, useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { PropagateLoader } from "react-spinners";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import ApiService from '../../helpers/ApiServices';
import AppLoader from '../../pcterp/components/AppLoader';
const moment = require('moment');

export default function PriceChartList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    // let { path, url } = useRouteMatch();
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
                setValue("range", " ")
                document.getElementById("range").focus();
            }
        }

    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log("hi")
        const response = await ApiService.get('priceChartUpload');
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)
            setLoderStatus("SUCCESS");
        }
    }, [])

    // if (loderStatus === "RUNNING") {
    //     return (
    //         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
    //     )
    // }

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>PRICE CHART</h3></Col>
                    </Row>

                    <Row>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">COST</Form.Label>
                            <Form.Control
                                type="text"
                                id="range"
                                name="range"
                                {...register("range")}
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
                            <Button variant="primary" size="sm" onClick={findMRP} style={{ marginTop: 26 }}>CALCULATE</Button>
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


                </Container>


            </Container>
        </Container>
    )
}
