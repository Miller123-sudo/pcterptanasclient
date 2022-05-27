import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';
import { formatAddress, formatAddressNew } from '../../helpers/Utils';

export default function Address({
    state,
    addressFields,
    isEditMode,
    show,
    handleShow,
    addressAppend,
    checkDefault,
    setCheckDefault,
    isDefaultTick,
    isDefaultTickAdd,
    setIsDefaultTickAdd,
    setIsDefaultTick,
    setAddressValue,
    addressValueLineLevel,
    setAddressValueLineLevel,
    editAddressModalIndex,
    addressUpdate,
    addressInsert,
    addressRemove
}) {
    const [country, setCountry] = useState([]);
    const [states, setStates] = useState([]);
    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });


    useEffect(() => {
        ApiService.get(`address/countries`).then(response => {
            console.log(response.data.documents);
            setCountry(response.data.documents);
        })

        ApiService.get(`address/states/India`).then(response => {
            console.log(response.data.documents);
            setStates(response.data.documents);
        })

        console.log(state);

        reset(state);
    }, [state])


    // Use field array 

    const handleAddressAppend = () => {
        const data = getValues();
        console.log(data)

        if (data.default) {
            const v = formatAddressNew(data)
            setAddressValue(v);
        }

        let arr = [];
        if (data.default) {
            if (isDefaultTick.length === 0) {
                setCheckDefault(true);
                setIsDefaultTickAdd(true)
            }
            isDefaultTick.map(e => {
                arr.push(true);
            })
            arr.push(!data.default);
            setIsDefaultTick(arr);
        } else {
            if (checkDefault) {
                let newArr = [...isDefaultTick];
                newArr.push(!data.default);
                setIsDefaultTick(newArr);
            } else {
                let newArr = [...isDefaultTick];
                newArr.push(isDefaultTickAdd);
                setIsDefaultTick(newArr);
            }
        }

        const addressArr = [...addressValueLineLevel];
        const formatAddressLineLevel = formatAddressNew(data)
        addressArr.push(formatAddressLineLevel);
        setAddressValueLineLevel(addressArr);

        addressAppend(data);
        handleShow(false);
        reset({});
    }


    const handleAddressUpdate = () => {
        const data = getValues();
        console.log(data)

        if (data.default) {
            const v = formatAddressNew(data)
            setAddressValue(v);
        }

        let addressArr = [...addressValueLineLevel];
        const formatAddressLineLevel = formatAddressNew(data);
        addressArr[editAddressModalIndex] = formatAddressLineLevel;
        setAddressValueLineLevel(addressArr);

        console.log(editAddressModalIndex);
        addressInsert(editAddressModalIndex, data);
        addressRemove(editAddressModalIndex + 1);
        handleShow(false);
        reset({});
    }

    return (
        <>
            <Modal show={show} onHide={() => handleShow(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Address</Modal.Title>
                </Modal.Header>
                <Form >
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Form.Group style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Form.Check
                                        // label="Billing"
                                        type="checkbox"
                                        id="billing"
                                        name="billing"
                                        {...register(`billing`)} />
                                    <Form.Label style={{ marginLeft: '1rem' }}>Billing</Form.Label>
                                </Form.Group>
                                <Form.Group style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Form.Check
                                        // label="Shipping"
                                        type="checkbox"
                                        id="shipping"
                                        name="shipping"
                                        {...register(`shipping`)}
                                    />
                                    <Form.Label style={{ marginLeft: '1rem' }}>Shipping</Form.Label>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Country</Form.Label>
                                    <Form.Select id="country" name="country" defaultValue='India' {...register("country", { required: true })} data-live-search="true"
                                        onChange={async (e) => {
                                            console.log(e.target.value);

                                            ApiService.get(`address/states/${e.target.value}`).then(response => {
                                                console.log(response.data.documents);
                                                setStates(response.data.documents);
                                            })

                                        }}>
                                        <option value={null}>Choose..</option>
                                        {country.map((element, index) => {
                                            return <option value={element.name} key={index}>{element.name}</option>
                                        })}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>State</Form.Label>
                                    <Form.Select id="state" name="state" defaultValue='West Bengal' {...register("state", { required: true })} data-live-search="true">
                                        <option value={null}>Choose..</option>
                                        {states.map((element, index) => {
                                            return <option value={element.name} key={index}>{element.name}</option>
                                        })}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="city"
                                        name="city"
                                        {...register(`city`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Zip</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="zip"
                                        name="zip"
                                        {...register(`zip`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="phone"
                                        name="phone"
                                        {...register(`phone`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Form.Check
                                        // label="Default"
                                        type="checkbox"
                                        id="default"
                                        name="default"
                                        disabled={checkDefault}
                                        {...register(`default`)}
                                    // onBlur={e => {
                                    //     console.log(e.target.checked);
                                    //     if (e.target.checked) {
                                    //         setCheckDefault(true);
                                    //     }
                                    // }}
                                    />
                                    <Form.Label style={{ marginLeft: '1rem' }}>Default</Form.Label>
                                </Form.Group>
                                <Form.Group style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Form.Check
                                        // label="Return"
                                        type="checkbox"
                                        id="return"
                                        name="return"
                                        {...register(`return`)}
                                    />
                                    <Form.Label style={{ marginLeft: '1rem' }}>Return</Form.Label>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Addressee</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="addressee"
                                        name="addressee"
                                        {...register(`addressee`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Address 1</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="address1"
                                        name="address1"
                                        {...register(`address1`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Address 2</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="address2"
                                        name="address2"
                                        {...register(`address2`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Address 3</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="address3"
                                        name="address3"
                                        {...register(`address3`)}
                                    // onBlur={() => {
                                    //     const values = getValues();
                                    //     const v = formatAddress(values)
                                    //     setValue("address", v);
                                    // }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size='sm' onClick={() => handleShow(false)}>
                            Cancel
                        </Button>
                        {isEditMode ? <Button onClick={handleAddressUpdate} size='sm' variant="primary">
                            Update
                        </Button> : <Button onClick={handleAddressAppend} size='sm' variant="primary">
                            Add
                        </Button>}
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}



