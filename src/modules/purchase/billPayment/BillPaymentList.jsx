import { React, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router';
import { Col, Container, Row, Button, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
const moment = require('moment');

export default function BillPaymentList() {
    const [state, setstate] = useState([]);
    const [billList, setbillList] = useState([])
    const [bill, setbill] = useState()
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

    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/billpayment/${params.value}`}><BsBoxArrowInUpRight /></Button> */}
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/billpayment/${params.value}`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Bill#', field: 'name' },
        { headerName: 'Journal Type', field: 'journalType' },
        { headerName: 'Payment Date', field: 'paymentDate', valueGetter: (params) => params.data?.paymentDate ? moment(params.data?.paymentDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'Amount', field: 'amount', valueGetter: (params) => formatNumber(params.data?.amount) }
    ]



    useEffect(async () => {
        console.log("path: ", path);
        // Find bill and all billpayments related to each record
        if (path !== "/purchase/billpayments") {
            const allBills = await ApiService.get(`billPayment/findBillsById/${id}`)
            if (allBills?.data.isSuccess) {
                console.log(allBills?.data.documents);
                setbillList(allBills?.data.documents)

                const Bill = await ApiService.get(`bill/${id}`)
                if (Bill?.data.isSuccess) {
                    console.log(Bill?.data);
                    setbill(Bill?.data.document)
                }
            }
            // if (allBills?.data.documents.length) {
            setstate(allBills?.data.documents)
        } else {
            const response = await ApiService.get('billPayment');
            console.log(response.data.documents)
            setstate(response.data.documents)

        }


    }, []);
    console.log(bill);
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>{bill ? `Vendor Bill Payments for ${bill?.name}` : `Vendor Bill Payments`}</h3></Col>
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
                                <th>Bill</th>
                                <th>Journal Type</th>
                                <th style={{ minWidth: "8rem" }}>Date</th>
                                <th>Total Price</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/billpayment/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>
                                        <td>{element.name}</td>
                                        <td>{element.journalType}</td>

                                        <td>{new Date(element.paymentDate).toDateString()}</td>
                                        <td>{formatNumber(element.estimation?.total)}</td>
                                        <td>{formatNumber(element.amount)}</td>
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
// import { formatNumber } from '../../../helpers/Utils';

// export default function BillPaymentList() {
//     const [state, setstate] = useState([]);
//     let { path, url } = useRouteMatch();


//     useEffect(async () => {
//         const response = await ApiService.get('billPayment');
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
//                         <Col><h3>Vendor Bill Payments</h3></Col>
//                     </Row>
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" fluid>
//                     <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th></th>
//                                 <th>Bill</th>
//                                 <th>Journal Type</th>
//                                 <th style={{ minWidth: "8rem" }}>Date</th>
//                                 {/* <th>Total Price</th> */}
//                                 <th>Amount</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/billpayment/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>
//                                         <td>{element.name}</td>
//                                         <td>{element.journalType}</td>

//                                         <td>{new Date(element.paymentDate).toDateString()}</td>
//                                         {/* <td>{formatNumber(element.estimation?.total)}</td> */}
//                                         <td>{formatNumber(element.amount)}</td>
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

