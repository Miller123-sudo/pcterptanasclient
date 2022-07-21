import { React, useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { PropagateLoader } from "react-spinners";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import ApiService from '../../helpers/ApiServices';
import AppLoader from '../../pcterp/components/AppLoader';
import TextField from '../../pcterp/field/TextField';
import { formatNumber, infoNotification, TanasUtils } from '../../helpers/Utils';
import DateField from '../../pcterp/field/DateField';
const moment = require('moment');

export default function TotalCustomerHandledByDate() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [total, settotal] = useState(0.00);
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
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${rootPath}/salesorders/edit/${params.value}`}><BsBoxArrowInUpRight /></Button>
        //             {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/employees/employee/${params.value}?mode=view`}><BsEyeFill /></Button> */}
        //         </>
        // },
        { headerName: 'ID#', field: 'name' },
        { headerName: 'CUSTOMER', field: `customer`, valueGetter: (params) => params.data?.customer ? params.data?.customer[0]?.name : "Not Available" },
        // { headerName: 'INVOICE DATE', field: 'invoiceDate', valueGetter: (params) => params.data?.invoiceDate ? moment(params.data?.invoiceDate).format("MM/DD/YYYY ") : "Not Available" },
        { headerName: 'DATE', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("MM/DD/YYYY ") : "Not Available" },
        { headerName: 'TOTAL', field: 'estimation.total', valueGetter: (params) => formatNumber(params.data.estimation?.total) },
    ]

    const renderStatus = (value) => {
        switch (value) {
            case 'Nothing to Invoice': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Not Paid': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Paid': {
                return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
        }
    }

    const handleSearchInvAdj = async () => {
        console.log(getValues());
        const response = await ApiService.get(`inventoryAdjustment/findStockUndervalued`);
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)
        }
    }

    const salesReportByWeek = async () => {
        if (getValues("startDate") > getValues("endDate")) {
            infoNotification("Start date must be less than end date")
        } else {
            const response = await ApiService.get(`salesOrder/findSalesAndOrderByDay?startDate=${getValues("startDate")}&endDate=${getValues("endDate")}`);
            if (response.data.isSuccess) {
                console.log(response.data.documents)
                setstate(response.data.documents)

                // if (response.data.documents.length) {
                //     let tot = 0;
                //     response.data.documents?.map(e => {
                //         tot += e.estimation?.total
                //         settotal(tot)
                //     })
                // } else {
                //     console.log("no");
                //     settotal(0)
                // }
            }
        }
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log(getValues())
        const response = await ApiService.get(`salesOrder/findSalesAndOrderByDay?startDate=${getValues("startDate")}&endDate=${getValues("endDate")}`);
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)

            // if (response.data.documents.length) {
            //     let tot = 0;
            //     response.data.documents?.map(e => {
            //         tot += e.estimation?.total
            //         settotal(tot)
            //     })
            // } else {
            //     console.log("no");
            //     settotal(0)
            // }
        }
        setLoderStatus("SUCCESS");
    }, [])



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
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>TOTAL CUSTOMER HANDLED FOR DAY, WEEK, MONTH OR YEAR</div></Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1' style={{ width: "300px", maxWidth: "320px", marginLeft: 9 }}>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Control size='sm' style={{ width: "300px" }}
                                    defaultValue={new Date().toISOString().split("T")[0]}
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    {...register("startDate")}
                                />

                            </Form.Group>
                        </Col>
                        <Col className='p-0 ps-1' style={{ width: "300px", maxWidth: "320px" }}>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Control size='sm' style={{ width: "300px" }}
                                    defaultValue={new Date().toISOString().split("T")[0]}
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    {...register("endDate")}
                                />

                            </Form.Group>
                        </Col>
                        <Col className='p-0 ps-1'>

                            <Button onClick={salesReportByWeek} variant="primary" size="sm"><span>FIND</span></Button>
                        </Col>
                        <Col md="4" sm="4">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="primary" size="sm"><span>EXPORT CSV</span></Button></Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row><span><b>Total Customer Handled: </b>{state.length}</span></Row>

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
        </Container >
    )
}
