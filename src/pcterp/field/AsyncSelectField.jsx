
import axios from 'axios';
import { React, useState, useEffect, Fragment } from 'react';
import { Form, Col, OverlayTrigger, Popover } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { Controller } from 'react-hook-form';
import ApiService from '../../helpers/ApiServices';


export default function AsyncSelectField({ control, field, errors, queryPath, index, multiple, changeHandler, blurHandler }) {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);

    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBy = () => true;

    const handleSearch = (query) => {
        setIsLoading(true);
        const SEARCH_URI = 'https://api.github.com/search/users';
        fetch(`${SEARCH_URI}?q=${query}+in:login&page=1&per_page=50`)
            .then((resp) => resp.json())
            .then(({ items }) => {
                console.log(items)
                const options = items.map((i) => ({
                    avatar_url: i.avatar_url,
                    id: i.id,
                    login: i.login,
                }));

                setOptions(options);
                setIsLoading(false);
            });
    };

    const getList = async () => {
        ApiService.setHeader();
        const response = await ApiService.get(`/${field?.selectRecordType}/list`);
        setOptions(response.data.documents)
    }

    useEffect(() => {
        if (field.selectRecordType) {
            //getList();
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
                <AsyncTypeahead key={index} size='sm' className='is-invalid' style={{ maxWidth: '400px' }}
                    filterBy={filterBy}
                    isLoading={isLoading}
                    minLength={2}
                    onSearch={handleSearch}
                    isInvalid={errors[field?.fieldId]}
                    labelKey="login"
                    multiple={field?.multiple}
                    onChange={(event) => {
                        onChange(event);
                        if (changeHandler) changeHandler(event, { type: field.type, id: field.fieldId, value: event.length > 0 ? event[0] : event })
                    }}
                    onBlur={(event) =>
                        blurHandler && blurHandler(event, { type: field.type, id: field.fieldId, value: value, targetValue: event.target?.value })
                    }
                    options={options}
                    placeholder={field.placeholder}
                    selected={value}
                    flip={true}
                    renderMenuItemChildren={(option, props) => (
                        <Fragment>
                            <img
                                alt={option.login}
                                src={option.avatar_url}
                                style={{
                                    height: '24px',
                                    marginRight: '10px',
                                    width: '24px',
                                }}
                            />
                            <span>{option.login}</span>
                        </Fragment>
                    )}

                />)}
        />
        {errors[field?.fieldId] &&
            <Form.Text className="" style={{ color: '#dc3545' }}>
                {errors[field?.fieldId] && errors[field.fieldId]['message']}
            </Form.Text>
        }

    </Form.Group>;
}
