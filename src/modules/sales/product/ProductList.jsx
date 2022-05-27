import { React, useEffect, useState } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Button, Table, Col, Container, Row } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';

export default function ProductList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();

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
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Product Name', field: 'name' },
        { headerName: 'Product Description', field: 'description' },
        { headerName: 'Sales Price', field: 'salesPrice', valueGetter: (params) => formatNumber(params.data?.salesPrice) },
        { headerName: 'Cost', field: 'cost', valueGetter: (params) => formatNumber(params.data?.cost) },
        { headerName: 'Quantity On Hand', field: 'onHand' },
        { headerName: 'Available Quantity', field: 'available' },
    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('Product');
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
                        <Col><h3>Products</h3></Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to={`/${url?.split('/')[1]}/product`} variant="primary" size="sm">Create</Button></Col>
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
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th >#ID</th>
                                <th >Product Name</th>
                                <th >Description</th>
                                <th >Sales Price</th>
                                <th >Cost</th>
                                <th >Quantity On Hand</th>
                                <th >Forecasted Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/product/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>

                                        </td>
                                        <td>{element.name}</td>
                                        <td>{element.description}</td>
                                        <td>{formatNumber(element.salesPrice)}</td>
                                        <td>{formatNumber(element.cost)}</td>
                                        <td>{element.onHand}</td>
                                        <td>{element.available}</td>
                                    </tr>
                                })
                            }


                        </tbody>
                    </Table>
                    {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>No product found. Let's create one!</h4>
                        <h6>You must define a product for everything you sell or purchase, whether it's a storable product, a consumable or a service.</h6>
                    </Container> : ""} */}

                </Container>


            </Container>
        </Container>
    )
}




// import { React, useEffect, useState } from 'react';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import { Button, Table, Col, Container, Row } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import ApiService from '../../../helpers/ApiServices';
// import { formatNumber } from '../../../helpers/Utils';

// export default function ProductList() {
//     const [state, setstate] = useState([]);
//     const [gridApi, setGridApi] = useState(null);
//     const [gridColumnApi, setGridColumnApi] = useState(null);
//     let { path, url } = useRouteMatch();

//     function onGridReady(params) {
//         setGridApi(params.api);
//         setGridColumnApi(params.columnApi);
//     }
//     const handleSearch = (e) => {
//         gridApi.setQuickFilter(e.target.value);
//     }

//     const handleExportAsCsv = (e) => {
//         gridApi.exportDataAsCsv();
//     }
//     const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

//     const columns = [
//         {
//             headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
//                 <>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}?mode=view`}><BsEyeFill /></Button>
//                 </>
//         },
//         { headerName: 'Product Name', field: 'name' },
//         { headerName: 'Product Description', field: 'description' },
//         { headerName: 'Sales Price', field: 'salesPrice', valueGetter: (params) => formatNumber(params.data?.salesPrice) },
//         { headerName: 'Cost', field: 'cost', valueGetter: (params) => formatNumber(params.data?.cost) },
//         { headerName: 'Quantity On Hand', field: 'onHand' },
//         { headerName: 'Available Quantity', field: 'available' },
//     ]

//     useEffect(async () => {
//         const response = await ApiService.get('Product');
//         console.log(response.data.documents)
//         setstate(response.data.documents)

//     }, [])
//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
//                     <Row>
//                         <Col><h3>Products</h3></Col>
//                     </Row>
//                     <Row>
//                         <Col><Button as={Link} to={`/${url?.split('/')[1]}/product`} variant="primary" size="sm">Create</Button></Col>
//                     </Row>
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" style={{ height: '700px' }} fluid>
//                     <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
//                         <AgGridReact
//                             onGridReady={onGridReady}
//                             rowData={state}
//                             columnDefs={columns}
//                             defaultColDef={{
//                                 editable: true,
//                                 sortable: true,
//                                 flex: 1,
//                                 minWidth: 100,
//                                 filter: true,
//                                 resizable: true,
//                                 minWidth: 200
//                             }}
//                             pagination={true}
//                             paginationPageSize={50}
//                             overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
//                         />
//                     </div>
//                     {/* <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th >#ID</th>
//                                 <th >Product Name</th>
//                                 <th >Description</th>
//                                 <th >Sales Price</th>
//                                 <th >Cost</th>
//                                 <th >Quantity On Hand</th>
//                                 <th >Forecasted Quantity</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index} onClick={(e) => { console.log(e.currentTarget) }}>
//                                         <td style={{ maxWidth: "10rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/${url?.split('/')[1]}/product/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>

//                                         </td>
//                                         <td>{element.name}</td>
//                                         <td>{element.description}</td>
//                                         <td>{formatNumber(element.salesPrice)}</td>
//                                         <td>{formatNumber(element.cost)}</td>
//                                         <td>{element.onHand}</td>
//                                         <td>{element.available}</td>
//                                     </tr>
//                                 })
//                             }


//                         </tbody>
//                     </Table>
//                     {state.length == 0 ? <Container className="text-center mt-4">
//                         <h4>No product found. Let's create one!</h4>
//                         <h6>You must define a product for everything you sell or purchase, whether it's a storable product, a consumable or a service.</h6>
//                     </Container> : ""} */}

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
