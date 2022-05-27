import { React, useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Controller } from 'react-hook-form';
import ApiService from '../../../helpers/ApiServices';

export default function PCTEmployee({ control, name, multiple, onBlur }) {
    const [state, setState] = useState([]);

    useEffect(() => {
        async function getState() {
            const response = await ApiService.get('employee/list');
            setState(response.data.documents)
        }

        getState();
    }, []);

    return <Controller
        name={name}
        control={control}

        render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Typeahead size='sm'
                id={name}
                labelKey='name'
                multiple={multiple}
                onChange={onChange}
                onBlur={onBlur}
                options={state}
                placeholder="Select..."
                selected={value}
            />)}
    />;
}
