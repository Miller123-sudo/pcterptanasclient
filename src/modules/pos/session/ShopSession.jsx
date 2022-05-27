import React from 'react'
import { ButtonGroup, Card, Col, Container, Row, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom';
import './shop.css'

export default function ShopSession() {
    const history = useHistory();

    const handleBack = () => {
        history.goBack()
    }

    return (
        <>
            <div className="openning-cash-control-back">
                <div className="opening-cash-control">
                    <div className="opening-cash-control__header">
                        <Button variant='light' style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} onClick={handleBack}>Back</Button>
                        <h5 className="opening-cash-control__header--text">OPENNING CASH CONTROL</h5>
                    </div>
                    <div className="opening-cash-control__input-group">
                        <div className="openning-cash-control__label"><h5 className="opening-cash-control__input-group--text">Openning Cash</h5></div>
                        <div className="openning-cash-control__amount"><h5 className="opening-cash-control__input-group--text"><input type="text" className="openning-cash-control__amount--input" placeholder="INR" /></h5></div>
                    </div>
                    <div className="openning-cash-control__notes"><textarea className="openning-cash-control__notes--input" rows="4" placeholder="Write your notes here.."></textarea></div>
                    <div className="opening-cash-control__footer"><h5 className="opening-cash-control__header--text"><Button type="primary">OPEN SESSION</Button></h5></div>
                </div>

            </div>
            <Container className="pct-app-content-container p-0 m-0" fluid>
                <Container className="pct-app-content" fluid>
                    <Container className="pct-app-content-header p-0 m-0 pb-2" fluid>
                        <Row>
                            {/* <Col><h3>Point Of Sale</h3></Col> */}
                        </Row>
                    </Container>
                    <Container className="pct-app-content-body p-0 m-0" fluid>

                    </Container>
                </Container>
            </Container>
        </>

    )
}
