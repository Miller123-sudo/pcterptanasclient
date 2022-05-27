import { React, useState, useEffect } from 'react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import ApiService from '../../../helpers/ApiServices';
import { BsBoxArrowInUpRight } from 'react-icons/bs'
import { formatNumber } from '../../../helpers/Utils';

export default function PurchaseOrderList() {
    const [state, setstate] = useState([]);
    let { path, url } = useRouteMatch();

    const renderStatus = (value) => {

        switch (value) {
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
            }
            case 'Fully Billed': {
                return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', padding: '2px 10px' }}>{value}</div>
            }
        }
    }

    useEffect(async () => {
        const response = await ApiService.get('purchaseOrder');
        console.log(response.data.documents)
        setstate(response.data.documents)

    }, []);
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Purchase Orders</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/purchase/order" variant="primary" size="sm">Create</Button></Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" fluid>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th></th>
                                <th style={{ minWidth: '8rem' }} >Purchase Order ID</th>
                                <th style={{ minWidth: '8rem' }} >Vendor</th>
                                <th style={{ minWidth: '8rem' }} >Confirmation Date</th>
                                <th style={{ minWidth: '8rem' }} >Total Price</th>
                                <th style={{ minWidth: '8rem' }} >Billing Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr key={index} onClick={(e) => { console.log(e.currentTarget) }}>
                                        <td >
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/order/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>

                                        <td>{element.name}</td>
                                        <td>{element.vendor?.name}</td>
                                        <td>{new Date(element.receiptDate).toDateString()}</td>
                                        <td>{formatNumber(element?.estimation?.total)}</td>
                                        <td>{renderStatus(element.billingStatus)}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table>
                    {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>No purchase order found. Let's create one!</h4>
                        <h6>Once you ordered your products to your supplier, confirm your request for quotation and it will turn into a purchase order.</h6>
                    </Container> : ""}

                </Container>


            </Container>
        </Container>
    )
}
