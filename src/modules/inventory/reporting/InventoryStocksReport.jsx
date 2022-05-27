import { React, useState, useEffect } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import jsPDF from "jspdf";
import ApiService from '../../../helpers/ApiServices';

export default function InventoryStocksReport() {
    const [state, setState] = useState([]);
    let { path, url } = useRouteMatch();
    const history = useHistory();
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);


    useEffect(async () => {
        const response = await ApiService.get('product');
        console.log(response.data.documents)
        setState(response.data.documents)

    }, []);

    // const getVendorValue = (params) => params.data?.vendor?.name ? params.data?.vendor?.name : "Not Available";
    // const getDateValue = (params) => params.data?.receiptDate ? new Date(params.data?.receiptDate).toDateString() : "Not Available";

    const columns = [
        { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 150 },
        { field: 'salesPrice', headerName: 'Sales Price', flex: 1, minWidth: 150 },
        { field: 'cost', headerName: 'Cost Price', flex: 1, minWidth: 150 },
        { field: 'onHand', headerName: 'Quantity On Hand', flex: 1, minWidth: 150 },
        { field: 'available', headerName: 'Forecasted Quantity', flex: 1, minWidth: 150 }
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

            newObject.name = item.name;
            newObject.description = item.description;
            newObject.salesPrice = item.salesPrice;
            newObject.cost = item.cost;
            newObject.onHand = item.onHand;
            newObject.available = item.available;

            // console.log(itemData.data.document.name);
            // console.log(newObject);
            itemObjects.push(newObject);
        })

        var doc = new jsPDF('p', "pt", "a4");

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Inventory Stocks Report", 190, 50);

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
                0: { cellWidth: 88 },
                2: { cellWidth: 40 },
                3: { cellWidth: 57 },
                4: { cellWidth: 65 },
            }, // European countries centered
            body: itemObjects,
            columns: [
                { header: 'Name', dataKey: 'name' },
                { header: 'Description', dataKey: 'description' },
                { header: 'Sales Price', dataKey: 'salesPrice' },
                { header: 'Cost Price', dataKey: 'cost' },
                { header: 'On Hand Qty.', dataKey: 'onHand' },
                { header: 'Available Qty.', dataKey: 'available' },
            ],
            // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        })

        doc.save(`Inventory Stocks Report - ${state.name}.pdf`);
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Inventory Stocks Report</h3>
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
// import { Link, useRouteMatch, useHistory } from 'react-router-dom';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import jsPDF from "jspdf";
// import ApiService from '../../../helpers/ApiServices';

// export default function InventoryStocksReport() {
//     const [state, setState] = useState([]);
//     let { path, url } = useRouteMatch();
//     const history = useHistory();
//     const [gridApi, setGridApi] = useState(null);
//     const [gridColumnApi, setGridColumnApi] = useState(null);

//     async function handleRowsData() {
//         const response = await ApiService.get('product');
//         console.log(response.data.documents)
//         setState(response.data.documents)
//     }

//     useEffect(async () => {
//         await handleRowsData();
//         const response = await ApiService.get('product');
//         console.log(response.data.documents)
//         setState(response.data.documents)

//     }, []);

//     // const getVendorValue = (params) => params.data?.vendor?.name ? params.data?.vendor?.name : "Not Available";
//     // const getDateValue = (params) => params.data?.receiptDate ? new Date(params.data?.receiptDate).toDateString() : "Not Available";

//     const columns = [
//         { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 150 },
//         { field: 'description', headerName: 'Description', flex: 2, minWidth: 150 },
//         { field: 'salesPrice', headerName: 'Sales Price', flex: 1, minWidth: 150 },
//         { field: 'cost', headerName: 'Cost Price', flex: 1, minWidth: 150 },
//         { field: 'onHand', headerName: 'Quantity On Hand', flex: 1, minWidth: 150 },
//         { field: 'available', headerName: 'Forecasted Quantity', flex: 1, minWidth: 150 }
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

//             newObject.name = item.name;
//             newObject.description = item.description;
//             newObject.salesPrice = item.salesPrice;
//             newObject.cost = item.cost;
//             newObject.onHand = item.onHand;
//             newObject.available = item.available;

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
//                 { header: 'Name', dataKey: 'name' },
//                 { header: 'Description', dataKey: 'description' },
//                 { header: 'Sales Price', dataKey: 'salesPrice' },
//                 { header: 'Cost Price', dataKey: 'cost' },
//                 { header: 'On Hand Qty.', dataKey: 'onHand' },
//                 { header: 'Available Qty.', dataKey: 'available' },
//             ],
//             // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
//         })

//         doc.save(`Inventory Stocks Report - ${state.name}.pdf`);
//     }

//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
//                     <Row>
//                         <Col>
//                             <h3>Inventory Stocks Report</h3>
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
//                             paginationPageSize={50}
//                         />
//                     </div>
//                 </Container>
//             </Container>
//         </Container>
//     )
// }
