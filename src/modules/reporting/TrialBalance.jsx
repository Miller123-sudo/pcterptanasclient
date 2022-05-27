import { React, useState, useEffect, useContext } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { PropagateLoader } from "react-spinners";
import jsPDF from "jspdf";
import ApiService from '../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../helpers/Utils';
import { UserContext } from '../../components/states/contexts/UserContext';

export default function TrialBalance() {
    const [loderStatus, setLoderStatus] = useState("");
    const { dispatch, user } = useContext(UserContext)
    const [state, setState] = useState([]);
    const [error, seterror] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const history = useNavigate();
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);



    async function handleRowsData() {
        const response = await ApiService.get('generalLedger/stats/groupByAccount');
        console.log(response.data.documents)
        setState(response.data.documents)
    }

    useEffect(async () => {
        try {
            setLoderStatus("RUNNING");
            await handleRowsData();
            const response = await ApiService.get('generalLedger/stats/groupByAccount');
            console.log(response.data.documents)
            setState(response.data.documents)
        } catch (e) {
            seterror(e.response?.data.message)
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        }
        setLoderStatus("SUCCESS");

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
        { field: '_id', headerName: 'Account', flex: 1, minWidth: 150 },
        { field: 'debit', headerName: 'Debit', valueGetter: (params) => formatNumber(params.data?.debit), flex: 1, minWidth: 150 },
        { field: 'credit', headerName: 'Credit', valueGetter: (params) => formatNumber(params.data?.credit), flex: 1, minWidth: 150 },
        { field: 'balance', headerName: 'Balance', valueGetter: (params) => formatNumber(params.data?.balance), flex: 1, minWidth: 150 },
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
        console.log(state);
        state.map(item => {
            let newObject = new Object();
            // let itemData = await ApiService.get(`product/${item.product}`);

            newObject._id = item._id;
            newObject.debit = item.debit;
            newObject.credit = item.credit;
            newObject.balance = item.balance;


            // console.log(itemData.data.document.name);
            // console.log(newObject);
            itemObjects.push(newObject);
        })

        var doc = new jsPDF('p', "pt", "a4");

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Trial Balance Report", 190, 50);

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
                0: { cellWidth: 200 },
                1: { cellWidth: 110 },
                2: { cellWidth: 110 },
                3: { cellWidth: 110 },
            }, // European countries centered
            body: itemObjects,
            columns: [
                { header: 'Account', dataKey: '_id' },
                { header: 'Debit', dataKey: 'debit' },
                { header: 'Credit', dataKey: 'credit' },
                { header: 'Balance', dataKey: 'balance' },

            ],
            // didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        })

        doc.save(`Trial Balance Report - ${state.length}.pdf`);
    }

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
                            <h3>Trial Balance</h3>
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
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '700px' }} fluid>
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
                            overlayNoRowsTemplate={error ? '<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">you dont have the permission for this route. Please go back to home.</span>' : '<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'}

                        />
                    </div>
                </Container>
            </Container>
        </Container>
    )
}
