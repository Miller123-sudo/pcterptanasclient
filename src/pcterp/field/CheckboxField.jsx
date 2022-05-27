import React from 'react';
import { Form, Col } from 'react-bootstrap';

export default function CheckboxField({ field, index, register, errors, lineModelName, changeHandler, blurHandler }) {
    console.log("Key", index);
    return (
        <Form.Group key={index} as={Col} md="4" className="mb-2">
            <Form.Label className="m-0">{" "}</Form.Label>
            <Form.Check size='sm' style={{ maxWidth: '400px' }}
                type="checkbox"
                label={field?.label}
                id={field?.fieldId}
                name={field?.fieldId}

                feedback={errors[field?.fieldId] && errors[field.fieldId]['message']}
                feedbackType="invalid"
                isInvalid={errors[field?.fieldId]}
                placeholder={field.placeholder}
                {...register(
                    lineModelName ? `${lineModelName}.${index}.${field?.fieldId}` : field?.fieldId,
                    {
                        required: field?.required ? field?.validationMessage : false,
                        onBlur: (event) => blurHandler && blurHandler(event, { type: field.type, id: field.fieldId, value: event.target?.checked }),
                        onChange: (event) => changeHandler && changeHandler(event, { type: field.type, id: field.fieldId, value: event.target?.value })
                    })}
            />


        </Form.Group>
    )
}
