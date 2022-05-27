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


export default function SalesReport() {
    const [state, setState] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loderStatus, setLoderStatus] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isChangeCustomerBtnVisible, setIsChangeCustomerBtnVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({});
    const [topSellingToWorstSellingState, setTopSellingToWorstSellingState] = useState([]);
    const [topEmployeeState, setTopEmployeeState] = useState([]);
    const [saleByTimeFrameState, setSaleByTimeFrameState] = useState([]);
    const [selectOption, setSelectOption] = useState(0);
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
        console.log("onGridReay")
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }

    const handleSearch = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const handleExportAsCsv = (e) => {
        gridApi.exportDataAsCsv();
    }

    const columnsTopSellingToWorstSelling = [
        { headerName: 'Type', field: 'type', flex: 1 },
        { headerName: 'Name', field: 'name', flex: 1 },
        { headerName: 'Description', field: 'description', flex: 2 },
        { headerName: 'Category', field: `category`, flex: 1 },
        { headerName: 'Total Quantity Sold', field: 'totalSoldQuantity', flex: 1 },
        { headerName: 'On Hand', field: 'onHand', flex: 1 },
    ]
    // 7987217795
    columns.push(columnsTopSellingToWorstSelling);

    const columnsSalesByEmployee = [
        {
            headerName: 'Employee Name', field: 'salesRepDetails', valueGetter: (params) => {
                console.log(params.data)
                return params?.data?._id?.salesRepDetails ? params?.data?._id?.salesRepDetails[0]?.name : 'Not Available'
            }, flex: 1
        },
        { headerName: 'Product Name', field: 'productName', valueGetter: (params) => params.data?._id?.productName ? params.data?._id?.productName : 'Not Available', flex: 1 },
        // { headerName: 'Description', field: 'productDescription', valueGetter: (params) => params.data?._id?.productDescription ? params.data?._id?.productDescription : 'Not Available', flex: 1 },
        { headerName: 'Total Quantity Sold', field: 'totalSoldQuantity', valueGetter: (params) => params.data?.totalSoldQuantity ? params.data?.totalSoldQuantity : 'Not Available', flex: 1 },
    ]
    columns.push(columnsSalesByEmployee)

    const columnsSalesByTimeFrame = [
        { headerName: 'Date', field: 'date', valueGetter: (params) => params.data?._id?.date ? params.data?._id?.date : 'Not Available', flex: 1 },
        { headerName: 'Product Name', field: 'productName', valueGetter: (params) => params.data?._id?.productName ? params.data?._id?.productName : 'Not Available', flex: 1 },
        // { headerName: 'Description', field: 'productDescription', valueGetter: (params) => params.data?._id?.productDescription ? params.data?._id?.productDescription : 'Not Available', flex: 1 },
        { headerName: 'Total Quantity Sold', field: 'totalSoldQuantity', valueGetter: (params) => params.data?.totalSoldQuantity ? params.data?.totalSoldQuantity : 'Not Available', flex: 1 },
    ]
    columns.push(columnsSalesByTimeFrame)

    console.log(columns);


    useEffect(async () => {
        setLoderStatus("RUNNING");
        const responseTopSellingToWorstSelling = await ApiService.get('product/report?type=totalsoldquantity');
        console.log(responseTopSellingToWorstSelling.data.documents)
        setTopSellingToWorstSellingState(responseTopSellingToWorstSelling.data.documents);
        state.push(responseTopSellingToWorstSelling.data.documents)

        const responseTopEmployee = await ApiService.get('cashSale/report?type=employee');
        console.log(responseTopEmployee.data.document)
        setTopEmployeeState(responseTopEmployee.data.document);
        state.push(responseTopEmployee.data.document)

        const responseSaleByTimeFrame = await ApiService.get('cashSale/report?type=time');
        console.log(responseSaleByTimeFrame.data.document)
        setSaleByTimeFrameState(responseSaleByTimeFrame.data.document);
        state.push(responseSaleByTimeFrame.data.document);
        setLoderStatus("SUCCESS");

        console.log(state)
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

    // const handleReportsTable = async (option) => {
    //     console.log(option);

    //     if (option === '0') {
    //         setSelectOption('topSellingToWorstSelling')
    //         // ApiService.get('product/report?type=totalsoldquantity').then(response => {
    //         //     console.log(response.data.documents);
    //         //     const data = response.data.documents;
    //         //     setState(response.data.documents);
    //         //     setColumns(columnsTopSellingToWorstSelling);
    //         //     setTimeout(function () {
    //         //         gridApi.redrawRows()
    //         //     }, 5000)
    //         //     // gridApi.refreshCells({ data })
    //         //     // setTimeout(function () {
    //         //     //     gridApi.refreshCells({ data })
    //         //     // }, 1000)
    //         // }).catch(e => {
    //         //     console.log(e)
    //         // })
    //     } else if (option === '1') {
    //         setSelectOption('salesByEmployee')
    //         // ApiService.get('cashSale/report?type=employee').then(response => {
    //         //     console.log(response.data.document)
    //         //     const data = response.data.document;
    //         //     setState(response.data.document);
    //         //     setColumns(columnsSalesByEmployee);

    //         //     // gridApi.refreshCells({ data })
    //         //     setTimeout(function () {
    //         //         gridApi.redrawRows()
    //         //     }, 5000)
    //         // }).catch(e => {
    //         //     console.log(e)
    //         // })
    //     } else if (option === '2') {
    //         setSelectOption('salesByTimeFrame')
    //         // ApiService.get('cashSale/report?type=time').then(response => {
    //         //     console.log(response.data.document)
    //         //     const data = response.data.document;
    //         //     setState(response.data.document);
    //         //     setColumns(columnsSalesByTimeFrame);
    //         //     setTimeout(function () {
    //         //         gridApi.redrawRows()
    //         //     }, 5000)
    //         //     // gridApi.refreshCells({ data })
    //         //     // setTimeout(function () {
    //         //     //     gridApi.refreshCells({ data })
    //         //     // }, 1000)
    //         // }).catch(e => {
    //         //     console.log(e)
    //         // });
    //     } else if (option === 'voidedSales') {
    //         setSelectOption('voidedSales')
    //         // ApiService.get('cashSale/report?type=time').then(response => {
    //         //     console.log(response.data.document)
    //         //     const data = response.data.document;
    //         //     setState(response.data.document);
    //         //     setColumns(columnsVoidedSales);
    //         //     setTimeout(function () {
    //         //         gridApi.redrawRows()
    //         //     }, 5000)
    //         //     // gridApi.refreshCells({ data })
    //         //     // setTimeout(function () {
    //         //     //     gridApi.refreshCells({ data })
    //         //     // }, 1000)
    //         // }).catch(e => {
    //         //     console.log(e)
    //         // });
    //     }
    // }


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
                            <Col><h3 style={{ marginLeft: 10 }}>Sales Report</h3></Col>
                        </Row>
                        <Row>
                            <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div className="buttonGroup__back">
                                        <Button size='sm' variant='light' onClick={handleBack}>Back</Button>
                                    </div>
                                    <Form.Group>
                                        <Form.Select size='sm' onChange={e => setSelectOption(e.target.value)}>
                                            <option value="0">Top Selling to Worst Selling</option>
                                            <option value="1">Sales By Employee</option>
                                            <option value="2">Sales By Time-Frame</option>
                                            {/* <option value="voidedSales">Voided Sales</option> */}
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
                                rowData={state[selectOption]}
                                columnDefs={columns[selectOption]}
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
