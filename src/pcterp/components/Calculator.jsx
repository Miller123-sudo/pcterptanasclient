import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';
import { formatAddress, formatAddressNew } from '../../helpers/Utils';

export default function Calculator({
    state,
    isEditMode,
    show,
    handleShow,
    checkDefault,
    setCalObj
}) {
    const [country, setCountry] = useState([]);
    const [states, setStates] = useState([]);
    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });



    useEffect(() => {

    }, [state])


    return (
        <>
            <Modal show={show} onHide={() => handleShow(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>CALCULATOR</Modal.Title>
                </Modal.Header>
                <Form >
                    <Modal.Body>
                        <Row>
                            <Col>


                                <Form.Group>
                                    <Form.Label>COST</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="cost"
                                        name="cost"
                                        {...register(`cost`)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>EXPENCE</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="expence"
                                        name="expence"
                                        {...register(`expence`)}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>TRANSPORT (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="transport"
                                        name="transport"
                                        {...register(`transport`)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>PROFIT (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="profit"
                                        name="profit"
                                        {...register(`profit`)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>GST (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="gst"
                                        name="gst"
                                        {...register(`gst`)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                {/* <Form.Group>
                                    <Form.Label>MRP</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="mrp"
                                        name="mrp"
                                        {...register(`mrp`)}
                                    >
                                    </Form.Control>
                                </Form.Group> */}

                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size='sm' onClick={() => handleShow(false)}>
                            Cancel
                        </Button>
                        {isEditMode ? <Button onClick={null} size='sm' variant="primary">
                            Update
                        </Button> : <Button onClick={() => setCalObj(getValues())} size='sm' variant="primary">
                            Add
                        </Button>}
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}



