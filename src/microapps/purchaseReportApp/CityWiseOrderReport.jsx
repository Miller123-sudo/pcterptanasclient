import { React, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { PropagateLoader } from "react-spinners";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import ApiService from '../../helpers/ApiServices';
import AppLoader from '../../pcterp/components/AppLoader';
import TextField from '../../pcterp/field/TextField';
import { infoNotification, TanasUtils } from '../../helpers/Utils';
import DateField from '../../pcterp/field/DateField';
const moment = require('moment');

export default function CityWiseOrderReport() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    // let { path, url } = useRouteMatch();
    const { id } = useParams();

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
        }
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

    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        // {
        //     headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
        //         <>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}`}><BsBoxArrowInUpRight /></Button>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}`}><BsEyeFill /></Button>
        //         </>
        // },
        { headerName: 'Product', field: 'productName' },
        { headerName: 'Stock adjusted', field: 'quantity' },
    ]

    const handleSearchInvAdj = async () => {
        console.log(getValues());
        const response = await ApiService.get(`inventoryAdjustment/findStockAdjustment?endDate=${getValues("endDate")}&startDate=${getValues("startDate")}`);
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)
        }
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log(getValues())
        const response = await ApiService.get(`newBill/cityWiseOrder`);
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)
        }
        setLoderStatus("SUCCESS");
    }, [])

    const rowClicked = (params) => {
    }

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                    <Row>
                        <Col><h3>CITY WISE ORDER REPORT</h3></Col>
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
                            onRowClicked={rowClicked}
                            paginationPageSize={50}
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>


                </Container>


            </Container>
        </Container >
    )
}
