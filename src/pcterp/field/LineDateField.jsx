import React from 'react';
import { Form } from 'react-bootstrap';

export default function LineDateField({ model, field, index, register, changeHandler, blurHandler }) {

    return (
        <Form.Control size='sm'
            defaultValue={new Date().toISOString().split("T")[0]}
            type="date"
            id={field.fieldId}
            name={field.fieldId}
            {...register(`${model}.${index}.${field.fieldId}`,
                {
                    onBlur: (event) => blurHandler && blurHandler(event, { type: field.type, id: field.fieldId, value: event.target?.value, index: index }),
                    onChange: (event) => changeHandler && changeHandler(event, { type: field.type, id: field.fieldId, value: event.target?.value, index: index })
                })}
        />
    )
}
