
import axios from 'axios';
import { React, useState, useEffect } from 'react';
import { Form, Col, OverlayTrigger, Popover } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Controller } from 'react-hook-form';
import { array } from 'yup/lib/locale';
import ApiService from '../../helpers/ApiServices';


export default function SelectField({ control, field, errors, queryPath, index, multiple, changeHandler, blurHandler }) {
    const [state, setState] = useState([]);



    const getList = async () => {
        let array = new Array()
        ApiService.setHeader();
        // if (field?.selectRecordType == "productType") {
        //     setState(productTypeArray)
        // } else {
        const response = await ApiService.get(`/${field?.selectRecordType}/list`);
        if (response.data.isSuccess) {
            console.log(response.data?.documents);

            if (field?.selectRecordType == "newBill/getunusedBill") {
                response?.data?.documents.map(e => {
                    console.log(e);
                    let obj = new Object()
                    obj = e
                    obj.vendorName = e?.vendorArray ? e?.vendorArray[0]?.name : ""
                    array.push(obj)
                })
                setState(array)
            } else {
                setState(response.data?.documents)
            }
        }

        // if (array.length == response?.data?.documents.length)
        // }
    }

    useEffect(() => {
        if (field.selectRecordType) {
            getList();
        }
    }, []);

    return <Form.Group key={index} as={Col} md="4" className="mb-2">
        <OverlayTrigger trigger="click" rootClose placement="auto" overlay={<Popover id="popover-basic">
            <Popover.Header as="h3">Field Description</Popover.Header>
            <Popover.Body>
                {field?.description ? field?.description : "No description found!"}
            </Popover.Body>
        </Popover>}>
            <Form.Label className="m-0">{field?.label}</Form.Label>
        </OverlayTrigger>

        <Controller
            name={field?.fieldId}
            control={control}
            rules={{ required: field?.required ? field?.validationMessage : false }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                if (field?.default) {
                    console.log([state[1]]);
                }
                console.log(error);
                return (
                    <Typeahead id={index} size='sm' className='is-invalid' style={{ maxWidth: '400px' }}
                        isInvalid={errors[field?.fieldId]}
                        disabled={field?.disabled}
                        // labelKey="name"
                        labelKey={option => `${option?.name} ${option.vendorName}`}// If we write lableKey this way then we can search results by multiple lablekey
                        multiple={field?.multiple}
                        onChange={(event) => {
                            onChange(event);
                            if (changeHandler) changeHandler(event, { type: field.type, id: field.fieldId, value: event.length > 0 ? event[0] : event })
                        }}
                        onBlur={(event) =>
                            blurHandler && blurHandler(event, { type: field.type, id: field.fieldId, value: value, targetValue: event.target?.value })
                        }
                        options={state}
                        placeholder={field.placeholder}
                        // selected={field?.default ? [state[1]] : value}
                        selected={value}
                        flip={true}
                        clearButton
                        renderMenuItemChildren={(option) => {
                            if (option.name.split("/")[0] == "BILL") {
                                return (
                                    <div>
                                        <span>{option.name}</span><span> ( <small><b>Ref No.</b></small> {option?.referenceNumber})</span>
                                        <div>
                                            <small><b>Vendor:</b> {(option?.vendorArray[0]?.name)} </small><br />
                                            <small><b>Total:</b> {(option?.estimation.total).toFixed(2)}</small>
                                        </div>
                                    </div>
                                )
                            } else {
                                return (<div>{option.name}</div>)
                            }
                        }}

                    />
                )
            }
            }
        />
        {errors[field?.fieldId] &&
            <Form.Text className="" style={{ color: '#dc3545' }}>
                {errors[field?.fieldId] && errors[field.fieldId]['message']}
            </Form.Text>
        }

    </Form.Group>;
}
