import { React, useContext, useEffect, useState } from 'react'
import { Col, Container, Row, Button, Table } from 'react-bootstrap';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Link, useLocation } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import { UserContext } from '../../../components/states/contexts/UserContext';

const moment = require('moment');

export default function BillList() {
    // const [loderStatus, setLoderStatus] = useState("");
    // const [state, setstate] = useState([]);
    // let { path, url } = useRouteMatch();

    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { dispatch, user } = useContext(UserContext)

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

    const columns = [
        {
            headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${rootPath}/bill/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${rootPath}/bill/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Bill', field: 'name' },
        { headerName: 'Vendor', field: 'vendor', valueGetter: (params) => params.data?.vendor ? params.data?.vendor?.name : "Not Available" },
        { headerName: 'Date', field: 'billDate', valueGetter: (params) => params.data?.billDate ? moment(params.data?.billDate).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Total', field: 'estimation', valueGetter: (params) => formatNumber(params.data?.estimation.total) },
        { headerName: 'Bill Status', field: 'status', cellRendererFramework: (params) => (renderStatus(params.value)), },
        { headerName: 'Payment Status', field: 'paymentStatus', cellRendererFramework: (params) => (renderStatus(params.value)), },

    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");

        try {
            const response = await ApiService.get('bill');
            console.log(response.data.documents)
            // setstate(response.data.documents)
            let array = new Array();
            response?.data?.documents?.map(e => {
                if (e.isStandalone) {
                    array.push(e)
                }
            })
            setstate(array)
        } catch (e) {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)

        }

        setLoderStatus("SUCCESS");
    }, []);

    const renderStatus = (value) => {
        switch (value) {
            // case 'Not Paid': {
            //     return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            //         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
            //     </div>
            // }
            case 'Not Paid': {
                return <div style={{ backgroundColor: 'red', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Paid': {
                return <div style={{ backgroundColor: 'green', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Billed': {
                return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Invoiced': {
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
                        <Col><h3>Standalone Vendor Bills</h3></Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/accountings/bill" variant="primary" size="sm">Create</Button></Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
                            </Row>
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col><Button as={Link} to={`/${url?.split('/')[1]}/bill`} variant="primary" size="sm">Create</Button></Col>
                    </Row> */}
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                        <AgGridReact
                            onGridReady={onGridReady}
                            rowData={state}
                            columnDefs={columns}
                            defaultColDef={{
                                editable: true,
                                sortable: true,
                                flex: 1,
                                minWidth: 100,
                                filter: true,
                                resizable: true,
                                minWidth: 200
                            }}
                            pagination={true}
                            paginationPageSize={50}
                            // overlayNoRowsTemplate="No Sales Order found. Let's create one!"
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>

                </Container>
            </Container>
        </Container>
    )
}
