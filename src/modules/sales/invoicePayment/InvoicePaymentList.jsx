import { React, useState, useEffect } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
const moment = require('moment');




export default function InvoicePaymentList() {
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

    const renderStatus = (value) => {

        switch (value) {
            case 'Waiting Invoice': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'To Invoice': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
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

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/invoicepayment/${params.value}`}><BsBoxArrowInUpRight /></Button> */}
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/invoicepayment/${params.value}`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Invoice Payment#', field: 'name' },
        { headerName: 'Journal Type', field: 'journalType' },
        { headerName: 'Payment Date', field: 'paymentDate', valueGetter: (params) => params.data?.paymentDate ? moment(params.data?.paymentDate).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Total', field: 'amount', valueGetter: (params) => formatNumber(params.data?.amount) },
        // { headerName: 'Status', field: 'status', cellRendererFramework: (params) => (renderStatus(params.value)) }
    ]

    useEffect(async () => {
        const response = await ApiService.get('invoicePayment');
        console.log(response.data.documents)
        setstate(response.data.documents)

    }, []);
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Invoice Payments</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/sales/order" variant="primary" size="sm">Create</Button></Col>
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


                </Container>


            </Container>
        </Container>
    )
}





// import { React, useState, useEffect } from 'react';
// import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { BsBoxArrowInUpRight } from 'react-icons/bs'
// import ApiService from '../../../helpers/ApiServices';
// import { formatNumber } from '../../../helpers/Utils';




// export default function InvoicePaymentList() {
//     const [state, setstate] = useState([]);
//     let { path, url } = useRouteMatch();

//     const renderStatus = (value) => {

//         switch (value) {
//             case 'Waiting Invoice': {
//                 return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             case 'To Invoice': {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             case 'Fully Invoiced': {
//                 return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             default: {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//         }
//     }

//     useEffect(async () => {
//         const response = await ApiService.get('invoicePayment');
//         console.log(response.data.documents)
//         setstate(response.data.documents)

//     }, []);
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
//                 <Container className="pct-app-content-body p-0 m-0" fluid>
//                     <Table striped bordered hover size="sm">
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
//                     </Container> : ""}

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
