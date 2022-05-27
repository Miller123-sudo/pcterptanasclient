
import axios from 'axios';
import { React, useState, useEffect } from 'react';
import { Form, Col } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Controller } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';


export default function LineSelectField({ model, control, field, index, blurHandler, changeHandler }) {
    const [state, setState] = useState([{ id: 0, name: "Rehan Nawaz" }]);

    useEffect(() => {
        const getList = async () => {
            const response = await ApiService.get(`/${field?.selectRecordType}/list`);
            console.log(response.data.documents)
            setState(response.data.documents)
        }


        if (field.selectRecordType) {
            getList();
        }
    }, []);


    return (<Controller key={index}
        name={`${model}.${index}.${field?.fieldId}`}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Typeahead key={index} size='sm'
                id={`${model}.${index}.${field?.fieldId}`}
                disabled={field?.disabled}
                labelKey="name"
                multiple={field?.multiple}
                onChange={(event) => {
                    onChange(event);
                    if (changeHandler) changeHandler(event, { type: field.type, id: field.fieldId, value: event.length > 0 ? event[0] : event, index: index });
                }}
                options={state}
                onBlur={(event) => blurHandler && blurHandler(event, { type: field.type, okay: value, id: field?.fieldId, value: event.target?.value, index: index })}
                //onBlur={blurHandler}
                placeholder={field.placeholder}
                selected={value}
                positionFixed={true}
                flip={true}

            />)}
    />);
}
