import { React, useState, useEffect, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { BsBank2, BsBuilding, BsFillPeopleFill, BsCashCoin, BsFileEarmarkSpreadsheetFill, BsGearFill, BsGraphUp, BsBagCheckFill, BsPersonFill } from 'react-icons/bs';
import { MdPointOfSale, MdPrecisionManufacturing, MdMoreTime, MdOutlineDashboardCustomize } from 'react-icons/md';
import { DiAtom } from 'react-icons/di'
import { AppContentForm } from '../../../pcterp/builder/Index'
import { GridLoader } from "react-spinners";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ApiService from '../../../helpers/ApiServices';
import { errorMessage } from '../../../helpers/Utils';
import { UserContext } from '../../states/contexts/UserContext';
import './appGallery.css';
import 'antd/dist/antd.css'
import AppLoader from '../../../pcterp/components/AppLoader';


export default function AppGallery() {
    const [appList, setAppList] = useState(null);
    const [state, setstate] = useState([]);
    const [loderStatus, setLoderStatus] = useState(null);
    const { dispatch, user } = useContext(UserContext);
    let array = new Array()

    const getApps = async () => {
        ApiService.setHeader();
        const response = await ApiService.get('appCenter');
        if (response.data.isSuccess) {
            setAppList(response.data.documents);
            setLoderStatus("SUCCESS");
        }
    }

    const isLogged = () => {
        ApiService.setHeader();
        ApiService.get('appCenter').then(response => {
            console.log(response)

        }).catch(err => {
            console.log(err)
            dispatch({ type: "LOGOUT_USER" });
        })

    }

    const getIcon = (name, color) => {
        switch (name) {
            case 'Accounting':
                return <BsBank2 style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Custom Apps':
                return <MdOutlineDashboardCustomize style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Employees':
                return <BsPersonFill style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Inventory':
                return <BsBuilding style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Manufacturing':
                return <MdPrecisionManufacturing style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Point of Sale':
                return <MdPointOfSale style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Purchase':
                return <BsBagCheckFill style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            case 'Sales':
                return <BsGraphUp style={{ color: `${color}`, fontSize: '3rem', marginTop: '10px' }} />
            default:
                return <DiAtom style={{ color: `${color ? color : "#D1F2EB"}`, fontSize: '3rem', marginTop: '10px' }} />
        }
    }


    useEffect(() => {
        setLoderStatus("RUNNING");
        isLogged();
        getApps();

    }, [])

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }

    return (
        <div className="appGallery">
            <Container fluid>
                <Row className="justify-content-md-center justify-content-center">

                    <Col className="appBoxes" xs={12} sm={12} md={11} lg={11} xl={10}>
                        {
                            appList && appList.map((app, idx) => {
                                return <Link key={idx} to={app.docType ? `/${app?.link}?navcenterid=${app.navCneterLink}&doctype=${app.docType}` : app?.link} className="link">
                                    <div className="appBox" style={{ backgroundColor: `${app.backgroundColor ? app.backgroundColor : "#D1F2EB"}`, }}>
                                        <div className="appBoxLogo">
                                            {getIcon(app.icon, app.color)}
                                        </div>
                                        <div className="appBoxName">{app.abbreviation}</div>
                                    </div>
                                </Link>
                            })
                        }

                        {/* {appList.map(app => {
                            return <Link to={`/${app.linkTo}`} className="link">
                                <div className="appBox">
                                    <div className="appBoxLogo">
                                        <BsFillPeopleFill style={{ color: '#cc0000', fontSize: '4rem' }} />
                                    </div>
                                    <div className="appBoxName">{app.name}</div>
                                </div>
                            </Link>

                        })} */}
                        {/* <Link to={`/crm`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffe6e6", }}>
                                <div className="appBoxLogo">
                                    <BsFillPeopleFill style={{ color: '#cc0000', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">CRM</div>
                            </div>
                        </Link> */}
                        {/* <Link to={`/employees`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6ecff", }}>
                                <div className="appBoxLogo">
                                    <BsPersonFill style={{ color: '#003d99', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Employees</div>
                            </div>
                        </Link> */}
                        {/* <Link to={`/inventory`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffffe6", }}>
                                <div className="appBoxLogo">
                                    <BsBuilding style={{ color: '#999900', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Inventory</div>
                            </div>
                        </Link> */}

                        {/* {
                            // state?.includes("PURCHASE_ORDER") &&
                            <Link to={`/purchase`} className="link">
                                <div className="appBox" style={{ backgroundColor: "#e6fff9", }}>
                                    <div className="appBoxLogo">
                                        <BsBagCheckFill style={{ color: '#009999', fontSize: '3rem', marginTop: '10px' }} />
                                    </div>
                                    <div className="appBoxName">Purchase</div>
                                </div>
                            </Link>
                        } */}

                        {/* {
                            // state?.includes("SALES_ORDER") &&
                            <Link to={`/sales`} className="link">
                                <div className="appBox" style={{ backgroundColor: "#e6f2ff", }}>
                                    <div className="appBoxLogo">
                                        <BsGraphUp style={{ color: '#006699', fontSize: '3rem', marginTop: '10px' }} />
                                    </div>
                                    <div className="appBoxName">Sales</div>
                                </div>
                            </Link>
                        } */}

                        {/* {
                            // state?.includes("POINT_OF_SALE") &&
                            <Link to={`/pos`} className="link">
                                <div className="appBox" style={{ backgroundColor: "#F6DDCC" }}>
                                    <div className="appBoxLogo">
                                        <MdPointOfSale style={{ color: '#BA4A00', fontSize: '3rem', marginTop: '10px', opacity: 1 }} />
                                    </div>
                                    <div className="appBoxName">POS</div>
                                </div>
                            </Link>
                        } */}

                        {/* {
                            // state?.includes("ACCOUNTING", "PURCHASE_ORDER") &&
                            <Link to={`/accountings`} className="link">
                                <div className="appBox" style={{ backgroundColor: "#ffe6ff", }}>
                                    <div className="appBoxLogo">
                                        <BsBank2 style={{ color: '#7a0099', fontSize: '3rem', marginTop: '10px' }} />
                                    </div>
                                    <div className="appBoxName">Accounting</div>
                                </div>
                            </Link>
                        } */}

                        {/* <Link to={`/reporting`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6faff", }}>
                                <div className="appBoxLogo">
                                    <BsFileEarmarkSpreadsheetFill style={{ color: '#007a99', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Reporting</div>
                            </div>
                        </Link> */}
                        {/* <Link to={`/manufacturings`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffebe6", }}>
                                <div className="appBoxLogo">
                                    <MdPrecisionManufacturing style={{ color: '#991f00', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Manufacturing</div>
                            </div>
                        </Link> */}


                        {/* <Link to={`/expenses`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#f7ffe6", }}>
                                <div className="appBoxLogo">
                                    <BsCashCoin style={{ color: '#699900', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Expense</div>
                            </div>
                        </Link> */}

                        {/* <Link to={`/settings`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffe6f2", }}>
                                <div className="appBoxLogo">
                                    <BsGearFill style={{ color: '#99004d', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Settings</div>
                            </div>
                        </Link> */}

                    </Col>

                </Row>

            </Container>
        </div >
    )
}
