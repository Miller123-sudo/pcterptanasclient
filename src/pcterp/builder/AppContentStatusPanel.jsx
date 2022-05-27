import React from 'react'
import { Badge, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap'

export default function AppContentStatusPanel({ isAddMode, state, handlePrintOrder, handleReceiveProducts, handleCreateBill, billedCount, productReceiptCount, handleVendorBill, openTransferedProduct }) {
    return (
        <div>
            <Row className="p-0 mb-2 m-0">
                <Col className='p-0 ps-2'>
                    <ButtonGroup size="sm">
                        {!isAddMode && !state?.isFullyReceived ? <Button variant="primary" onClick={handleReceiveProducts}>RECEIVE PRODUCTS</Button> : ""}
                        {!isAddMode && state?.billingStatus !== "Fully Billed" ? <Button onClick={handleCreateBill} variant="primary">CREATE BILL</Button> : ""}
                        {!isAddMode && <Button variant="secondary" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                    </ButtonGroup>

                </Col>
                <Col style={{ display: 'flex', justifyContent: 'end' }}>
                    <div className="me-1 d-flex justify-content-end">
                        {!isAddMode && billedCount > 0 ? <Button size="sm" onClick={handleVendorBill} varient="primary">{billedCount} Vendor Bills</Button> : ""}
                    </div>
                    <div className="me-1 d-flex justify-content-end">
                        {!isAddMode && productReceiptCount > 0 ? <Button size="sm" onClick={openTransferedProduct} varient="primary">{productReceiptCount} Receipt</Button> : ""}
                    </div>
                    <div className="me-1 d-flex justify-content-end">
                        {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.billingStatus}READ</div>}
                    </div>
                </Col>
            </Row>
        </div>
    )
}
