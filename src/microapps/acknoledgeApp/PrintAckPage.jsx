import React from 'react'
import { Col, Row, Button, Container, Breadcrumb, Table } from 'react-bootstrap'

const PrintAckPage = React.forwardRef((props, ref) => {
    return (
        <Container fluid style={{ border: "1px solid black", paddingLeft: 30, paddingRight: 30 }} id="printAck">
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
                <Table striped bordered hover size="sm" style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Bill#</th>
                            <th>DISCOUNTS</th>
                            <th>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            props.selectedBill?.map(e => {
                                return (<tr>
                                    <td>{e.name}</td>
                                    <td>
                                        <Table>
                                            <tr>
                                                <th>REASON</th>
                                                <th>AMOUNT</th>
                                            </tr>
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
            </div>
        </Container >
    )
});

export default PrintAckPage