import { React, useState, useEffect } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch, useHistory, useLocation } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import jsPDF from "jspdf";
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
const moment = require('moment');


export default function OutstandingInvoicesReport() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setState] = useState([]);
    let { path, url } = useRouteMatch();
    const history = useHistory();
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const mode = query.get('mode');


    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('invoice/stats?paymentStatus=Not Paid');
        console.log(response.data.documents)
        setState(response.data.documents)
        setLoderStatus("SUCCESS");

    }, []);

    const renderStatus = (value) => {

        switch (value) {

            case 'Not Paid': {
                return <div style={{ backgroundColor: 'red', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
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

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }

    const getRecipientAccountValue = (params) => params.data?.recipientAccount?.name ? params.data?.recipientAccount?.name : "Not Available";
    const getSourceDocumentValue = (params) => params.data?.sourceDocument?.name ? params.data?.sourceDocument?.name : "Not Available";
    const getCustomerValue = (params) => params.data?.customer?.name ? params.data?.customer?.name : "Not Available";
    const getDateValue = (params) => {
        let date = params.data?.invoiceDate;
        date = date.replace('T', ' ');
        date = date.replace('Z', '');
        return date;
    }
    // const getDateValue = (params) => {
    //     let date = params.data?.customer?.invoiceDate;
    //     date = date.replace('T', ' ');
    //     date = date.replace('.', 4)
    //     console.log(date)
    //     return date;
    // }

    const columns = [
        { field: 'name', headerName: 'Invoice#', flex: 1, minWidth: 150 },
        { field: 'sourceDocument', headerName: 'Source Document', valueGetter: getSourceDocumentValue, flex: 1, minWidth: 150 },
        { field: 'customer', headerName: 'Customer', valueGetter: getCustomerValue, flex: 1, minWidth: 150 },
        { field: 'invoiceDate', headerName: 'Invoice Date', valueGetter: (params) => params.data?.invoiceDate ? moment(params.data?.invoiceDate).format("MM/DD/YYYY") : "Not Available", flex: 1, minWidth: 150 },
        { field: 'recepientAccount.name', headerName: 'Recipient Account', flex: 1, minWidth: 150 },
        { field: 'total', headerName: 'Total', flex: 1, minWidth: 150, valueGetter: (params) => formatNumber(params.data?.total) },
        { field: 'paymentStatus', headerName: 'Payment Status', flex: 1, minWidth: 150, cellRendererFramework: (params) => (renderStatus(params.value)) }
    ]

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
        doc.text("Outstanding Invoices Report", 150, 50);

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

        doc.save(`Outstanding Invoices Report - ${state.name}.pdf`);
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Outstanding Customer Invoices Report</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
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
                                // floatingFilter: true,
                                minWidth: 200
                            }}
                            pagination={true}
                            paginationPageSize={25}
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
// import { Link, useRouteMatch, useHistory, useLocation } from 'react-router-dom';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import jsPDF from "jspdf";
// import ApiService from '../../helpers/ApiServices';

// export default function OutstandingInvoicesReport() {
//     const [state, setState] = useState([]);
//     let { path, url } = useRouteMatch();
//     const history = useHistory();
//     const [gridApi, setGridApi] = useState(null);
//     const [gridColumnApi, setGridColumnApi] = useState(null);

//     const useQuery = () => new URLSearchParams(useLocation().search);
//     let query = useQuery();
//     const mode = query.get('mode');

//     async function handleRowsData() {
//         const response = await ApiService.get('invoice/stats?paymentStatus=Not Paid');
//         console.log(response.data.documents)
//         setState(response.data.documents)
//     }

//     useEffect(async () => {
//         await handleRowsData();
//         const response = await ApiService.get('invoice/stats?paymentStatus=Not Paid');
//         console.log(response.data.documents)
//         setState(response.data.documents)

//     }, []);

//     const getRecipientAccountValue = (params) => params.data?.recipientAccount?.name ? params.data?.recipientAccount?.name : "Not Available";
//     const getSourceDocumentValue = (params) => params.data?.sourceDocument?.name ? params.data?.sourceDocument?.name : "Not Available";
//     const getCustomerValue = (params) => params.data?.customer?.name ? params.data?.customer?.name : "Not Available";
//     const getDateValue = (params) => {
//         let date = params.data?.invoiceDate;
//         date = date.replace('T', ' ');
//         date = date.replace('Z', '');
//         return date;
//     }
//     // const getDateValue = (params) => {
//     //     let date = params.data?.customer?.invoiceDate;
//     //     date = date.replace('T', ' ');
//     //     date = date.replace('.', 4)
//     //     console.log(date)
//     //     return date;
//     // }

//     const columns = [
//         { field: 'paymentReference', headerName: 'Reference Number', flex: 1, minWidth: 150 },
//         { field: 'sourceDocument', headerName: 'Source Document', valueGetter: getSourceDocumentValue, flex: 1, minWidth: 150 },
//         { field: 'customer', headerName: 'Customer', valueGetter: getCustomerValue, flex: 1, minWidth: 150 },
//         { field: 'invoiceDate', headerName: 'Invoice Date', valueGetter: getDateValue, flex: 1, minWidth: 150 },
//         { field: 'recipientAccount', headerName: 'Recipient Account', valueGetter: getRecipientAccountValue, flex: 1, minWidth: 150 },
//         { field: 'total', headerName: 'Total', flex: 1, minWidth: 150 }
//     ]

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

//     const handlePrintReport = async () => {
//         let itemObjects = new Array();
//         // console.log(state);
//         state.map(item => {
//             let newObject = new Object();
//             // let itemData = await ApiService.get(`product/${item.product}`);

//             newObject.paymentReference = item.paymentReference;
//             newObject.sourceDocument = item.sourceDocument;
//             newObject.customer = item.customer;
//             newObject.invoiceDate = item.invoiceDate;
//             newObject.recipientAccount = item.recipientAccount;
//             newObject.total = item.total;

//             // console.log(itemData.data.document.name);
//             // console.log(newObject);
//             itemObjects.push(newObject);
//         })

//         var doc = new jsPDF('p', "pt", "a4");

//         doc.setFontSize(20);
//         doc.setFont("helvetica", "bold");
//         doc.text("Inventory Stocks Report", 190, 50);

//         doc.setFontSize(10);
//         doc.text("Company ", 40, 80);
//         doc.setFont("times", "normal");
//         doc.text(": Paapri Business Technology India", 100, 80);

//         doc.setFont("helvetica", "bold");
//         doc.text("Location", 40, 95);
//         doc.setFont("times", "normal");
//         doc.text(": Kolkata", 100, 95);

//         doc.setFont("helvetica", "bold");
//         doc.text("Phone", 40, 110);
//         doc.setFont("times", "normal");
//         doc.text(": 9876543210 ", 100, 110);

//         doc.setFont("helvetica", "bold");
//         doc.text("Date", 450, 80);
//         doc.setFont("times", "normal");
//         doc.text(": 7th Dec, 2021 ", 490, 80);

//         doc.autoTable({
//             margin: { top: 130 },
//             styles: {
//                 lineColor: [44, 62, 80],
//                 lineWidth: 1,
//             },
//             columnStyles: {
//                 europe: { halign: 'center' },
//                 0: { cellWidth: 88 },
//                 2: { cellWidth: 40 },
//                 3: { cellWidth: 57 },
//                 4: { cellWidth: 65 },
//             }, // European countries centered
//             body: itemObjects,
//             columns: [
//                 { header: 'Reference Number', dataKey: 'paymentReference' },
//                 { header: 'Source Document', dataKey: 'sourceDocument' },
//                 { header: 'customer', dataKey: 'Customer' },
//                 { header: 'invoiceDate', dataKey: 'Invoice Date' },
//                 { header: 'recipientAccount', dataKey: 'Recipient Account' },
//                 { header: 'total', dataKey: 'Total' },
//             ],
//             // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
//         })

//         doc.save(`Invoices Report - ${state.name}.pdf`);
//     }

//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
//                     <Row>
//                         <Col>
//                             <h3>Outstanding Invoices</h3>
//                             {/* <Breadcrumb style={{ fontSize: '24px' }}>
//                                 <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
//                             </Breadcrumb> */}
//                         </Col>
//                     </Row>
//                     <Row>
//                         <Col></Col>
//                         <Col md="4" sm="6">
//                             <Row>
//                                 <Col md="4"></Col>
//                                 <Col md="4"><Button onClick={handlePrintReport} variant="light" size="sm"><span>Export PDF</span></Button></Col>
//                                 <Col md="4"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
//                             </Row>
//                         </Col>
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
//                                 // floatingFilter: true,
//                                 minWidth: 200
//                             }}
//                             pagination={true}
//                             paginationPageSize={25}
//                         />
//                     </div>
//                 </Container>
//             </Container>
//         </Container>
//     )
// }
