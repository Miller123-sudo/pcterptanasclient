import { React, useState, useEffect } from 'react';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { formatNumber } from '../../../helpers/Utils';
import ApiService from '../../../helpers/ApiServices';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { AppListController, MOUNT } from '../controllers/controllerList';
import config from '../__config.json';
import { AppContainer, AppHeader, AppContentContainer, AppContentForm, AppContentHeader, AppContentBody } from '../../../pcterp/builder/Index';
import AppLoader from '../../../pcterp/components/AppLoader';
const moment = require('moment');



export default function DocumentList() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    MOUNT.ROOT_PATH = rootPath;
    MOUNT.NAVIGATE = useNavigate();
    MOUNT.DOCUMENT_TYPE_ID = searchParams.get('doctype')
    MOUNT.LOADER = loderStatus;
    MOUNT.SET_LOADER_FUN = setLoderStatus;

    const [state, setstate] = useState([]);
    const [model, setModel] = useState([]);
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

    const getValueGetter = (data, col) => {
        switch (col.type) {
            case 'String':
                return data[`${col.fieldId}`]
            case 'Long String':
                return data[`${col.fieldId}`]
            case 'Number':
                return data[`${col.fieldId}`]
            case 'Decimal':
                return data[`${col.fieldId}`]
            case 'Boolean':
                return data[`${col.fieldId}`] == true ? 'True' : 'False'
            case 'Currency':
                return data[`${col.fieldId}`] ? formatNumber(data[`${col.fieldId}`]) : formatNumber(0.00);
            case 'Date':
                return data[`${col.fieldId}`] ? moment(data[`${col.fieldId}`]).format("MM/DD/YYYY  hh:mm:ss") : "Not Available";
            case 'App':
                return data[`${col.fieldId}`] ? data[`${col.fieldId}`][0].name : "Not Available";
            default:
                return null;
        }

    }


    const createColumns = () => {
        if (model.length === 0) return null;
        const columnArray = new Array();

        const column = {
            headerName: '#', field: '_id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${rootPath}/customapp/edit/${params.value}?doctype=${searchParams.get('doctype')}`}><BsBoxArrowInUpRight /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/order/${params.value}?mode=view`}><BsEyeFill /></Button> */}
                </>
        }
        columnArray.push(column)

        model?.columns.map((col, index) => {

            const columns = {
                headerName: col.label,
                field: col.name,
                valueGetter: (params) => getValueGetter(params.data, col)  //params.data[`${col.name}`] ? moment(params.data?.receiptDate).format("MM/DD/YYYY") : "Not Available"
            }
            return columnArray.push(columns)

        })

        return columnArray;

    }




    useEffect(() => {
        setLoderStatus("RUNNING");
        AppListController.initFormListSchema(setModel);
        AppListController.initForm(setstate);
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
                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>{model?.label}</div></Breadcrumb.Item>
                                {/* <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}>   <div className='breadcrum-label'>Purchase Orders</div></Breadcrumb.Item> */}
                            </Breadcrumb>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button size="sm" as={Link} to={`/${rootPath}/customapp/add?doctype=${searchParams.get('doctype')}`}>CREATE</Button>
                        </Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="primary" size="sm"><span>EXPORT CSV</span></Button></Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                    <AgGridReact
                        onGridReady={onGridReady}
                        rowData={state}
                        columnDefs={createColumns()}
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
