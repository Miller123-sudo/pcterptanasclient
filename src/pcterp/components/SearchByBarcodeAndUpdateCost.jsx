import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';
import { formatAddress, formatAddressNew } from '../../helpers/Utils';

export default function SearchByBarcodeAndUpdateCost({
    state,
    isEditMode,
    show,
    handleSearchByBarcodeModalShow,
    setUpdatedProductObj
}) {
    const [country, setCountry] = useState([]);
    const [states, setStates] = useState([]);
    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });



    useEffect(() => {

    }, [state])


    return (
        <>
            <Modal show={show} onHide={() => handleSearchByBarcodeModalShow(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>SEARCH BY BARCODE AND UPDATE COST PRICE</Modal.Title>
                </Modal.Header>
                <Form >
                    <Modal.Body>
                        <Row>
                            <Col>


                                <Form.Group className="mb-2">
                                    <Form.Label className="m-0">BARCODE</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="barcode"
                                        name="barcode"
                                        {...register(`barcode`)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label className="m-0">COST PRICE</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="cost"
                                        name="cost"
                                        {...register(`cost`)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size='sm' onClick={() => handleSearchByBarcodeModalShow(false)}>
                            Cancel
                        </Button><Button onClick={() => setUpdatedProductObj(getValues())} size='sm' variant="primary">
                            SET
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}



