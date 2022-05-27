import React from 'react'
import { ButtonGroup, Card, Col, Container, Row, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function InventoryOverview() {

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2" fluid>
                    <Row>
                        <Col><h3>Inventory Overview</h3></Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" fluid>
                    <Row className="p-0 mb-2 m-0">
                        <Col xs={12} sm={6} md={4}>
                            <Card style={{ height: '10rem', margin: '1rem 0', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.2)' }}>
                                <Card.Body>
                                    <Link to={`inventory/receivedproducts`} style={{ color: '#000' }}>
                                        <Card.Title >Receipts</Card.Title></Link>
                                    <Button variant="primary" size="sm" style={{ position: 'absolute', bottom: 20, right: 20 }}>4 TO PROCESS</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Card style={{ height: '10rem', margin: '1rem 0', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.2)' }}>
                                <Card.Body>
                                    <Link to={`inventory/deliveryproducts`} style={{ color: '#000' }}>
                                        <Card.Title >Delivery Orders</Card.Title>
                                    </Link>
                                    <Button variant="primary" size="sm" style={{ position: 'absolute', bottom: 20, right: 20 }}>2 TO PROCESS</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Card style={{ height: '10rem', margin: '1rem 0', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.2)' }}>
                                <Card.Body>
                                    <Card.Title style={{ cursor: 'pointer' }}>Returns</Card.Title>
                                    <Button variant="primary" size="sm" style={{ position: 'absolute', bottom: 20, right: 20 }}>1 TO PROCESS</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Card style={{ height: '10rem', margin: '1rem 0', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.2)' }}>
                                <Card.Body>
                                    <Card.Title style={{ cursor: 'pointer' }}>Manufacturing</Card.Title>
                                    <Button variant="primary" size="sm" style={{ position: 'absolute', bottom: 20, right: 20 }}>1 TO PROCESS</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </Container>
    )
}
