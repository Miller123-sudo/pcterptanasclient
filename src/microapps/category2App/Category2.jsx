import { React, useEffect, useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsTrash, BsEyeFill } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import ApiService from '../../helpers/ApiServices';
const moment = require('moment');


const animatedComponents = makeAnimated();

export default function Category2() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    // let { path, url } = useRouteMatch();
    const { id } = useParams();
    const isAddMode = !id;


    const [productMasterList, setProductMasterList] = useState([])
    const [selectOptions, setSelectOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [editModeData, seteditModeData] = useState([]);

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
        {
            headerName: 'Delete', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" onClick={() => handleDeleteList(params)} ><BsTrash /></Button>
                </>
        },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Created At', field: 'createdAt', valueGetter: (params) => params.data?.createdAt ? moment(params.data?.createdAt).format("MM/DD/YYYY") : "Not Available" },

    ]

    const onSubmit = (data) => {
        let newData = { ...data }
        newData['schemaId'] = 'secondCategory';
        newData['parent'] = selectedOptions;
        createRecord(newData);
    }

    const createRecord = async (data) => {
        await ApiService.get(`/itemCategory/search?type=${data.schemaId}&name=${data.name}`)
            .then(async firstResponse => {
                let responseData = firstResponse.data;
                if (responseData.isSuccess && responseData.results > 0) {
                    let filteredParent = [];
                    data.parent.map((parentValue) => {
                        if (!responseData.document[0].parent.includes(parentValue)) {
                            filteredParent.push(parentValue)
                        }
                    })

                    if (filteredParent.length > 0) {
                        await ApiService.patch(`itemCategory/${responseData.document[0].id}`, { parent: filteredParent })
                            .then(secondResponse => {
                                //history.push('/purchase/orders')
                                ApiService.get('/itemCategory/search?type=secondCategory').then(res => {
                                    console.log(res.data.document)
                                    setstate(res.data.document)
                                    setValue("name", "");
                                    setValue("parent", null)
                                });
                                console.log(secondResponse)
                            })
                    }
                }
                else {
                    await ApiService.post(`/itemCategory`, data).then(response => {
                    }).catch(err => console.log(err));
                }
                ApiService.get('/itemCategory/search?type=secondCategory').then(res => {
                    console.log(res.data.document)
                    setstate(res.data.document)
                    setValue("name", "")
                    setValue("parent", null)
                });
            })
    }

    const deleteDocument = (id) => {
        ApiService.setHeader();
        return ApiService.delete(`/itemCategory/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                ApiService.get('/itemCategory/search?type=secondCategory').then(res => {
                    console.log(res.data.document)
                    setstate(res.data.document)
                });
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const handleDeleteList = (params) => {
        deleteDocument(params.value)

    }


    useEffect(async () => {
        setLoderStatus("RUNNING");
        await ApiService.get('/itemCategory/search?type=firstCategory')
            .then(async response => {
                if (response.data.isSuccess) {
                    setProductMasterList(value => response.data.document)
                    let options = []
                    await response.data.document.map((value) => {
                        let res = {}
                        res['value'] = value.id;
                        res['label'] = value.name;
                        options.push(res)
                        return null;
                    })
                    setSelectOptions(options)
                }
            })
        const response = await ApiService.get('/itemCategory/search?type=secondCategory');
        console.log(response.data.document)
        setstate(response.data.document)
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
                        <Col><h3>Category 2</h3></Col>
                    </Row>
                    <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                        <Row>
                            <Form.Group className="mb-0" md="4" as={Col}>
                                <Form.Label className="mb-0">Name</Form.Label>
                                <Form.Control type="text" id="name" name="name" {...register("name")} required />
                            </Form.Group>
                            {productMasterList && selectOptions && <Form.Group className="mb-0" md="4" as={Col}>
                                <Form.Label className="mb-0">Product Master</Form.Label>
                                <Select id="parent" name="parent"
                                    options={selectOptions}
                                    value={editModeData.parent && editModeData.parent.map((value) => (
                                        selectOptions[selectOptions.findIndex(element => element.value === value)]
                                    ))}

                                    isMulti
                                    components={animatedComponents}
                                    onChange={(selected) => {
                                        let parentArr = []
                                        selected.map((value) => {
                                            parentArr.push(value.value)
                                            return null;
                                        })
                                        setSelectedOptions(parentArr)
                                        !isAddMode && seteditModeData(parentArr)
                                    }}
                                />
                            </Form.Group>}

                        </Row>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="mb-0">{" "}</Form.Label> <br />
                                <Button variant="primary" size="md" type='submit'>Add</Button>
                            </Form.Group>
                        </Row>
                    </Form>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%', zIndex: 10 }}>
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
