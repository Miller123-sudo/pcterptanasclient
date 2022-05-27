import { React, useState, useEffect } from 'react';
import { Button, Table, Col, Container, Row } from 'react-bootstrap';
import { useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
const moment = require('moment');

export default function SupplierList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();
    const { id } = useParams();

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
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/vendor/${params.value}`}><BsBoxArrowInUpRight /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/vendor/${params.value}`}><BsEyeFill /></Button> */}
                </>
        },
        { headerName: 'Vendor Name', field: 'name' },
        { headerName: 'Phone', field: 'phone' },
        { headerName: 'Email', field: 'email' },
        { headerName: 'Address', field: 'address' }
    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('vendor');
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
                        <Col><h3>Vendors</h3></Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/purchase/vendor" variant="primary" size="sm">Create</Button></Col>
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
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th style={{ minWidth: "16rem" }}>Vendor Name</th>
                                <th style={{ minWidth: "16rem" }}>Phone</th>
                                <th style={{ minWidth: "16rem" }}>Email</th>
                                <th style={{ minWidth: "16rem" }}>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index}>
                                        <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/vendor/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>
                                        <td>{element.name}</td>
                                        <td>{element.phone}</td>
                                        <td>{element.email}</td>
                                        <td>{element.address}</td>
                                    </tr>
                                })
                            }

                        </tbody>
                    </Table> */}
                    {/* {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>Create a new vendor in your address book</h4>
                        <h6>PCTeRP helps you easily track all activities related to a supplier.</h6>
                    </Container> : ""} */}

                </Container>


            </Container>
        </Container>
    )
}




// import { React, useState, useEffect } from 'react';
// import { Button, Table, Col, Container, Row } from 'react-bootstrap';
// import { useRouteMatch } from 'react-router';
// import { Link } from 'react-router-dom';
// import { BsBoxArrowInUpRight } from 'react-icons/bs';
// import ApiService from '../../../helpers/ApiServices';

// export default function SupplierList() {
//     const [state, setstate] = useState([]);
//     let { path, url } = useRouteMatch();

//     useEffect(async () => {
//         const response = await ApiService.get('vendor');
//         console.log(response.data.documents)
//         setstate(response.data.documents)

//     }, [])
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
//                     <Row>
//                         <Col><h3>Vendors</h3></Col>
//                     </Row>
//                     <Row>
//                         <Col><Button as={Link} to="/purchase/vendor" variant="primary" size="sm">Create</Button></Col>
//                     </Row>
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" fluid>
//                     <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th>#ID</th>
//                                 <th style={{ minWidth: "16rem" }}>Vendor Name</th>
//                                 <th style={{ minWidth: "16rem" }}>Phone</th>
//                                 <th style={{ minWidth: "16rem" }}>Email</th>
//                                 <th style={{ minWidth: "16rem" }}>Address</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index}>
//                                         <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/vendor/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>
//                                         <td>{element.name}</td>
//                                         <td>{element.phone}</td>
//                                         <td>{element.email}</td>
//                                         <td>{element.address}</td>
//                                     </tr>
//                                 })
//                             }

//                         </tbody>
//                     </Table>
//                     {state.length == 0 ? <Container className="text-center mt-4">
//                         <h4>Create a new vendor in your address book</h4>
//                         <h6>PCTeRP helps you easily track all activities related to a supplier.</h6>
//                     </Container> : ""}

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
