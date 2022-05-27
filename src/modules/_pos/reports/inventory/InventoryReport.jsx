import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { useHistory } from 'react-router-dom';
// import { Link, useLocation } from 'react-router-dom';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { formatNumber } from '../../../../helpers/Utils';
import { CustomerContext } from '../../../../components/states/contexts/CustomerContext';
import ApiService from '../../../../helpers/ApiServices';
const moment = require('moment');


export default function CustomersReport() {
    const [state, setState] = useState([]);
    // const [columns, setColumns] = useState([]);
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

    const columns = [
        { headerName: 'Brand Name', field: 'brandName', flex: 1 },
        { headerName: 'Product Name', field: 'name', flex: 1, minWidth: 250 },
        { headerName: 'Product Description', field: 'description', flex: 2, minWidth: 400 },
        { headerName: 'Type', field: 'type', flex: 1 },
        { headerName: 'Category', field: 'category', flex: 1 },
        { headerName: 'Sales Price', field: 'salesPrice', valueGetter: (params) => params.data.salesPrice ? formatNumber(params.data.salesPrice) : 0.0, flex: 1 },
        { headerName: 'Available', field: 'available', flex: 1 },
        { headerName: 'Forecasted', field: 'forecasted', flex: 1 },
        { headerName: 'Commited', field: 'commited', flex: 1 },
        { headerName: 'On Hand', field: 'onHand', flex: 1 },
        { headerName: 'Total Quantity Sold', field: 'totalSoldQuantity', valueGetter: (params) => params.data?.totalSoldQuantity ? params.data?.totalSoldQuantity : 'Not Available', flex: 1 },
    ]

    useEffect(async () => {
        // setLoderStatus("RUNNING");
        const response = await ApiService.get('product');
        console.log(response.data.documents)
        setState(response.data.documents);
        // setLoderStatus("SUCCESS");
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

        // if (option === 'topSellingToWorstSelling') {
        //     const response = await ApiService.get('product/report?type=customer');
        //     console.log(response.data.documents)
        //     setState(response.data.documents);
        //     setColumns(columnsTopCustomersToWorstCustomer)
        // }
    }


    console.log(customer)

    return <Container className="pct-app-content-container p-0 m-0" fluid>
        <Container className="pct-app-content-body p-0 m-0" fluid>
            <div className="PCTAppContent">
                <div className="PCTAppLeftContent__refundList">
                    <div className="PCTAppLeftContent__header">
                        <Row>
                            <Col><h3 style={{ marginLeft: 10 }}>Inventory Report</h3></Col>
                        </Row>
                        <Row>
                            <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div className="buttonGroup__back">
                                        <Button variant='light' onClick={handleBack}>Back</Button>
                                    </div>
                                    {/* <Form.Group>
                                        <Form.Select onChange={e => handleReportsTable(e.target.value)}>
                                            <option value="topCustomersToWorstCustomer" selected></option>
                                        </Form.Select>
                                    </Form.Group> */}
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
                                        <Button onClick={handleExportAsCsv}>Export CSV</Button>
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
