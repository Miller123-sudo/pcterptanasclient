import { React, useContext, useState, useEffect } from 'react'
import { Col, Row, Button } from 'react-bootstrap'
import { PropagateLoader, GridLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../components/states/contexts/UserContext'
import ApiService from '../../helpers/ApiServices'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppLoader from '../../pcterp/components/AppLoader';
import { errorMessage, formatNumber } from '../../helpers/Utils';
const moment = require('moment');

export default function GeneralLedgerList() {
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setstate] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);


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


    const findAllDocument = async () => {
        ApiService.setHeader();
        try {
            const response = await ApiService.get('generalLedger');
            console.log(response.data.documents)
            setstate(response.data.documents)
            setLoderStatus("SUCCESS");
        } catch (e) {
            errorMessage(e, null)
        }
    }

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


    useEffect(() => {
        setLoderStatus("RUNNING");
        findAllDocument();
    }, []);


    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm>
            <AppContentHeader>
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
            </AppContentHeader>
            <AppContentBody>
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
                        // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                        overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                    />
                </div>

            </AppContentBody>
        </AppContentForm>
    )
}
