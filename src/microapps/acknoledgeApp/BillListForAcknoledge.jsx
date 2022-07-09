import { React, useContext, useState, useEffect, useRef } from 'react'
import { Col, Row, Button, Container, Breadcrumb, Table } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { PropagateLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../components/states/contexts/UserContext'
import ApiService from '../../helpers/ApiServices'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppLoader from '../../pcterp/components/AppLoader';
import { errorMessage, formatNumber, infoNotification } from '../../helpers/Utils';
import { render } from '@testing-library/react';
import jsPDF from "jspdf";
import { PurchaseOrderPDF } from '../../helpers/PDF';
import PrintAckPage from './PrintAckPage';
import { useReactToPrint } from 'react-to-print';
const moment = require('moment')

export default function BillListForAcknoledge() {
    const navigate = useNavigate();
    const location = useLocation();
    const ref = useRef();
    const rootPath = location?.pathname?.split('/')[1];
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setstate] = useState(null);
    const [selectedBill, setselectedBill] = useState([]);
    const [show, setshow] = useState(false);
    const [array, setarray] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let set = new Set()
    let arr = new Array()

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {}
    });


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
        try {
            ApiService.setHeader();
            const response = await ApiService.get('newBill');
            if (response.data.isSuccess) {
                console.log(response.data.documents)
                setstate(response.data.documents)
                setLoderStatus("SUCCESS");

            }
        } catch (error) {
            errorMessage(error, dispatch)
        }
    }

    const renderStatus = (value) => {

        switch (value) {
            case 'Draft': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Posted': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Paid': {
                return <div style={{ backgroundColor: 'green', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Not Paid': {
                return <div style={{ backgroundColor: 'red', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
        }
    }

    const searchHandler = () => {
        if (ref.current.value != "") {
            console.log(ref.current.value);

            state?.map(e => {
                if (e.name == ref.current.value) {
                    set.add(e)
                }
            })
        }
        ref.current.value = ''
        console.log(set);
    }

    const toggleHandler = () => {
        if (show) {
            infoNotification("Selected bills are shown. If you not selected any bill then refresh the page.")
        } else {
            for (const element of set) {
                arr.push(element)
            }

            if (set.size == arr.length) {
                console.log(arr);
                setselectedBill(arr)
                setshow(true)
            }
        }

    }



    // Print cheque and after that set payment status to "paid" of every selected bills for cheque 
    const printCHEQUE = () => {
        // if (selectedBill.length > 0) {
        let arr = new Array();
        let finalarr = new Array();
        let mergedArray = new Array();
        console.log(selectedBill);

        selectedBill?.map((ele) => {

            mergedArray.push(...ele.deductionAndAditions);
        });
        console.log(mergedArray);


        var doc = document.getElementById('printAck').innerHTML
        var originalContents = document.body.innerHTML;

        var printWindow = window.open();
        printWindow.document.write('</head><body >');
        printWindow.document.write(doc);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        document.body.innerHTML = doc;
        printWindow.print();
        document.body.innerHTML = originalContents;

        // var doc = new jsPDF("p", "pt", "a4");
        // doc.html(document.querySelector("#printAck"), {
        //     callback: function (pdf) {
        //         pdf.save("ack.pdf")
        //     }
        // })
        // PurchaseOrderPDF.generateAcknowledgment(selectedBill, mergedArray)

        setselectedBill([])
        setshow(false)
        while (arr.length > 0) {
            arr.pop();
        }
        navigate(`/${rootPath}/bills`)
        window.location.reload()
        // } else {
        //     infoNotification("Please add some bill for print RTGS")
        // }
    }

    // const handlePrint = useReactToPrint({
    //     content: () => ref.current,
    // });

    const resetList = () => {
        setselectedBill([])
        setshow(false)
        while (arr.length > 0) {
            arr.pop();
        }
    }


    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm"><BsBoxArrowInUpRight /></Button>
                    {/* <input type="checkbox" onClick={() => getSelectedRow(params)} /> */}
                </>
        },
        { headerName: 'Bill#', field: 'name' },
        { headerName: 'SOURCED DOCUMENT', field: 'sourceDocumentArray', valueGetter: (params) => params.data?.sourceDocumentArray ? params.data?.sourceDocumentArray[0]?.name : "Not Available" },
        { headerName: 'VENDOR', field: 'vendorArray', valueGetter: (params) => params.data?.vendorArray ? params.data?.vendorArray[0]?.name : "Not Available" },
        { headerName: 'BILL DATE', field: 'billDate', valueGetter: (params) => params.data?.billDate ? moment(params.data?.billDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'TOTAL PRICE', field: 'estimation', valueGetter: (params) => params.data.estimation ? formatNumber(params.data?.estimation.total) : "Not Available" },
        { headerName: 'Is Used', field: 'isUsed' },
        { headerName: 'STATUS', field: 'status', cellRendererFramework: (params) => (renderStatus(params.value)) },
        { headerName: 'PAYMENT STATUS', field: 'paymentStatus', cellRendererFramework: (params) => (renderStatus(params.value)) }
    ]


    useEffect(async () => {

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
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>

                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>PRINT ACKNOLEDGE</div></Breadcrumb.Item>

                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {(rootPath == "accounting" && location?.pathname?.split('/')[2] == "bills") && <Button size="sm" as={Link} to={`/${rootPath}/bills/add`}>CREATE</Button>}

                        </Col>
                        {/* <Col md="4" sm="6"> */}
                        <Col md="7" sm="8">
                            <Row>
                                {/* <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="primary" size="sm"><span>EXPORT CSV</span></Button></Col> */}
                                <Col md="4"><input type="text" className="openning-cash-control__amount--input" name="search" ref={ref} placeholder="Search..." /></Col>{""}
                                <Col md="1"><Button variant="primary" size="sm" onClick={searchHandler}><span>ADD</span></Button></Col>{""}
                                <Col md="1"><Button variant="primary" size="sm" onClick={resetList}><span>RESET</span></Button></Col>{""}
                                <Col md="2"><Button variant="primary" size="sm" onClick={toggleHandler}><span>SELECTED BILL'S</span></Button></Col>{""}
                                <Col md="2"><Button variant="primary" size="sm" onClick={printCHEQUE}><span>PRINT ACKNOLEDGE</span></Button></Col>{""}

                            </Row>
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader >
            {/* <AppContentBody> */}
            < div className="ag-theme-alpine" style={{ height: '50%', width: '100%' }}>
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
            </div >

            {
                show &&
                < div className="ag-theme-alpine" style={{ height: '50%', width: '100%' }}>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Bill#</th>
                                <th>REFERENCE NO.</th>
                                <th>VENDOR</th>
                                <th>PAYMENT STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                selectedBill?.map(e => {
                                    return (<tr>
                                        <td>{e.name}</td>
                                        <td>{e.referenceNumber}</td>
                                        <td>{e.vendorArray[0].name}</td>
                                        <td>{e.paymentStatus}</td>
                                    </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </div>
            }

            {/* </AppContentBody> */}
            {/* <PrintAckPage ref={ref} /> */}

            <Container fluid style={{ border: "1px solid black", paddingLeft: 30, paddingRight: 30, display: "none" }} id="printAck">
                <span><span style={{ fontSize: 60, fontWeight: "bold", color: "#3498DB", fontFamily: "sans-serif" }}>TANAS CREATION LLP </span><span>off:230419,231184</span></span>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#A52A2A", fontFamily: "sans-serif" }}>Wholesale & Retail Cloth & General Merchants</div>
                <hr style={{ color: "#7FB3D5" }} />
                <hr style={{ color: "#7FB3D5" }} />
                <div style={{ fontSize: 15, fontWeight: "bold", fontFamily: "sans-serif" }}>ABERDEEN BAZAAR,   PORT BLAIR- 744101,    ANADAMANS</div>
                <div></div>
                <div>
                    <Row>
                        <Col style={{ fontWeight: "bold", display: "flex", justifyContent: "flex-start" }}>Ref No.</Col>
                        <Col style={{ fontWeight: "bold", display: "flex", justifyContent: "flex-end" }}>Date- {Date.now().toLocaleString()}</Col>
                    </Row>
                </div>
                <div>To,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;M/s<hr /><hr style={{ marginTop: 70 }} /><hr style={{ marginTop: 70 }} /></div>
                <div style={{ fontWeight: "bold" }}>Dear Sir,</div>
                <div >We have a pleasure to inform you that today we are enclosing herewith one D.D/Cheque No. 1234 Dt. {new Date().toLocaleDateString()} for Rs. 300 Rupees one hundred three only
                    drawn on S.B.I Axis Bank bank name brunch against  PART / FULL payment of your bills as per following details.
                </div>
                <div >
                    <Table striped bordered hover size="sm" style={{ width: "100%", border: "1px solid black" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#FFFFFF" }}>
                                <th style={{ marginLeft: '-20px', border: "1px black" }}>Bill#</th>
                                <th style={{ marginLeft: '-20px', border: "1px black" }}>DISCOUNTS</th>
                                <th style={{ marginLeft: '-20px', border: "1px black" }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                selectedBill?.map(e => {
                                    return (<tr style={{ backgroundColor: "#E0FFFF" }}>
                                        <td>{e.name}</td>
                                        <td>
                                            <Table>

                                                {
                                                    e.deductionAndAditions.map(ele => {
                                                        return (
                                                            <tr>
                                                                <td>{ele.reason}</td>
                                                                <td>{ele.amount}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table>
                                        </td>
                                        <td>{e.estimation.total}</td>
                                    </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                    <div>
                        <Row>
                            <Col style={{ fontWeight: "bold", display: "flex", justifyContent: "flex-start" }}>Kindly acknowledge the receipt</Col>
                            <Col style={{ fontWeight: "bold", display: "flex", justifyContent: "flex-end" }}>Yours faithfully</Col>
                        </Row>
                    </div>
                    <div></div>
                    <div style={{ fontWeight: "bold", display: "flex", justifyContent: "flex-start" }}>Thanking You</div>
                </div>
            </Container >

        </AppContentForm >
    )

}
