import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';
import { formatAddress, formatAddressNew } from '../../helpers/Utils';

export default function ManualEnterCostAndMrp({
    state,
    isEditMode,
    show,
    handleManualShow,
    setManualObj
}) {
    const [country, setCountry] = useState([]);
    const [states, setStates] = useState([]);
    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });



    useEffect(() => {

    }, [state])


    return (
        <>
            <Modal show={show} onHide={() => handleManualShow(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>MANUAL ENTER COST AND MRP</Modal.Title>
                </Modal.Header>
                <Form >
                    <Modal.Body>
                        <Row>
                            <Col>


                                <Form.Group className="mb-2">
                                    <Form.Label className="m-0">COST</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="cost"
                                        name="cost"
                                        {...register(`cost`)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label className="m-0">MRP</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="MRP"
                                        name="MRP"
                                        {...register(`MRP`)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size='sm' onClick={() => handleManualShow(false)}>
                            Cancel
                        </Button>
                        {isEditMode ? <Button onClick={null} size='sm' variant="primary">
                            Update
                        </Button> : <Button onClick={() => setManualObj(getValues())} size='sm' variant="primary">
                            SET
                        </Button>}
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}



