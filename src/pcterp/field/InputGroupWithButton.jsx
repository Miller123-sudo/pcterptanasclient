
import axios from 'axios';
import { React, useState, useEffect } from 'react';
import { Form, Col, OverlayTrigger, Popover, InputGroup, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BiEditAlt } from "react-icons/bi";
import { Controller } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';
import { useLocation, useNavigate } from 'react-router-dom';


export default function InputGroupWithButton({ control, field, errors, queryPath, index, multiple, changeHandler, blurHandler }) {
    const [state, setState] = useState([]);
    const navigate = useNavigate()
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];


    const getList = async () => {
        ApiService.setHeader();
        // if (field?.selectRecordType == "productType") {
        //     setState(productTypeArray)
        // } else {
        const response = await ApiService.get(`/${field?.selectRecordType}/list`);
        console.log(response.data.documents);
        setState(response.data.documents)
        // }
    }

    useEffect(() => {
        if (field?.selectRecordType) {
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
                    <InputGroup style={{ maxWidth: '400px' }}>
                        <Typeahead key={index} size='sm' className='is-invalid'
                            isInvalid={errors[field?.fieldId]}
                            disabled={field?.disabled}
                            labelKey="name"
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
                                                <small><b>Total:</b> {(option?.estimation.total).toFixed(2)}</small>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    return (<div>{option.name}</div>)
                                }
                            }}

                        />
                        {
                            field?.isVisible && <Button size="sm"><BiEditAlt style={{ marginLeft: 3, marginTop: 0 }}
                                onClick={() => {
                                    navigate(`/${rootPath}/${field?.createRecordType && field?.createRecordType}/add`)
                                }} /></Button>
                        }
                    </InputGroup>
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
