import React, { useState, useEffect } from 'react';
import { ButtonGroup, Col, Container, Dropdown, DropdownButton, Form, Row } from 'react-bootstrap';
import { AreaChart, YAxis, XAxis, Area, Tooltip, CartesianGrid, Label, Legend } from 'recharts'
import { useForm, useFieldArray } from 'react-hook-form';
import ApiService from '../../../helpers/ApiServices';
import './reporting.css';
import { formatNumber } from '../../../helpers/Utils';

export default function Dashboard() {
    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();
    const [state, setState] = useState([]);
    const [purchaseOrder, setPurchaseOrder] = useState({});
    const [yaxisName, setYaxisName] = useState('');
    const [records, setRecords] = useState('');

    const data = [
        {
            "name": "March",
            "total": 3000,
        },
        {
            "name": "April",
            "total": 4400,
        },
        {
            "name": "May",
            "total": 5600,
        },
        {
            "name": "June",
            "total": 9000,
        },
        {
            "name": "July",
            "total": 3700,
        },
        {
            "name": "August",
            "total": 3000,
        },
        {
            "name": "September",
            "total": 3200,
        },
        {
            "name": "November",
            "total": 3200,
        },
    ]
    console.log()

    const handleSelectOption = async (name, duration) => {
        console.log("name: " + name + " duration: " + duration);
        const dateObj = new Date();
        let startTime;
        let endTime;
        let days;

        if (duration === 'lastSevenDays') {
            endTime = dateObj.toLocaleDateString();
            dateObj.setDate(dateObj.getDate() - 6);
            startTime = dateObj.toLocaleDateString();
        } else if (duration === 'thisMonth') {
            endTime = dateObj.toLocaleDateString();
            days = dateObj.getDate();
            dateObj.setDate(dateObj.getDate() - days + 1);
            startTime = dateObj.toLocaleDateString();
        } else if (duration === 'lastMonth') {
            days = dateObj.getDate();
            dateObj.setDate(dateObj.getDate() - days);
            endTime = dateObj.toLocaleDateString();
            days = dateObj.getDate();
            dateObj.setDate(dateObj.getDate() - days + 1);
            startTime = dateObj.toLocaleDateString();
            console.log(startTime)
            console.log(endTime);
        } else if (duration === 'lastNintyDays') {
            endTime = dateObj.toLocaleDateString();
            dateObj.setDate(dateObj.getDate() - 90);
            startTime = dateObj.toLocaleDateString();
        }

        console.log(startTime)
        console.log(endTime)

        const response = await ApiService.get(`purchaseOrder/purchaseAnalysis?name=${name}&start=${startTime}&end=${endTime}`);
        if (response.data.isSuccess) {
            console.log(response.data.document);
            const data = response.data.document;

            let sumTotal = 0;
            let sumUntaxedAmount = 0;
            let sumNoOfOrders = 0;
            // let avgDate;
            data.map(e => {
                sumTotal += e.total;
                sumUntaxedAmount += e.untaxedAmount;
                sumNoOfOrders += e.noOfOrders;
                // avgDate = Date.now();
            })
            const purchaseOrderObj = {
                total: sumTotal,
                untaxedAmount: sumUntaxedAmount,
                noOfOrders: sumNoOfOrders,
                // avgDate: avgDate
            }

            console.log("_______________________________________________")
            console.log(purchaseOrderObj)
            setPurchaseOrder(purchaseOrderObj);

            if (data?.length > 0) {
                console.log("data ====> ");
                console.log(data);
                let startDate = data[0].startDate;
                const endDate = data[0].endDate;
                let dataArr = [];
                let index = 0;
                setYaxisName(data[0].name)

                while (startDate <= endDate) {
                    console.log(startDate <= endDate)

                    console.log("start " + startDate);
                    console.log("data " + data[index]._id)

                    const x = new Date(startDate);
                    const y = new Date(data[index]._id)

                    console.log(x.toLocaleDateString());
                    console.log(y.toLocaleDateString());


                    if (x.toLocaleDateString() === y.toLocaleDateString()) {
                        dataArr.push({ xaxis: y.toDateString().substring(4, 10), yaxis: data[index].result })
                        if (index < data.length - 1) {
                            index++;
                        }
                    } else {
                        dataArr.push({ xaxis: x.toDateString().substring(4, 10), yaxis: 0 })
                    }

                    //Increment date by 1 day
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + 1);
                    startDate = date.toISOString()

                    console.log(dataArr)
                }
                setState(dataArr)
            } else {
                const sDate = new Date(startTime);
                const eDate = new Date(endTime);

                let startDate = sDate.toISOString();
                const endDate = eDate.toISOString();

                console.log(startDate);
                console.log(endDate);

                const dataArr = [];

                while (startDate <= endDate) {
                    const forNewFormat = new Date(startDate)
                    dataArr.push({ xaxis: forNewFormat.toDateString().substring(4, 10), yaxis: 0 })

                    //Increment date by 1 day
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + 1);
                    startDate = date.toISOString()

                    console.log(startDate)
                }

                console.log(dataArr)
                setYaxisName(name)
                setState(dataArr);
                setRecords("No Data Found");
            }
        }
    }

    useEffect(() => {
        handleSelectOption('Orders', 'lastSevenDays');
    }, [])

    return (
        < Container className="pct-app-content-container p-0 m-0" fluid >
            <Form className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>{"Purchase Analysis"}</h3></Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Select className='reporting-select' id="reportName" name="reportName" aria-label="Default select example" onChange={e => {
                                const name = e.target.value;
                                const duration = document.querySelector('#reportDuration').value;
                                handleSelectOption(name, duration);
                            }}>
                                <option className='reporting-select-option' value="Orders" selected>Order</option>
                                <option className='reporting-select-option' value="Total">Total</option>
                                <option className='reporting-select-option' value="Quantity Ordered">Quantity Ordered</option>
                                <option className='reporting-select-option' value="Quantity Billed">Quantity Billed</option>
                                <option className='reporting-select-option' value="Quantity Received">Quantity Received</option>
                            </Form.Select>
                            <Form.Select className='reporting-select' id="reportDuration" name="reportDuration" aria-label="Default select example" onChange={e => {
                                const duration = e.target.value;
                                const name = document.querySelector('#reportName').value;
                                handleSelectOption(name, duration);
                            }}>
                                <option className='reporting-select-option' value="lastSevenDays" selected>Last 7 days</option>
                                <option className='reporting-select-option' value="thisMonth">This month</option>
                                <option className='reporting-select-option' value="lastMonth">Last month</option>
                                <option className='reporting-select-option' value="lastNintyDays">Last 90 days</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <AreaChart width={getWindowDimensions().width} height={getWindowDimensions().height - 275} data={state}
                        margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0066cc" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="xaxis">
                            <Label value="" offset={0} position="bottom" />
                        </XAxis>
                        <YAxis dataKey="yaxis">
                            <Label value={yaxisName} angle={-90} position="left" />
                        </YAxis>
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(value, name, props) => [yaxisName.trim() === "Total" ? formatNumber(value) : parseInt(formatNumber(value).substring(1)), yaxisName]} />
                        <Area type="monotone" dataKey="yaxis" stroke="#0066cc" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                    <Container>
                        <Row>

                            <Col md="3" sm="6" xs="6">
                                <div style={{ margin: 10, borderLeft: '2px solid #e4e4e4', paddingLeft: 10 }}>
                                    <h6 style={{ color: 'rgb(103,103,103)', fontWeight: '400' }}>Total Purchase</h6>
                                    <h4 style={{ color: '#444B5A' }}>{purchaseOrder.total ? formatNumber((purchaseOrder.total)?.toFixed(2)) : (0).toFixed(2)}</h4>
                                </div>
                            </Col>
                            <Col md="3" sm="6" xs="6">
                                <div style={{ margin: 10, borderLeft: '2px solid #e4e4e4', paddingLeft: 10 }}>
                                    <h6 style={{ color: 'rgb(103,103,103)', fontWeight: '400' }}>Untaxed Total</h6>
                                    <h4 style={{ color: '#444B5A' }}>{purchaseOrder.untaxedAmount ? formatNumber((purchaseOrder.untaxedAmount)?.toFixed(2)) : (0).toFixed(2)}</h4>
                                </div>
                            </Col>
                            <Col md="3" sm="6" xs="6">
                                <div style={{ margin: 10, borderLeft: '2px solid #e4e4e4', paddingLeft: 10 }}>
                                    <h6 style={{ color: 'rgb(103,103,103)', fontWeight: '400' }}>Orders</h6>
                                    <h4 style={{ color: '#444B5A' }}>{purchaseOrder.noOfOrders ? purchaseOrder.noOfOrders : 0}</h4>
                                </div>
                            </Col>
                            <Col md="3" sm="6" xs="6">
                                <div style={{ margin: 10, borderLeft: '2px solid #e4e4e4', paddingLeft: 10 }}>
                                    <h6 style={{ color: 'rgb(103,103,103)', fontWeight: '400' }}>Average Order</h6>
                                    <h4 style={{ color: '#444B5A' }}>{(purchaseOrder.total / purchaseOrder.noOfOrders) ? formatNumber((purchaseOrder.total / purchaseOrder.noOfOrders)?.toFixed(2)) : (0).toFixed(2)}</h4>
                                </div>
                            </Col>
                            {/* <Col md="3" sm="6" xs="6">
                                    <div style={{ margin: 10, borderLeft: '2x solid #e4e4e4', paddingLeft: 10 }}>
                                        <h6 style={{color: '#rgb(103,103,103>Average Days to Purchase</h6>
                                        <h4 style={{ color: '#444B5A' }}>0.0 days</h4>
                                    </div>
                                </Col> */}

                        </Row>
                    </Container >
                </Container >
            </Form >
        </Container >
    )
}


function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}
