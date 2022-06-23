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
const moment = require('moment');

export default function PriceChartList() {
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
        { headerName: 'Range0', field: 'range0' },
        { headerName: 'Range1', field: 'range1' },
        { headerName: 'Other Percentage', field: 'otherPercentage' },
        { headerName: 'Profit Percentage', field: 'profitPercentage' },
        { headerName: 'GST Percentage', field: 'gstPercentage' },
        { headerName: 'Basic Calculation', field: 'basicCalculation' },
        { headerName: 'Old System Calculation', field: 'oldSystemCalculation' },
        { headerName: 'Difference', field: 'difference' },
        { headerName: 'Other Difference', field: 'otherDifference' },
        { headerName: 'MRP', field: 'MRP' },
    ]

    const findPriceFactor = (price) => {
        let result = price / 25;
        return Math.ceil(result);
    }

    const findMRP = async () => {
        // if (value) {
        //     const response = await ApiService.patch(`priceChartUpload/findMRP?search=${value}`);
        //     if (response.data.isSuccess) {
        //         setValue("mrp", response.data.document.MRP)
        //         setValue("range", " ")
        //         document.getElementById("range").focus();
        //     }
        // }
        if (!isNaN(getValues("cost")) && !isNaN(getValues("expence")) && !isNaN(getValues("transport")) && !isNaN(getValues("profit")) && !isNaN(getValues("gst"))) {
            console.log("number");
            const tanasUtil = new TanasUtils();
            const rangeArray = tanasUtil.calculatePrice(parseInt(1), parseInt(1), parseInt(getValues("cost")), parseInt(getValues("expence")), parseInt(getValues("transport")), parseInt(getValues("profit")), parseInt(getValues("gst")))
            console.log(rangeArray);

            setValue("mrp", rangeArray[0].price)
            document.getElementById("cost").focus();
        } else {
            console.log("not number");
            infoNotification("Please enter only number")
        }

    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log("hi")
        const response = await ApiService.get('priceChartUpload');
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)
            setLoderStatus("SUCCESS");
        }
    }, [])



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
                        <Col><h3>PRICE CHART</h3></Col>
                    </Row>

                    <Row>
                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">COST</Form.Label>
                            <Form.Control
                                type="text"
                                id="range"
                                name="range"
                                {...register("range")}
                                onBlur={async (e) => {
                                    console.log(e.target.value);
                                    if (e.target.value) {
                                        setvalue(e.target.value)
                                    } else {
                                        setValue("mrp", " ")
                                    }

                                }}
                            />
                        </Form.Group> */}
                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "COST",
                                fieldId: "cost",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "EXPENCE",
                                fieldId: "expence",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "TRANSPORT (%)",
                                fieldId: "transport",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "PROFIT (%)",
                                fieldId: "profit",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "GST (%)",
                                fieldId: "gst",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <Form.Group as={Col} md="4" className="mb-1">
                            <Button variant="primary" size="sm" onClick={findMRP} style={{ marginTop: 26 }}>CALCULATE</Button>
                        </Form.Group>
                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">MRP</Form.Label>
                            <Form.Control
                                disabled
                                type="text"
                                id="mrp"
                                name="mrp"
                                {...register("mrp")}
                            />
                        </Form.Group> */}
                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "MRP",
                                fieldId: "mrp",
                                placeholder: "",
                                disabled: true
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
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
