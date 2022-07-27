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

    const roundOff = 5;
    class TanasUtils {

        /**
         * This method is use to find the Price of each size in a pack.
         * 
         * @param {Number} min Minimum size in the pack
         * @param {*} max Maximum size in the pack.
         * @param {Number} basePrice Base Price
         * @param {Number} expense Expense
         * @param {Number} transportChargePer Transportation charge in number. eg. 8% is 8, 40% is 40
         * @param {Number} profitPer Profit Percentage in number. eg. 45% is 45, 75% is 75.
         * @param {Number} gst GST Percentage in number
         * @returns Object
         */
        calculatePrice(min, max, basePrice, expense, transportChargePer, profitPer, gst) {
            let arrayOfSize = new Array();

            const priceFactor = this.findPriceFactor(basePrice);
            const result = this.findMedian(min, max);

            if (result.median) {
                for (var i = min; i <= max; i += 2) {

                    let totalPrice = ((basePrice + (i - result.median) * (priceFactor) / 2) + expense);
                    //console.log(i, (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / 5)) * 5)
                    const eachSize = {
                        size: i,
                        price: (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / roundOff)) * roundOff
                    }

                    arrayOfSize.push(eachSize);
                }
                return arrayOfSize;
            } else {
                return "Something went wrong, please check the size you have provided!"
            }
        }


        /**
         * This method is use to find the median(the middle value) in a list ordered from smallest to largest.
         * 
         * @param {Number} min - Minimun size in the pack.
         * @param {Number} max - Maximum size in the pack.
         * @returns Object
         */
        findMedian(min, max) {
            let sumOfSize = (min + max) / 2;
            return { median: sumOfSize }
        }

        isOddNumberOfSize(min, max) {
            let sumOfSize = (min + max) / 2;
            if (sumOfSize % 2 == 0)
                return { isOdd: true, median: sumOfSize };
            else return { isOdd: false, median: sumOfSize };
        }


        /**
         * This method is use to find the price factor
         * Rules
         * price: 1 - 25 return 1
         * price: 26 - 50 return 2
         * price: 51 - 75 return 3
         * ..
         * ..
         * price: 501 - 525 return 21
         * @param {Number} price - Base price of the product.
         * @returns Number
         */
        findPriceFactor(price) {
            let result = price / 25;
            return Math.ceil(result);
        }
    }

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
                                        onBlur={(e) => {
                                            if (e.target.value) {
                                                const tanasUtil = new TanasUtils();
                                                const rangeArray = tanasUtil.calculatePrice(parseInt(1), parseInt(1), parseInt(getValues("cost")), parseInt(getValues("expence")), parseInt(getValues("transport")), parseInt(getValues("profit")), parseInt(getValues("gst")))
                                                console.log(rangeArray);

                                                const obj = new Object()
                                                obj.MRP = rangeArray[0].price
                                                obj.costPrice = getValues("cost")

                                                setValue("mrp", rangeArray[0].price)
                                            }
                                        }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>MRP</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="mrp"
                                        name="mrp"
                                        {...register(`mrp`)}
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
                        {isEditMode ? <Button onClick={null} size='sm' variant="primary">
                            Update
                        </Button> : <Button size='sm' variant="primary" onClick={() => {
                            // setCalObj(getValues())
                            setCalObj({ MRP: getValues("mrp"), costPrice: getValues("cost") })
                            setValue("cost", "")
                            setValue("expence", "")
                            setValue("transport", "")
                            setValue("profit", "")
                            setValue("gst", "")
                            setValue("mrp", "")
                        }}
                        >
                            Add
                        </Button>}
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}



