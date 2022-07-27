import React from 'react';
import { Form } from 'react-bootstrap';

export default function LineDecimal128Field({ model, field, errors, index, register, blurHandler, changeHandler }) {

    return (
        <Form.Control size='sm'
            disabled={field?.disabled}
            required={field?.require}
            type="number"
            step="0.001"
            id={field.fieldId}
            name={field.fieldId}
            isInvalid={false}
            {...register(`${model}.${index}.${field.fieldId}`,
                {
                    required: field.validationProps?.require[0] ? field.validationProps?.require[1] : false,
                    onBlur: (event) => blurHandler && blurHandler(event, { type: field.type, id: field.fieldId, value: event.target?.value, index: index }),
                    onChange: (event) => changeHandler && changeHandler(event, { type: field.type, id: field.fieldId, value: event.target?.value, index: index })
                })}
        />
    )
}
