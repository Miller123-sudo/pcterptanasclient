import { React, useEffect, useState } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Button, Table, Col, Container, Row } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import utils from '../../../helpers/Utils';
import ApiService from '../../../helpers/ApiServices';

export default function CompanyList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }
    // }
    // const handleSearch = (e) => {
    //     gridApi.setQuickFilter(e.target.value);
    // }

    // const handleExportAsCsv = (e) => {
    //     gridApi.exportDataAsCsv();
    // }
    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/company/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/company/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Company', field: 'name' },
        { headerName: 'Email', field: 'email' },
        { headerName: 'Phone', field: 'phone' },
        // { headerName: 'Address', field: 'address' },
    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('company');
        console.log(response.data.documents)
        setstate(response.data.documents)
        setLoderStatus("SUCCESS");
    }, [])


    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>Companies</h3></Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to={`/${url?.split('/')[1]}/company`} variant="primary" size="sm">Create</Button></Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
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
                    </div>
                </Container>
            </Container>
        </Container>
    )
}


