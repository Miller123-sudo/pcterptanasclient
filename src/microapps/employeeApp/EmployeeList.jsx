import { React, useContext, useState, useEffect } from 'react'
import { Col, Row, Button, Container, Breadcrumb } from 'react-bootstrap'
import { PropagateLoader, GridLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../components/states/contexts/UserContext'
import ApiService from '../../helpers/ApiServices'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppLoader from '../../pcterp/components/AppLoader';
const moment = require('moment');

export default function EmployeeList() {
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setstate] = useState(null);
    const [isAdmin, setisAdmin] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);


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


    const findAllDocument = async () => {
        ApiService.setHeader();
        const response = await ApiService.get('employee');
        console.log(response.data.documents)
        setstate(response.data.documents)
        setLoderStatus("SUCCESS");
    }

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${rootPath}/employees/edit/${params.value}`}><BsBoxArrowInUpRight /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/employees/employee/${params.value}?mode=view`}><BsEyeFill /></Button> */}
                </>
        },
        { headerName: 'NAME', field: 'name' },
        { headerName: 'EMP CODE', field: 'employeeCode' },
        { headerName: 'EMAIL', field: 'email' },
        { headerName: 'PHONE', field: 'phone' },
        { headerName: 'JOB TITLE', field: 'jobTitle', valueGetter: (params) => params.data?.jobTitle ? params.data?.jobTitle[0]?.name : "Not Available" },
        { headerName: 'SUPERVISOR', field: 'supervisor', valueGetter: (params) => params.data?.supervisor ? params.data?.supervisor[0]?.name : "Not Available" },
        { headerName: 'ROLE', field: 'roles', valueGetter: (params) => params.data?.roles ? params.data?.roles[0]?.name : "Not Available" },
        { headerName: 'ACCESS', field: 'giveAccess', valueGetter: (params) => params.data?.giveAccess ? params.data?.giveAccess : "false" },
        { headerName: 'POS USER', field: 'isposUser', valueGetter: (params) => params.data?.isposUser ? params.data?.isposUser : "false" },
        { headerName: 'SALES REP', field: 'isSalesRep', valueGetter: (params) => params.data?.isSalesRep ? params.data?.isSalesRep : "false" },
        // { headerName: 'CREATED AT', field: 'createdAt', valueGetter: (params) => params?.data?.createdAt ? moment(params?.data?.createdAt).format("MM/DD/YYYY  hh:mm:ss") : "Not Available" },
        // { headerName: 'UPDATED AT', field: 'updatedAt', valueGetter: (params) => params?.data?.updatedAt ? moment(params?.data?.updatedAt).format("MM/DD/YYYY  hh:mm:ss") : "Not Available" },
    ]


    useEffect(() => {
        setLoderStatus("RUNNING");
        findAllDocument();

        console.log(user);
        user.roles.map(e => {
            if (e.name == "Administrator") {
                setisAdmin(true)
                return;
            }
        })
    }, []);


    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>EMPLOYEES</div></Breadcrumb.Item>
                                {/* <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}>   <div className='breadcrum-label'>Purchase Orders</div></Breadcrumb.Item> */}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button size="sm" as={Link} to={`/${rootPath}/employees/add`}>CREATE</Button>{" "}
                        </Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="primary" size="sm"><span>Export CSV</span></Button></Col>
                                {/* {isAdmin && <Col md="4"><Link to="/forgotpassword" className="link">Reset Password</Link></Col>} */}
                                {/* <Link to="/forgotpassword" className="link">Reset Password</Link> */}
                            </Row>
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
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

            </AppContentBody>
        </AppContentForm>
    )
}
