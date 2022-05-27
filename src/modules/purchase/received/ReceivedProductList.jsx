import { React, useState, useEffect } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useHistory, useParams } from 'react-router';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import ApiService from '../../../helpers/ApiServices';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
const moment = require('moment');


export default function ReceivedProductList() {
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
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Billed': {
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
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/receiveproduct/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/receiveproduct/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Product Receipt ID', field: 'name' },
        { headerName: 'Purchase Order ID', field: 'sourceDocument.name' },
        { headerName: 'Vendor Name', field: 'vendor.name' },
        { headerName: 'Effective Date', field: 'effectiveDate', valueGetter: (params) => params.data?.effectiveDate ? moment(params.data?.effectiveDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'Back Order of', field: 'backOrderOf?.name' },
        { headerName: 'Status', field: 'status', cellRendererFramework: (params) => (renderStatus(params.value)) }
    ]

    useEffect(async () => {
        const response = await ApiService.get('productReceipt/searchByPO/' + id);
        console.log(response.data.documents)
        setstate(response.data.documents)

    }, []);
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Products Received</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col><Button as={Link} to="/purchase/order" variant="primary" size="sm">Create</Button></Col>
                    </Row> */}
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
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th></th>
                                <th style={{ minWidth: '8rem' }} >Product Receipt ID</th>
                                <th style={{ minWidth: '8rem' }} >Purchase Order ID</th>
                                <th style={{ minWidth: '8rem' }} >Vendor</th>
                                <th style={{ minWidth: '8rem' }} >Date</th>
                                <th style={{ minWidth: '8rem' }} >Billing Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td >
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/receiveproduct/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>

                                        <td>{element.name}</td>
                                        <td>{element.sourceDocument?.name}</td>
                                        <td>{element.vendor?.name}</td>
                                        <td>{new Date(element.effectiveDate).toDateString()}</td>
                                        <td>{renderStatus(element.status)}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table> */}
                    {/* {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>No purchase order found. Let's create one!</h4>
                        <h6>Once you ordered your products to your supplier, confirm your request for quotation and it will turn into a purchase order.</h6>
                    </Container> : ""} */}

                </Container>


            </Container>
        </Container>
    )
}




// import { React, useState, useEffect } from 'react';
// import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { useHistory, useParams } from 'react-router';
// import { BsBoxArrowInUpRight } from 'react-icons/bs'
// import ApiService from '../../../helpers/ApiServices';



// export default function ReceivedProductList() {
//     const [state, setstate] = useState([]);
//     let { path, url } = useRouteMatch();
//     const { id } = useParams();
//     const renderStatus = (value) => {

//         switch (value) {
//             case 'Nothing to Bill': {
//                 return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             case 'Waiting Bills': {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             case 'Fully Billed': {
//                 return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//             default: {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
//             }
//         }
//     }

//     useEffect(async () => {
//         const response = await ApiService.get('productReceipt/searchByPO/' + id);
//         console.log(response.data.documents)
//         setstate(response.data.documents)

//     }, []);
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
//                     <Row>
//                         <Col>
//                             <h3>Products Received</h3>
//                             {/* <Breadcrumb style={{ fontSize: '24px' }}>
//                                 <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
//                             </Breadcrumb> */}
//                         </Col>
//                     </Row>
//                     {/* <Row>
//                         <Col><Button as={Link} to="/purchase/order" variant="primary" size="sm">Create</Button></Col>
//                     </Row> */}
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" fluid>
//                     <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th></th>
//                                 <th style={{ minWidth: '8rem' }} >Product Receipt ID</th>
//                                 <th style={{ minWidth: '8rem' }} >Purchase Order ID</th>
//                                 <th style={{ minWidth: '8rem' }} >Vendor</th>
//                                 <th style={{ minWidth: '8rem' }} >Date</th>
//                                 <th style={{ minWidth: '8rem' }} >Billing Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td >
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/receiveproduct/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>

//                                         <td>{element.name}</td>
//                                         <td>{element.sourceDocument?.name}</td>
//                                         <td>{element.vendor?.name}</td>
//                                         <td>{new Date(element.effectiveDate).toDateString()}</td>
//                                         <td>{renderStatus(element.status)}</td>
//                                     </tr>
//                                 })
//                             }
//                         </tbody>
//                     </Table>
//                     {state.length == 0 ? <Container className="text-center mt-4">
//                         <h4>No purchase order found. Let's create one!</h4>
//                         <h6>Once you ordered your products to your supplier, confirm your request for quotation and it will turn into a purchase order.</h6>
//                     </Container> : ""}

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
