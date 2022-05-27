import { React, useState, useEffect } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch, useHistory, useLocation } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import jsPDF from "jspdf";
import ApiService from '../../helpers/ApiServices';
const moment = require('moment');

export default function OutstandingInvoicesReport() {
    const [state, setState] = useState([]);
    let { path, url } = useRouteMatch();
    const history = useHistory();
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const mode = query.get('mode');


    useEffect(async () => {
        const response = await ApiService.get('invoice/stats?paymentStatus=Not Paid');
        console.log(response.data.documents)
        setState(response.data.documents)

    }, []);

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
        // { field: 'paymentReference', headerName: 'Reference Number', flex: 1, minWidth: 150 },
        { field: 'sourceDocument', headerName: 'Source Document', valueGetter: getSourceDocumentValue, flex: 1, minWidth: 150 },
        { field: 'customer', headerName: 'Customer', valueGetter: getCustomerValue, flex: 1, minWidth: 150 },
        { field: 'invoiceDate', headerName: 'Invoice Date', valueGetter: (params) => params.data?.invoiceDate ? moment(params.data?.invoiceDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available", flex: 1, minWidth: 150 },
        { field: 'recepientAccount.name', headerName: 'Recipient Account', flex: 1, minWidth: 150 },
        { field: 'total', headerName: 'Total', flex: 1, minWidth: 150 }
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
        state?.map(item => {
            let newObject = new Object();
            // let itemData = await ApiService.get(`product/${item.product}`);

            newObject.paymentReference = item.paymentReference;
            newObject.sourceDocument = item.sourceDocument?.name;
            newObject.customer = item.customer?.name;
            newObject.invoiceDate = item.invoiceDate;
            newObject.recepientAccount = item.recepientAccount?.name;
            newObject.total = item.total;

            // console.log(itemData.data.document.name);
            // console.log(newObject);
            itemObjects.push(newObject);
        })

        var doc = new jsPDF('p', "pt", "a4");

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Outstanding Invoice Report", 190, 50);

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
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
            },
            columnStyles: {
                europe: { halign: 'center' },
                0: { cellWidth: 88 },
                1: { cellWidth: 90 },
                2: { cellWidth: 150 },
                3: { cellWidth: 120 },
                4: { cellWidth: 65 },
            }, // European countries centered
            body: itemObjects,
            columns: [
                // { header: 'Reference Number', dataKey: 'paymentReference' },
                { header: 'Source Document', dataKey: 'sourceDocument' },
                { header: 'customer', dataKey: 'customer' },
                { header: 'invoiceDate', dataKey: 'invoiceDate' },
                { header: 'recepientAccount', dataKey: 'recepientAccount' },
                { header: 'Total', dataKey: 'total' },
            ],
            // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        })

        doc.save(`Invoices Report - ${state.name}.pdf`);
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Outstanding Invoices</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col></Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="4"></Col>
                                <Col md="4"><Button onClick={handlePrintReport} variant="light" size="sm"><span>Export PDF</span></Button></Col>
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
