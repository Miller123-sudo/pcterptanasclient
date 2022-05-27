import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { useHistory } from 'react-router-dom';
// import { Link, useLocation } from 'react-router-dom';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { formatNumber } from '../../helpers/Utils';
import { CustomerContext } from '../../components/states/contexts/CustomerContext';
import ApiService from '../../helpers/ApiServices';
import AppLoader from '../../pcterp/components/AppLoader';
const moment = require('moment');


export default function EmployeesReport() {
    const [state, setState] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loderStatus, setLoderStatus] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isChangeCustomerBtnVisible, setIsChangeCustomerBtnVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({});
    // const history = useHistory();

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const stack = query.get('stack');

    const { addCustomer, removeCustomer, clearCustomer, updateCustomer, customer } = useContext(CustomerContext);

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

    const columnsEmployeesReport = [
        { headerName: 'Date', field: 'customer', valueGetter: (params) => params?.data?._id?.customer ? params?.data?._id?.customerDetails[0].name : 'Walk-In Customer', flex: 1 },
        { headerName: 'Employee', field: 'productName', valueGetter: (params) => params.data?._id?.productName ? params.data?._id?.productName : 'Not Available', flex: 1 },
        { headerName: 'Shift', field: 'totalSoldQuantity', valueGetter: (params) => params.data?.totalSoldQuantity ? params.data?.totalSoldQuantity : 'Not Available', flex: 1 },
        { headerName: 'Hours Worked', field: 'totalSoldQuantity', valueGetter: (params) => params.data?.totalSoldQuantity ? params.data?.totalSoldQuantity : 'Not Available', flex: 1 },

    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('employee');
        console.log(response.data.document)
        setState(response.data.document);
        setColumns(columnsEmployeesReport);
        setLoderStatus("SUCCESS");
    }, [])

    const handleRowSelection = e => {
        setIsChangeCustomerBtnVisible(true)
        console.log(e.data);
        // addCustomer(e.data);
        setSelectedCustomer(e.data);
        console.log(customer);
        // clearCustomer();
        console.log(customer);
        // addCustomer(e.data);
        // console.log(customer)
    }

    const handleSetCustomer = (currentCustomer) => {
        console.log(customer);
        console.log(currentCustomer);
        console.log(selectedCustomer);
        updateCustomer(currentCustomer);
        console.log(customer);


        if (stack === 'dashboard') navigate('/pos');
        if (stack === 'payment') navigate('/pos/payment');
        if (stack === 'refund') navigate('/pos/refund');
        // navigate("/pos");
        // history.goBack();
    }

    const handleBack = () => {
        // history.goBack();
        // if (stack === 'dashboard') navigate('/pos');
        // if (stack === 'payment') navigate('/pos/payment');
        // if (stack === 'refund') navigate('/pos/refund');
        navigate('/pos');
    }

    const handleReportsTable = async (option) => {
        console.log(option);

        if (option === 'topSellingToWorstSelling') {
            const response = await ApiService.get('product/report?type=customer');
            console.log(response.data.documents)
            setState(response.data.documents);
            setColumns(columnsEmployeesReport)
        }
    }


    console.log(customer);

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }

    return <Container className="pct-app-content-container p-0 m-0" fluid>
        <Container className="pct-app-content-body p-0 m-0" fluid>
            <div className="PCTAppContent">
                <div className="PCTAppLeftContent__refundList">
                    <div className="PCTAppLeftContent__header">
                        <Row>
                            <Col><h3 style={{ marginLeft: 10 }}>Employees Report</h3></Col>
                        </Row>
                        <Row>
                            <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div className="buttonGroup__back">
                                        <Button size='sm' variant='light' onClick={handleBack}>Back</Button>
                                    </div>
                                    <Form.Group>
                                        <Form.Select size='sm' onChange={e => handleReportsTable(e.target.value)}>
                                            <option value="topCustomersToWorstCustomer" selected>Top Employee</option>
                                        </Form.Select>
                                    </Form.Group>
                                </span>

                                {/* <div className="buttonGroup__add">
                                    <Button variant='primary' as={Link} to={`/pos/customer?stack=${stack}`} >Create Customer</Button>
                                </div>
                                {isChangeCustomerBtnVisible && <div className="buttonGroup__add">
                                    <Button variant='primary' onClick={() => handleSetCustomer(selectedCustomer)}>Set Customer</Button>
                                </div>} */}
                                <span style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div>
                                        <input type="text" className="search__panel" placeholder="Search here..." onChange={handleSearch}></input>
                                    </div>
                                    <div>
                                        <Button size='sm' onClick={handleExportAsCsv}>Export CSV</Button>
                                    </div>
                                </span>

                            </div>
                        </Row>

                    </div>
                    <div className="PCTAppLeftContent__content">
                        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                            <AgGridReact
                                onGridReady={onGridReady}
                                rowData={state}
                                columnDefs={columns}
                                rowSelection="single"
                                onCellClicked={handleRowSelection}
                                defaultColDef={{
                                    editable: false,
                                    sortable: true,
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
