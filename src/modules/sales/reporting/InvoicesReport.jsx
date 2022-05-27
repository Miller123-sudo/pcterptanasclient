import { React, useEffect, useState } from 'react'
import { Col, Container, Row, Button, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useHistory, useParams } from 'react-router';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import jsPDF from 'jspdf';
const moment = require('moment');

export default function InvoicesReport() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
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
            case 'Not Paid': {
                return <div style={{ backgroundColor: 'red', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
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

    const handlePrintReport = async () => {
        let itemObjects = new Array();
        // console.log(state);
        state.map(item => {
            let newObject = new Object();
            // let itemData = await ApiService.get(`product/${item.product}`);
            const billDate = new Date(item.billDate);

            newObject.name = item.name;
            newObject.sourceDocument = item.sourceDocument?.name;
            newObject.customer = item.customer?.name;
            newObject.billDate = billDate.toLocaleDateString();
            newObject.total = item.total;
            newObject.status = item.status;

            // console.log(itemData.data.document.name);
            // console.log(newObject);
            itemObjects.push(newObject);
        })

        var doc = new jsPDF('p', "pt", "a4");

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Invoices Report", 205, 50);

        doc.setFontSize(10);
        doc.text("Company ", 40, 80);
        doc.setFont("times", "normal");
        doc.text(": Paapri Business Technology India", 100, 80);

        doc.setFont("helvetica", "bold");
        doc.text("Location", 40, 95);
        doc.setFont("times", "normal");
        doc.text(": Kolkata", 100, 95);

        doc.setFont("helvetica", "bold");
        doc.text("Phone", 40, 110);
        doc.setFont("times", "normal");
        doc.text(": 9876543210 ", 100, 110);

        doc.setFont("helvetica", "bold");
        doc.text("Date", 450, 80);
        doc.setFont("times", "normal");
        doc.text(": 7th Dec, 2021 ", 490, 80);

        doc.autoTable({
            margin: { top: 130 },
            styles: {
                lineColor: [44, 62, 80],
                lineWidth: 1,
            },
            columnStyles: {
                europe: { halign: 'center' },
                // 0: { cellWidth: 88 },
                // 1: { cellWidth: 88 },
                // 2: { cellWidth: 88 },
                // 3: { cellWidth: 88 },
                // 4: { cellWidth: 88 },
                // 5: { cellWidth: 88 },
            }, // European countries centered
            body: itemObjects,
            columns: [
                { header: 'Bill#', dataKey: 'name' },
                { header: 'Sourced Document', dataKey: 'sourceDocument' },
                { header: 'Vendor', dataKey: 'customer' },
                { header: 'Bill Date', dataKey: 'billDate' },
                { header: 'Total', dataKey: 'total' },
                { header: 'Status', dataKey: 'status' },
            ],
            // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        })

        doc.save(`Invoices Report - ${state.name}.pdf`);
    }

    const columns = [
        // {
        //     headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
        //         <>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/invoice/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/invoice/${params.value}?mode=view`}><BsEyeFill /></Button>
        //         </>
        // },
        { headerName: 'Invoice#', field: 'name' },
        { headerName: 'Sourced Document', field: 'sourceDocument.name' },
        { headerName: 'Customer', field: 'customer.name' },
        { headerName: 'Invoice Date', field: 'invoiceDate', valueGetter: (params) => params.data?.invoiceDate ? moment(params.data?.invoiceDate).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Total Price', field: 'total', valueGetter: (params) => formatNumber(params.data?.total) },
        { headerName: 'Status', field: 'status', cellRendererFramework: (params) => (renderStatus(params.value)) },
        { headerName: 'Payment Status', field: 'paymentStatus', cellRendererFramework: (params) => (renderStatus(params.value)) },
        // { headerName: 'Debit', field: 'debit', valueGetter: (params) => formatNumber(params.data?.debit) },
        // { headerName: 'Credit', field: 'credit', valueGetter: (params) => formatNumber(params.data?.credit) },
        // { headerName: 'Balance', field: 'balance', valueGetter: (params) => formatNumber(params.data?.balance) },
        // { headerName: 'Product', field: 'product.name' },
    ]


    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('invoice');
        console.log(response.data.documents)
        setstate(response.data.documents)
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
                        <Col><h3>Customer Invoices Report</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            {/* <Button as={Link} to="/sales/order" variant="primary" size="sm">Create</Button> */}
                        </Col>
                        <Col md="6" sm="6">
                            <Row>
                                <Col md="6"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="3"><Button onClick={handlePrintReport} variant="light" size="sm"><span>Export PDF</span></Button></Col>
                                <Col md="3"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
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

                        />
                    </div>
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Bill#</th>
                                <th>Sourced Document</th>
                                <th style={{ minWidth: "16rem" }}>Vendor Name</th>
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
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/sales/invoice/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>
                                        <td>{element.name}</td>
                                        <td>{element.sourceDocument?.name}</td>
                                        <td>{element.vendor?.name}</td>
                                        <td>{new Date(element.billDate).toDateString()}</td>
                                        <td>{formatNumber(element.total)}</td>
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
// import { Col, Container, Row, Button, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { BsBoxArrowInUpRight } from 'react-icons/bs';
// import { PropagateLoader } from "react-spinners";
// import ApiService from '../../../helpers/ApiServices';
// import { formatNumber } from '../../../helpers/Utils';

// export default function InvoiceList() {
//     const [loderStatus, setLoderStatus] = useState("");
//     const [state, setstate] = useState([]);
//     let { path, url } = useRouteMatch();

//     useEffect(async () => {
//         setLoderStatus("RUNNING");
//         const response = await ApiService.get('invoice');
//         console.log(response.data.documents)
//         setstate(response.data.documents)
//         setLoderStatus("SUCCESS");
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


//     if (loderStatus === "RUNNING") {
//         return (
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
//         )
//     }
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
//                     <Row>
//                         <Col><h3>Customer Invoices</h3></Col>
//                     </Row>
//                     {/* <Row>
//                         <Col><Button as={Link} to="/accounting/vendorbill" variant="primary" size="sm">Create</Button></Col>
//                     </Row> */}
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" fluid>
//                     <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th>#ID</th>
//                                 <th>INV#</th>
//                                 <th>Sourced Document</th>
//                                 <th style={{ minWidth: "16rem" }}>Customer Name</th>
//                                 <th style={{ minWidth: "8rem" }}>Date</th>
//                                 <th>Total Price</th>
//                                 <th>Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/sales/invoice/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>
//                                         <td>{element.name}</td>
//                                         <td>{element.sourceDocument?.name}</td>
//                                         <td>{element.customer?.name}</td>
//                                         <td>{new Date(element.invoiceDate).toDateString()}</td>
//                                         <td>{formatNumber(element.total)}</td>
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
