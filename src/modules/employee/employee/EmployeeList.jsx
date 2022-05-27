import { React, useState, useEffect, useContext } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import { UserContext } from '../../../components/states/contexts/UserContext';
const moment = require('moment');



export default function EmployeeList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = null
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
    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/employees/employee/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/employees/employee/${params.value}?mode=view`}><BsEyeFill /></Button> */}
                </>
        },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Email', field: 'email' },
        { headerName: 'Phone', field: 'phone' },
        { headerName: 'Job Title', field: 'jobTitle', valueGetter: (params) => params.data?.jobTitle ? params.data?.jobTitle[0]?.name : "Not Available" },
        { headerName: 'Supervisor', field: 'supervisor', valueGetter: (params) => params.data?.supervisor ? params.data?.supervisor[0]?.name : "Not Available" },
        { headerName: 'Role', field: 'roles', valueGetter: (params) => params.data?.roles ? params.data?.roles[0]?.name : "Not Available" },
        { headerName: 'Access', field: 'giveAccess', valueGetter: (params) => params.data?.giveAccess ? params.data?.giveAccess : "false" },
    ]

    useEffect(async () => {

        try {
            setLoderStatus("RUNNING");
            const response = await ApiService.get('employee');
            console.log(response.data.documents)
            setstate(response.data.documents)
        } catch (e) {
            console.log(e.response.data.message);
            errorMessage(e, dispatch)
        }
        setLoderStatus("SUCCESS");
    }, []);

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col><h3>Employees</h3></Col>
                    </Row>
                    <Row>

                        <Col><Button as={Link} to="/employees/employee" variant="primary" size="sm">Create</Button></Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="primary" size="sm"><span>Export CSV</span></Button></Col>
                            </Row>
                        </Col>
                    </Row>
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
                            // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>

                </Container>
            </Container>
        </Container>
    )
}
