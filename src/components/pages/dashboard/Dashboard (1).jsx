import { React, useContext, useState, useEffect } from 'react';
import { Button, Carousel, Col, Container, Nav, Navbar, DropdownButton, Dropdown, Row, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { UserContext } from '../../states/contexts/UserContext';
import { findInitLetters, formatNumber } from '../../../helpers/Utils';
// import AppGallery from '../../ui/organisms/AppGallery';
import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { AgGridReact } from 'ag-grid-react';
// import moment from 'moment';
import { BsBank2, BsGrid3X3GapFill, BsBuilding, BsWifi, BsHouseDoorFill, BsFillPeopleFill, BsCashCoin, BsFileEarmarkSpreadsheetFill, BsGearFill, BsGraphUp, BsBagCheckFill, BsPersonFill } from 'react-icons/bs';
// import { ColumnUtils } from 'ag-grid-community';
import './dashboard (1).css'
import ApiService from '../../../helpers/ApiServices';


export default function Dashboard() {
    const [loderStatus, setLoderStatus] = useState("");
    const [data, setdata] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [state, setstate] = useState([])

    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }





    const columns = [
        { headerName: 'User', field: 'user' },
        // { headerName: 'Login date & time', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'Ip Address', field: 'ipAddress' },
        { headerName: 'Web Browser', field: 'webBrowser' },
        { headerName: 'Request Url', field: 'requestUrl' },
        { headerName: 'Status', field: 'status' },
    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('loginAudit');
        console.log(response.data.documents)
        setstate(response.data.documents)
        setLoderStatus("SUCCESS");

        const data02 = [
            {
                "name": "Group A",
                "value": 2400
            },
            {
                "name": "Group B",
                "value": 4567
            },
            {
                "name": "Group C",
                "value": 1398
            },
            {
                "name": "Group D",
                "value": 9800
            },
            {
                "name": "Group E",
                "value": 3908
            },
            {
                "name": "Group F",
                "value": 4800
            }
        ];

        const data1 = [
            {
                "name": "Jan",
                "uv": 4000,
                "pv": 2400,
                "amt": 2400
            },
            {
                "name": "Feb",
                "uv": 3000,
                "pv": 1398,
                "amt": 2210
            },
            {
                "name": "Mar",
                "uv": 2000,
                "pv": 9800,
                "amt": 2290
            },
            {
                "name": "Apr",
                "uv": 2780,
                "pv": 3908,
                "amt": 2000
            },
            {
                "name": "jun",
                "uv": 1890,
                "pv": 4800,
                "amt": 2181
            },
            {
                "name": "jul",
                "uv": 2390,
                "pv": 3800,
                "amt": 2500
            },
            {
                "name": "Aug",
                "uv": 3490,
                "pv": 4300,
                "amt": 2100
            },
        ]
        setdata(data02)

    }, []);
    console.log(data);

    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-container p-0 m-0" fluid style={{ overflowY: 'scroll' }}>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: '#009999' }} variant="dark">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/galery"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand href="#home">PCTeRP</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto">

                            </Nav>
                            <Nav>
                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <DropdownButton title={user.name} id="nav-dropdown">
                                    <Dropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </Dropdown.Item>
                                </DropdownButton>
                                <Nav.Link active><BsWifi /></Nav.Link>
                                {/* <Nav.Link><BsWifiOff /></Nav.Link> */}
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>
            <Container fluid style={{ border: '1px solid black', height: '100%' }}>
                <Row >
                    <Col lg="4" md="12" sm="12" xs="12">
                        <div style={{ boxShadow: '0 0 1rem rgba(0, 0, 0, 0.2)', height: '100%', width: '100%', borderRadius: '0.5rem', marginTop: '1rem', paddingTop: '1rem' }}>
                            <Row >
                                <Col md="6" sm="6" style={{ position: 'relative', height: '16rem', width: '85%', border: '2px solid #e4e4e4', borderRadius: '0.5rem', margin: '0 auto', marginBottom: '1rem' }}>
                                    {/* <div style={{ width: 'max-content', height: 'max-content', backgroundColor: '#009999', position: 'absolute', right: 120, top: 10, borderRadius: '5px' }}>
                                        <DropdownButton title="Reports" color='#fff !important' id="dropdown-basic-button" >
                                            <Dropdown.Item as={Link} to={`/reporting/inventorystocksreport`}>Purchase Report</Dropdown.Item>
                                            <Dropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Sales Report</Dropdown.Item>
                                        </DropdownButton>
                                    </div> */}
                                    <div style={{ width: 'max-content', height: 'max-content', backgroundColor: '#009999', position: 'absolute', right: 10, top: 10, borderRadius: '5px' }}>
                                        <DropdownButton title="Months" id="dropdown-basic-button">
                                            <Dropdown.Item as={Link} to={`/reporting/inventorystocksreport`}>This Month</Dropdown.Item>
                                            <Dropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Last Month</Dropdown.Item>
                                            <Dropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Last 90 Days</Dropdown.Item>
                                        </DropdownButton>
                                    </div>
                                    <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%, -50%)', borderRadius: '60rem' }}>
                                        <PieChart width={400} height={400} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} >
                                            {/* <Pie style={{ margin: '0 auto' }} data={data} dataKey="uv" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" label /> */}
                                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label />
                                        </PieChart>
                                    </div>
                                </Col>
                                <Col md="6" sm="6" style={{ position: 'relative', height: '16rem', width: '85%', border: '2px solid #e4e4e4', borderRadius: '0.5rem', margin: '0 auto' }}>
                                    <div style={{ width: 'max-content', height: 'max-content', backgroundColor: '#009999', position: 'absolute', right: 120, top: 10, borderRadius: '5px' }}>
                                        <DropdownButton title="Reports" id="dropdown-basic-button"  >
                                            <Dropdown.Item as={Link} to={`/reporting/inventorystocksreport`}>Purchase Report</Dropdown.Item>
                                            <Dropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Sales Report</Dropdown.Item>
                                        </DropdownButton>
                                    </div>
                                    <div style={{ width: 'max-content', height: 'max-content', backgroundColor: '#009999', position: 'absolute', right: 10, top: 10, borderRadius: '5px' }}>
                                        <DropdownButton title="Months" id="dropdown-basic-button" >
                                            <Dropdown.Item as={Link} to={`/reporting/inventorystocksreport`}>This Month</Dropdown.Item>
                                            <Dropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Last Month</Dropdown.Item>
                                            <Dropdown.Item as={Link} to={`/reporting/outstandingbillsreport`}>Last 90 Days</Dropdown.Item>
                                        </DropdownButton>
                                    </div>
                                    <div style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%, -50%)', borderRadius: '60rem' }}>
                                        <AreaChart width={350} height={150} data={data}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                                            <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
                                        </AreaChart>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col lg="8" md="12" sm="12" xs="12" style={{ height: "100%" }}>
                        <div style={{ boxShadow: '0 0 1rem rgba(0, 0, 0, 0.2)', height: '34.9rem', width: '100%', borderRadius: '0.5rem', paddingTop: 0, marginTop: '1rem', paddingTop: 20 }}>
                            <div style={{ background: 'rgb(235, 235, 235)', color: '#888', width: 'max-content', borderRadius: '5px', padding: '0 1rem', marginLeft: 20, marginBottom: 10, }}>Recently Opened Apps</div>
                            <Row style={{ height: '5rem', border: '2px solid #e4e4e4', width: '95%', marginTop: 10, margin: '0 auto', borderRadius: '0.5rem' }}>
                                <Carousel style={{ width: '100%', }} indicators={false} interval={null} variant='dark'>
                                    <Carousel.Item>
                                        <Row >
                                            <Col as={Link} to="/purchase" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#ecf9f2', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsBagCheckFill style={{ color: '#009999', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Purchase</span>
                                            </Col>
                                            <Col as={Link} to="/sales" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#e6f7ff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsGraphUp style={{ color: '#006699', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Sales</span>
                                            </Col>
                                            <Col as={Link} to="/accounting" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#ffe6ff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsBank2 style={{ color: '#7a0099', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Accounting</span>
                                            </Col>
                                            <Col as={Link} to="/reporting" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#e6faff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsFileEarmarkSpreadsheetFill style={{ color: '#007a99', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Reporting</span>
                                            </Col>
                                        </Row>
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <Row>
                                            <Col as={Link} to="/purchase" l style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#ecf9f2', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>

                                                <BsBagCheckFill style={{ color: '#009999', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Purchase</span>

                                            </Col>
                                            <Col as={Link} to="/sales" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#e6f7ff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsGraphUp style={{ color: '#006699', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Sales</span>
                                            </Col>
                                            <Col as={Link} to="/accounting" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#ffe6ff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsBank2 style={{ color: '#7a0099', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Accounting</span>
                                            </Col>
                                            <Col as={Link} to="/reporting" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#e6faff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsFileEarmarkSpreadsheetFill style={{ color: '#007a99', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Reporting</span>
                                            </Col>
                                        </Row>
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <Row>
                                            <Col as={Link} to="/purchase" l style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#ecf9f2', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>

                                                <BsBagCheckFill style={{ color: '#009999', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Purchase</span>

                                            </Col>
                                            <Col as={Link} to="/sales" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#e6f7ff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsGraphUp style={{ color: '#006699', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Sales</span>
                                            </Col>
                                            <Col as={Link} to="/accounting" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#ffe6ff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsBank2 style={{ color: '#7a0099', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Accounting</span>
                                            </Col>
                                            <Col as={Link} to="/reporting" style={{ height: '3rem', minWidth: '7rem', backgroundColor: '#e6faff', margin: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                                                <BsFileEarmarkSpreadsheetFill style={{ color: '#007a99', fontSize: '2rem', marginTop: '7px' }} />
                                                <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#000' }}>Reporting</span>
                                            </Col>
                                        </Row>
                                    </Carousel.Item>
                                </Carousel>
                            </Row>
                            <div style={{ background: 'rgb(235, 235, 235)', color: '#888', width: 'max-content', borderRadius: '5px', padding: '0 1rem', marginLeft: 20, marginTop: 20 }}>Login Audit Log</div>
                            <Row style={{ height: '22rem', width: '95%', margin: '0 auto', marginTop: 10, borderRadius: '0.5rem' }}>
                                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%', border: '2px solid #e4e4e4' }}>
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
                                        className="ag-grid-class"
                                        // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                                        overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                                    />
                                </div>

                            </Row>
                        </div>
                    </Col>
                </Row >
            </Container >
        </Container >
    )
}
