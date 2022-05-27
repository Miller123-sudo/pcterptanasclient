import { React, useState, useEffect } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import ApiService from '../../helpers/ApiServices';
import { formatNumber } from '../../helpers/Utils';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AppLoader from '../../pcterp/components/AppLoader';
const moment = require('moment');


export default function OrdersGeneralLedger({ state }) {
    const [loderStatus, setLoderStatus] = useState(null);
    // const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    // let { path, url } = useRouteMatch();

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

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
        // setLoderStatus("RUNNING");
        // const response = await ApiService.get('generalLedger');
        // console.log(response.data.documents)
        // setstate(response.data.documents)
        // setLoderStatus("SUCCESS");
    }, []);
    console.log(loderStatus);

    // if (loderStatus === "RUNNING") {
    //     return (
    //         <AppLoader />
    //     )
    // }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                {/* <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
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
                </Container> */}
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '45vh' }} fluid>
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
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        // className="ag-grid-table"
                        // rowClass="ag-grid-row"
                        // getRowClass="ag-grid-row-2"
                        // rowStyle={background: 'black'}
                        />
                    </div>
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th style={{ minWidth: '4rem' }} >Date</th>
                                <th >Journal</th>
                                <th >Journal Entry</th>
                                <th >Account</th>
                                <th >Entity</th>
                                <th >Reference</th>
                                <th >Label</th>
                                <th >Debit</th>
                                <th >Credit</th>
                                <th >Balance</th>
                                <th >Product</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    { console.log(element) }
                                    return <tr id={element.id} key={index}>
                                        <td>{new Date(element.date).toDateString()}</td>
                                        <td>{element.journalLabel}</td>
                                        <td>{element.journalEntry?.name}</td>
                                        <td>{element.account?.name}</td>
                                        <td>{element.entity?.name}</td>
                                        <td>{element.reference}</td>
                                        <td>{element.label}</td>
                                        <td>{formatNumber(element.debit)}</td>
                                        <td>{formatNumber(element.credit)}</td>
                                        <td>{formatNumber(element.balance)}</td>
                                        <td>{element.product?.name}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table> */}
                </Container>
            </Container >
        </Container >
    )
}



// OLD CODE

// import { React, useState, useEffect } from 'react';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import { Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
// import ApiService from '../../../helpers/ApiServices';
// import { formatNumber } from '../../../helpers/Utils';
// const moment = require('moment');


// export default function GeneralLedgerList() {
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
//     const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

//     const columns = [
//         { headerName: 'Date', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
//         { headerName: 'Journal', field: 'journalLabel' },
//         { headerName: 'Journal Entry', field: 'journalEntry.name' },
//         { headerName: 'Account', field: 'account.name' },
//         { headerName: 'Entity', field: 'entity.name' },
//         { headerName: 'Reference', field: 'reference' },
//         { headerName: 'Label', field: 'label' },
//         { headerName: 'Debit', field: 'debit', valueGetter: (params) => formatNumber(params.data?.debit) },
//         { headerName: 'Credit', field: 'credit', valueGetter: (params) => formatNumber(params.data?.credit) },
//         { headerName: 'Balance', field: 'balance', valueGetter: (params) => formatNumber(params.data?.balance) },
//         { headerName: 'Product', field: 'product.name' },
//     ]

//     useEffect(async () => {
//         const response = await ApiService.get('generalLedger');
//         console.log(response.data.documents)
//         setstate(response.data.documents)

//     }, []);
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
//                     <Row>
//                         <Col><h3>General Ledgers</h3></Col>
//                     </Row>
//                     <Row>

//                         <Col md="4" sm="6">
//                             <Row>
//                                 <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
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
//                                 minWidth: 200
//                             }}
//                             pagination={true}
//                             paginationPageSize={50}
//                         />
//                     </div>
//                     {/* <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th style={{ minWidth: '4rem' }} >Date</th>
//                                 <th >Journal</th>
//                                 <th >Journal Entry</th>
//                                 <th >Account</th>
//                                 <th >Entity</th>
//                                 <th >Reference</th>
//                                 <th >Label</th>
//                                 <th >Debit</th>
//                                 <th >Credit</th>
//                                 <th >Balance</th>
//                                 <th >Product</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     { console.log(element) }
//                                     return <tr id={element.id} key={index}>
//                                         <td>{new Date(element.date).toDateString()}</td>
//                                         <td>{element.journalLabel}</td>
//                                         <td>{element.journalEntry?.name}</td>
//                                         <td>{element.account?.name}</td>
//                                         <td>{element.entity?.name}</td>
//                                         <td>{element.reference}</td>
//                                         <td>{element.label}</td>
//                                         <td>{formatNumber(element.debit)}</td>
//                                         <td>{formatNumber(element.credit)}</td>
//                                         <td>{formatNumber(element.balance)}</td>
//                                         <td>{element.product?.name}</td>
//                                     </tr>
//                                 })
//                             }
//                         </tbody>
//                     </Table> */}
//                 </Container>
//             </Container>
//         </Container>
//     )
// }
