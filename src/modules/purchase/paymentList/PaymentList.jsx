import { React, useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router';
import { Col, Container, Row, Button, Table } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { errorMessage, formatNumber } from '../../../helpers/Utils';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { UserContext } from '../../../components/states/contexts/UserContext';
const moment = require('moment');

export default function BillPaymentList() {
    const { user, dispatch } = useContext(UserContext)
    const [state, setstate] = useState([]);
    const [billList, setbillList] = useState([])
    const [bill, setbill] = useState()
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();

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
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/billpayment/${params.value}`}><BsBoxArrowInUpRight /></Button> */}
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${rootPath}/billpayment/${params.value}`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Bill#', field: 'name' },
        { headerName: 'Journal Type', field: 'journalType' },
        { headerName: 'Payment Date', field: 'paymentDate', valueGetter: (params) => params.data?.paymentDate ? moment(params.data?.paymentDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'Amount', field: 'amount', valueGetter: (params) => formatNumber(params.data?.amount) }
    ]



    useEffect(async () => {

        try {
            // Find bill and all billpayments related to each record
            const allBills = await ApiService.get(`billPayment/findBillsById/${id}`)
            if (allBills?.data.isSuccess) {
                console.log(allBills?.data.documents);
                setbillList(allBills?.data.documents)

                const Bill = await ApiService.get(`bill/${id}`)
                if (Bill?.data.isSuccess) {
                    console.log(Bill?.data);
                    setbill(Bill?.data.document)
                }
            }
            // if (allBills?.data.documents.length) {
            setstate(allBills?.data.documents)
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        }



    }, []);
    console.log(bill);
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>Vendor Bill Payments for {bill?.name}</h3></Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
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
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>

                </Container>


            </Container>
        </Container>
    )
}


