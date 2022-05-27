import React from 'react';
import { Form } from 'react-bootstrap';

export default function LineCheckboxField({ model, field, index, register, blurHandler, changeHandler }) {

    return (
        <Form.Check size='sm'
            type="checkbox"
            id={field.fieldId}
            name={field.fieldId}
            {...register(`${model}.${index}.${field.fieldId}`,
                {
                    onBlur: (event) => blurHandler && blurHandler(event, { type: field.type, id: field.fieldId, value: event.target?.checked, index: index }),
                    onChange: (event) => changeHandler && changeHandler(event, { type: field.type, id: field.fieldId, value: event.target?.checked, index: index })
                })}
        />
    )
}
