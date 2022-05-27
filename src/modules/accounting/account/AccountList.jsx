import { React, useState, useEffect, useContext } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { notification } from 'antd';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import ApiService from '../../../helpers/ApiServices';
import { UserContext } from '../../../components/states/contexts/UserContext';
const moment = require('moment');

export default function AccountList() {
    const { dispatch, user } = useContext(UserContext)
    const [error, seterror] = useState(null);
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];

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
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/accountings/account/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/accountings/account/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Account Type', field: 'accountType.name' },
        { headerName: 'Balance', field: 'balance' },
    ]

    useEffect(async () => {
        try {
            setLoderStatus("RUNNING");
            const response = await ApiService.get('account/procedure');
            setstate(response.data.documents)
        } catch (e) {
            seterror(e.response?.data.message)
            console.log(e.response?.data.message);
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
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>Chart of Accounts</h3></Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/accountings/account" variant="primary" size="sm">Create</Button></Col>
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
                            // overlayNoRowsTemplate="No chart of accounts found. Let's create one!"
                            overlayNoRowsTemplate={error ? '<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">you dont have the permission for this route. Please go back to home.</span>' : '<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'}

                        />
                    </div>
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th></th>

                                <th>Employee ID</th>
                                <th style={{ minWidth: "16rem" }}>Name</th>
                                <th style={{ minWidth: "8rem" }}>Email</th>
                                <th style={{ minWidth: "8rem" }}>Job Title</th>
                                <th style={{ minWidth: "8rem" }}>Supervisor</th>
                                <th style={{ minWidth: "8rem" }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    { console.log(element) }
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/employees/employee/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>

                                        </td>

                                        <td>{"EMP0000" + element.employeeId}</td>
                                        <td>{element.name}</td>
                                        <td>{element.email}</td>
                                        <td>{element.jobTitle}</td>
                                        <td>{element.supervisor?.name}</td>
                                        <td>{element.role}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table> */}
                </Container>
            </Container>
        </Container>
    )
}






// OLD CODE

// import { React, useState, useEffect } from 'react';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import { Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch, useHistory } from 'react-router-dom';
// import ApiService from '../../../helpers/ApiServices';
// import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { formatNumber } from '../../../helpers/Utils';
// const moment = require('moment');

// export default function AccountList() {
//     const [state, setstate] = useState([]);
//     const [gridApi, setGridApi] = useState(null);
//     const [gridColumnApi, setGridColumnApi] = useState(null);
//     let { path, url } = useRouteMatch();

//     function onGridReady(params) {
//         setGridApi(params.api);
//         setGridColumnApi(params.columnApi);
//     }
//     const handleSearch = (e) => {
//         gridApi.setQuickFilter(e.target.value);
//     }

//     const handleExportAsCsv = (e) => {
//         gridApi.exportDataAsCsv();
//     }
//     const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

//     const columns = [
//         {
//             headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
//                 <>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/account/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/account/${params.value}?mode=view`}><BsEyeFill /></Button>
//                 </>
//         },
//         { headerName: 'Name', field: 'name' },
//         { headerName: 'Account Type', field: 'accountType.name' },
//         { headerName: 'Balance', field: 'balance' },
//     ]


//     // const columns = [
//     //     { field: 'id', headerName: 'ID', width: 200 },
//     //     { field: 'name', headerName: 'Name', width: 200 },
//     //     { field: 'email', headerName: 'Email', width: 200 },
//     //     { field: 'jobTitle', headerName: 'Job Title', width: 200 },
//     //     { field: 'supervisor', headerName: 'Supervisor', valueFormatter: (params) => params.row?.supervisor?.name, width: 200 },
//     //     { field: 'role', headerName: 'Role', width: 200 }
//     // ]




//     useEffect(async () => {
//         const response = await ApiService.get('account');
//         setstate(response.data.documents)

//     }, []);

//     console.log("Bottom");
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
//                     <Row>
//                         <Col><h3>Chart of Accounts</h3></Col>
//                     </Row>
//                     <Row>
//                         <Col><Button as={Link} to="/accountings/account" variant="primary" size="sm">Create</Button></Col>
//                     </Row>
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" style={{ height: '700px' }} fluid>
//                     <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
//                         <AgGridReact
//                             onGridReady={onGridReady}
//                             rowData={state}
//                             columnDefs={columns}
//                             defaultColDef={{
//                                 editable: true,
//                                 sortable: true,
//                                 flex: 1,
//                                 minWidth: 100,
//                                 filter: true,
//                                 resizable: true,
//                                 minWidth: 200
//                             }}
//                             pagination={true}
//                             paginationPageSize={50}
//                             overlayNoRowsTemplate="No chart of accounts found. Let's create one!"
//                         />
//                     </div>
//                     {/* <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th></th>

//                                 <th>Employee ID</th>
//                                 <th style={{ minWidth: "16rem" }}>Name</th>
//                                 <th style={{ minWidth: "8rem" }}>Email</th>
//                                 <th style={{ minWidth: "8rem" }}>Job Title</th>
//                                 <th style={{ minWidth: "8rem" }}>Supervisor</th>
//                                 <th style={{ minWidth: "8rem" }}>Role</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     { console.log(element) }
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/employees/employee/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>

//                                         </td>

//                                         <td>{"EMP0000" + element.employeeId}</td>
//                                         <td>{element.name}</td>
//                                         <td>{element.email}</td>
//                                         <td>{element.jobTitle}</td>
//                                         <td>{element.supervisor?.name}</td>
//                                         <td>{element.role}</td>
//                                     </tr>
//                                 })
//                             }
//                         </tbody>
//                     </Table> */}
//                 </Container>
//             </Container>
//         </Container>
//     )
// }


