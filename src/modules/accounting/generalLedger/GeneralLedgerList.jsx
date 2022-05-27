import { React, useState, useEffect, useContext } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import ApiService from '../../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import { UserContext } from '../../../components/states/contexts/UserContext';
const moment = require('moment');


export default function GeneralLedgerList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [error, seterror] = useState();
    const { dispatch, user } = useContext(UserContext)
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];

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
        { headerName: 'Date', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'Journal', field: 'journalLabel' },
        { headerName: 'Journal Entry', field: 'journalEntry.name' },
        { headerName: 'Account', field: 'account.name' },
        { headerName: 'Entity', field: 'entity.name' },
        { headerName: 'Reference', field: 'reference' },
        { headerName: 'Label', field: 'label' },
        { headerName: 'Debit', field: 'debit', valueGetter: (params) => formatNumber(params.data?.debit) },
        { headerName: 'Credit', field: 'credit', valueGetter: (params) => formatNumber(params.data?.credit) },
        { headerName: 'Balance', field: 'balance', valueGetter: (params) => formatNumber(params.data?.balance) },
        { headerName: 'Product', field: 'product.name' },
    ]

    useEffect(async () => {
        try {
            setLoderStatus("RUNNING");
            const response = await ApiService.get('generalLedger');
            console.log(response.data.documents)
            setstate(response.data.documents)
        } catch (e) {
            seterror(e.response?.data.message)
            console.log(e.response);
            errorMessage(e, dispatch)
        }
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
                        <Col><h3>General Ledgers</h3></Col>
                    </Row>
                    <Row>
                        <Col md="8" sm="6"></Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
                    <div className="ag-theme-alpine ag-row-hover" style={{ height: '100%', width: '100%' }}>
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
                            overlayNoRowsTemplate={error ? '<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">you dont have the permission for this route. Please go back to home.</span>' : '<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'}
                        // className="ag-grid-table"
                        // rowClass="ag-grid-row"
                        // getRowClass="ag-grid-row-2"
                        // rowStyle={background: 'black'}
                        />
                    </div>

                </Container>
            </Container >
        </Container >
    )
}
