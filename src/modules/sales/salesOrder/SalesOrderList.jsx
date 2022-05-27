import { React, useState, useEffect, useContext } from 'react';
import axios from "axios"
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useHistory, useParams } from 'react-router';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import swal from 'sweetalert2';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import './salesOrder.css'
import { UserContext } from '../../../components/states/contexts/UserContext';

const moment = require('moment');

export default function SalesOrderList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();
    const history = useHistory();
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
            headerName: '#', field: 'id', flex: 1, sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/order/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/order/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Sales Order', field: 'name', flex: 1 },
        { headerName: 'Customer', field: 'customer', flex: 1, valueGetter: (params) => params.data?.customer ? params.data?.customer?.name : "Not Available" },
        { headerName: 'Date', field: 'date', flex: 1, valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Delivered Date', field: 'deliveryDate', flex: 1, valueGetter: (params) => params.data?.deliveryDate ? moment(params.data?.deliveryDate).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Total', field: 'estimation.total', flex: 1, valueGetter: (params) => formatNumber(params.data?.estimation.total) },
        {
            headerName: 'Invoicing Status', field: 'invoiceStatus', flex: 4, minWidth: 300, cellRendererFramework: (params) => (renderStatus(params.value)),
        },

    ]

    const renderStatus = (value) => {
        switch (value) {
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Nothing to Invoice': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'To Invoice': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
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

    useEffect(async () => {
        setLoderStatus("RUNNING");
        try {
            // const response = await ApiService.get('salesOrder');
            const response = await ApiService.get('salesOrder');
            console.log(response.data.documents)
            setstate(response.data.documents)
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        }
        // alert(err.response?.data.message)
        // // history.push("/")
        // dispatch({ type: "LOGOUT_USER" });
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
                        <Col>
                            <h3>Sales Orders</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/sales/order" variant="primary" size="sm">Create</Button></Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
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
                                editable: false,
                                sortable: true,
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
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th></th>
                                <th style={{ minWidth: '8rem' }} >Sales Order</th>
                                <th style={{ minWidth: '8rem' }} >Customer</th>
                                <th style={{ minWidth: '8rem' }} >Date</th>
                                <th style={{ minWidth: '8rem' }} >Delivery Date</th>
                                <th style={{ minWidth: '8rem' }} >Total</th>
                                <th style={{ minWidth: '8rem' }} >Invoice Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td >
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/sales/order/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>

                                        <td>{element.name}</td>
                                        <td>{element.customer?.name}</td>
                                        <td>{new Date(element.date).toDateString()}</td>
                                        <td>{new Date(element.deliveryDate).toDateString()}</td>
                                        <td>{formatNumber(element.estimation?.total)}</td>
                                        <td>{renderStatus(element.invoiceStatus)}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table>
                    {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>No sales order found. Let's create one!</h4>
                        <h6>Once the quotation is confirmed, it becomes a sales order.
                            You will be able to create an invoice and collect the payment.</h6>
                    </Container> : ""} */}

                </Container>


            </Container>
        </Container >
    )
}




// import { React, useState, useEffect } from 'react';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { PropagateLoader } from "react-spinners";
// import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
// import ApiService from '../../../helpers/ApiServices';
// import { formatNumber } from '../../../helpers/Utils';
// const moment = require('moment');

// export default function SalesOrderList() {
//     const [loderStatus, setLoderStatus] = useState("");
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

//     const columns = [
//         {
//             headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
//                 <>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/order/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/order/${params.value}?mode=view`}><BsEyeFill /></Button>
//                 </>
//         },
//         { headerName: 'Purchase Order', field: 'name' },
//         { headerName: 'Vendor', field: 'customer.name' },
//         { headerName: 'Date', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
//         { headerName: 'Receipt Date', field: 'deliveryDate', valueGetter: (params) => params.data?.deliveryDate ? moment(params.data?.deliveryDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
//         { headerName: 'Total', field: 'estimation.total' },
//         {
//             headerName: 'Invoicing Status', field: 'invoiceStatus', cellRendererFramework: (params) => (renderStatus(params.value)),
//         },

//     ]

//     const renderStatus = (value) => {
//         switch (value) {
//             case 'Nothing to Bill': {
//                 return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'Nothing to Invoice': {
//                 return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'Waiting Bills': {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'To Invoice': {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'Fully Billed': {
//                 return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'Fully Invoiced': {
//                 return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             default: {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//         }
//     }

//     useEffect(async () => {
//         setLoderStatus("RUNNING");
//         const response = await ApiService.get('salesOrder');
//         console.log(response.data.documents)
//         setstate(response.data.documents)
//         setLoderStatus("SUCCESS");

//     }, []);


//     if (loderStatus === "RUNNING") {
//         return (
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
//         )
//     }
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
//                     <Row>
//                         <Col>
//                             <h3>Sales Orders</h3>
//                             {/* <Breadcrumb style={{ fontSize: '24px' }}>
//                                 <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
//                             </Breadcrumb> */}
//                         </Col>
//                     </Row>
//                     <Row>
//                         <Col><Button as={Link} to="/sales/order" variant="primary" size="sm">Create</Button></Col>
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
//                             overlayNoRowsTemplate="No Sales Order found. Let's create one!"
//                         />
//                     </div>
//                     {/* <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th></th>
//                                 <th style={{ minWidth: '8rem' }} >Sales Order</th>
//                                 <th style={{ minWidth: '8rem' }} >Customer</th>
//                                 <th style={{ minWidth: '8rem' }} >Date</th>
//                                 <th style={{ minWidth: '8rem' }} >Delivery Date</th>
//                                 <th style={{ minWidth: '8rem' }} >Total</th>
//                                 <th style={{ minWidth: '8rem' }} >Invoice Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td >
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/sales/order/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>

//                                         <td>{element.name}</td>
//                                         <td>{element.customer?.name}</td>
//                                         <td>{new Date(element.date).toDateString()}</td>
//                                         <td>{new Date(element.deliveryDate).toDateString()}</td>
//                                         <td>{formatNumber(element.estimation?.total)}</td>
//                                         <td>{renderStatus(element.invoiceStatus)}</td>
//                                     </tr>
//                                 })
//                             }
//                         </tbody>
//                     </Table>
//                     {state.length == 0 ? <Container className="text-center mt-4">
//                         <h4>No sales order found. Let's create one!</h4>
//                         <h6>Once the quotation is confirmed, it becomes a sales order.
//                             You will be able to create an invoice and collect the payment.</h6>
//                     </Container> : ""} */}

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
