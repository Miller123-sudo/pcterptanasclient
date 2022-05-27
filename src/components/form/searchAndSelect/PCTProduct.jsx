import { React, useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Controller } from 'react-hook-form';
import ApiService from '../../../helpers/ApiServices';

export default function PCTProduct({ control, name, multiple, onBlur, disabled }) {
    const [state, setState] = useState([]);

    useEffect(() => {
        async function getState() {
            const response = await ApiService.get('product/list');
            console.log(response)
            setState(response.data.documents)
        }

        getState();
    }, []);

    return <Controller
        name={name}
        control={control}

        render={({ field: { onChange, value }, fieldState: { error } }) => (

            < Typeahead style={{ width: "100%" }} size='sm'
                id={name}
                labelKey='name'
                multiple={multiple}
                disabled={disabled}
                onChange={onChange}
                // onBlur={onBlur ? onBlur(value) : null}
                onBlur={onBlur}
                options={state}
                placeholder="Select..."
                selected={value}
            />)
        }
    />;
}
