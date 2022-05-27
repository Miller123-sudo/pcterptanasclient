
import axios from 'axios';
import { React, useState, useEffect } from 'react';
import { Form, Col, OverlayTrigger, Popover } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Controller } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';


export default function SelectField({ control, field, errors, queryPath, index, multiple, changeHandler, blurHandler }) {
    const [state, setState] = useState([]);

    const getList = async () => {
        ApiService.setHeader();
        const response = await ApiService.get(`/${field?.selectRecordType}/list`);
        console.log(response.data.documents);
        setState(response.data.documents)
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
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Typeahead key={index} size='sm' className='is-invalid' style={{ maxWidth: '400px' }}
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
                    selected={value}
                    flip={true}

                />)}
        />
        {errors[field?.fieldId] &&
            <Form.Text className="" style={{ color: '#dc3545' }}>
                {errors[field?.fieldId] && errors[field.fieldId]['message']}
            </Form.Text>
        }

    </Form.Group>;
}
