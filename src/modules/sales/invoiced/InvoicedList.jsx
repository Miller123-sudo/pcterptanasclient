import { React, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router';
import { Col, Container, Row, Button, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';

const moment = require('moment');


export default function InvoicedList() {
    const [state, setState] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();
    const { id } = useParams();

    const renderStatus = (value) => {

        switch (value) {
            case 'Draft': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Posted': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Paid': {
                return <div style={{ backgroundColor: 'green', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
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
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/invoice/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/invoice/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Invoiced#', field: 'name' },
        { headerName: 'Sourced Document', field: 'sourceDocument.name' },
        { headerName: 'Customer', field: 'customer.name' },
        { headerName: 'Invoice Date', field: 'invoiceDate', valueGetter: (params) => params.data?.invoiceDate ? moment(params.data?.invoiceDate).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Total Price', field: 'estimation.total', valueGetter: (params) => formatNumber(params.data?.estimation.total) },
        { headerName: 'Status', field: 'status', cellRendererFramework: (params) => (renderStatus(params.value)) },
        { headerName: 'Payment Status', field: 'paymentStatus', cellRendererFramework: (params) => (renderStatus(params.value)) }
        // { headerName: 'Debit', field: 'debit', valueGetter: (params) => formatNumber(params.data?.debit) },
        // { headerName: 'Credit', field: 'credit', valueGetter: (params) => formatNumber(params.data?.credit) },
        // { headerName: 'Balance', field: 'balance', valueGetter: (params) => formatNumber(params.data?.balance) },
        // { headerName: 'Product', field: 'product.name' },
    ]


    useEffect(async () => {
        const response = await ApiService.get('invoice/searchBySO/' + id);
        console.log(response.data.documents)
        setState(response.data.documents)

    }, []);



    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>Customer Invoiced List</h3></Col>
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
                                <th>Bill#</th>
                                <th>Sourced Document</th>
                                <th style={{ minWidth: "16rem" }}>Customer Name</th>
                                <th style={{ minWidth: "8rem" }}>Date</th>
                                <th>Total Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/invoice/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>
                                        <td>{element.name}</td>
                                        <td>{element.sourceDocument?.name}</td>
                                        <td>{element.customer?.name}</td>
                                        <td>{new Date(element.billDate).toDateString()}</td>
                                        <td>{formatNumber(element.estimation?.total)}</td>
                                        <td>{renderStatus(element.status)}</td>
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




// import { React, useEffect, useState } from 'react'
// import { useHistory, useParams } from 'react-router';
// import { Col, Container, Row, Button, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { BsBoxArrowInUpRight } from 'react-icons/bs';
// import ApiService from '../../../helpers/ApiServices';


// export default function InvoicedList() {
//     const [state, setstate] = useState([]);
//     let { path, url } = useRouteMatch();
//     const { id } = useParams();

//     useEffect(async () => {
//         const response = await ApiService.get('invoice/searchBySO/' + id);
//         console.log(response.data.documents)
//         setstate(response.data.documents)

//     }, []);

//     const renderStatus = (value) => {

//         switch (value) {
//             case 'Draft': {
//                 return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             case 'Posted': {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             default: {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//         }
//     }

//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
//                     <Row>
//                         <Col><h3>Purchase Orders/Customer Invoice</h3></Col>
//                     </Row>
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" fluid>
//                     <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th>#ID</th>
//                                 <th>Bill#</th>
//                                 <th>Sourced Document</th>
//                                 <th style={{ minWidth: "16rem" }}>Customer Name</th>
//                                 <th style={{ minWidth: "8rem" }}>Date</th>
//                                 {/* <th>Total Price</th> */}
//                                 <th>Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/invoice/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>
//                                         <td>{element.name}</td>
//                                         <td>{element.sourceDocument?.name}</td>
//                                         <td>{element.customer?.name}</td>
//                                         <td>{new Date(element.billDate).toDateString()}</td>
//                                         {/* <td>{formatNumber(element.estimation?.total)}</td> */}
//                                         <td>{renderStatus(element.status)}</td>
//                                     </tr>
//                                 })
//                             }

//                         </tbody>
//                     </Table>

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
