import { React, useState, useEffect } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import jsPDF from 'jspdf';

const moment = require('moment');

export default function OutstandingSOReport() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();

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
            const date = new Date(item.date);
            const deliveryDate = new Date(item.deliveryDate);

            newObject.name = item.name;
            newObject.customer = item.customer.name;
            newObject.date = date.toLocaleDateString();
            newObject.deliveryDate = deliveryDate.toLocaleDateString();
            newObject.total = item.estimation.total;
            newObject.invoiceStatus = item.invoiceStatus;

            // console.log(itemData.data.document.name);
            // console.log(newObject);
            itemObjects.push(newObject);
        })

        var doc = new jsPDF('p', "pt", "a4");

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Outstanding Sales Order Report", 150, 50);

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
                { header: 'Sales Order', dataKey: 'name' },
                { header: 'Vendor', dataKey: 'customer' },
                { header: 'Date', dataKey: 'date' },
                { header: 'Receipt Date', dataKey: 'deliveryDate' },
                { header: 'Total', dataKey: 'total' },
                { header: 'Invoicing Status', dataKey: 'invoiceStatus' },
            ],
            // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        })

        doc.save(`Outstanding Sales Order Report - ${state.name}.pdf`);
    }


    const columns = [
        // {
        //     headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
        //         <>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/order/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/sales/order/${params.value}?mode=view`}><BsEyeFill /></Button>
        //         </>
        // },
        { headerName: 'Sales Order', field: 'name' },
        { headerName: 'Customer', field: 'customer.name' },
        { headerName: 'Date', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Delivery Date', field: 'deliveryDate', valueGetter: (params) => params.data?.deliveryDate ? moment(params.data?.deliveryDate).format("MM/DD/YYYY") : "Not Available" },
        { headerName: 'Total', field: 'estimation.total', valueGetter: (params) => formatNumber(params.data.estimation?.total) },
        {
            headerName: 'Invoicing Status', field: 'invoiceStatus', cellRendererFramework: (params) => (renderStatus(params.value)),
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
        const response = await ApiService.get('salesOrder');
        console.log(response.data.documents)
        const outStandingSO = response.data.documents.filter(element => element.invoiceStatus !== 'Nothing to Invoice' && element.invoiceStatus !== 'Fully Invoiced')
        setstate(outStandingSO)
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
                            <h3>Outstanding Sales Orders Report</h3>
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
