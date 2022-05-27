import { AgGridReact } from 'ag-grid-react';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import { formatNumber } from '../../helpers/Utils';
import { PropagateLoader } from "react-spinners";
import { jsPDF } from "jspdf";
import { BsBoxArrowInUpRight } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { CartContext } from '../../../components/states/contexts/CartContext';
require('jspdf-autotable');
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// import * as fs from 'fs';
// var fonts = {
//     Roboto: {
//         normal: 'fonts/Roboto-Regular.ttf',
//         bold: 'fonts/Roboto-Medium.ttf',
//         italics: 'fonts/Roboto-Italic.ttf',
//         bolditalics: 'fonts/Roboto-MediumItalic.ttf'
//     }
// };

// var PdfPrinter = require('pdfmake');
// var printer = new PdfPrinter(fonts);
// var fs = require('fs');
const moment = require('moment');

export default function OrderList() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setState] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const contextValues = useContext(CartContext);

    useEffect(async () => {
        setLoderStatus("RUNNING");
        ApiService.setHeader();
        const response = await ApiService.get('/cashSale');
        if (response.data.isSuccess) {
            console.log(response.data.documents);
            setState(response.data.documents);
        }
        contextValues.clearCart();
        setLoderStatus("SUCCESS");
    }, []);


    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }

    const handleSearch = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const columns = [
        {
            headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/pos/order/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
        },
        { headerName: 'Cash Sale Id', field: 'cashSaleId' },
        { headerName: 'Customer', field: 'customer', valueGetter: (params) => params.data?.customer ? params.data?.customer[0]?.name : 'Walk-In Customer' },
        { headerName: 'Employee', field: 'salesRep', valueGetter: (params) => params.data?.salesRep ? params.data?.salesRep[0]?.name : 'Not Available' },
        { headerName: 'Date', field: `date`, valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("MM/DD/YYYY ") : "Not Available" },
    ]

    const renderStatus = (value) => {
        switch (value) {
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Billed': {
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


    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }


    return <Container className="pct-app-content-container p-0 m-0" fluid>
        <Container className="pct-app-content-body p-0 m-0" fluid>
            <div className="PCTAppContent">
                <div className="PCTAppLeftContent__refundList">
                    <div className="PCTAppLeftContent__header">
                        <Row>
                            <Col><h3 style={{ marginLeft: 10 }}>Orders</h3></Col>
                        </Row>
                        <Row>
                            <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <div className="buttonGroup__back">
                                    <Link to={`/pos`} className="link">
                                        <Button variant='light'>Back</Button>
                                    </Link>
                                </div>
                                <div className="buttonGroup__add">
                                    <Button variant='primary' as={Link} to='/pos'>New Order</Button>
                                </div>
                                <div className='buttonGroup__search'>
                                    <input type="text" className="search__panel" placeholder="Search here..." onChange={handleSearch}></input>
                                </div>
                            </div>
                        </Row>

                    </div>
                    <div className="PCTAppLeftContent__content">
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
                                // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                                overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    </Container>;
}
