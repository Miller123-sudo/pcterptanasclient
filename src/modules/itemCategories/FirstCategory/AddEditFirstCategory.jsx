import React, { useState, useEffect } from 'react'
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useForm } from 'react-hook-form';
import ApiService from '../../../helpers/ApiServices';

const animatedComponents = makeAnimated();

export const AddEditFirstCategory = () => {
    // const history = useNavigate();
    const history = useHistory();

    const { id } = useParams();
    const { register, handleSubmit, reset } = useForm()
    const isAddMode = !id;

    const [brandList, setBrandList] = useState([])
    const [selectOptions, setSelectOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [editModeData, seteditModeData] = useState([]);

    const onSubmit = (data) => {
        let newData = { ...data }
        newData['schemaId'] = 'firstCategory';
        newData['parent'] = selectedOptions;
        isAddMode ? createRecord(newData) : updateRecord(newData)
    }

    const createRecord = async (data) => {
        await ApiService.get(`/itemCategory/search?type=${data.schemaId}&name=${data.name}`)
            .then(async firstResponse => {
                let responseData = firstResponse.data;
                if (responseData.isSuccess && responseData.results > 0) {
                    let filteredParent = [];
                    data.parent.map((parentValue) => {
                        if (!responseData.document[0].parent.includes(parentValue)) {
                            filteredParent.push(parentValue)
                        }
                    })

                    if (filteredParent.length > 0) {
                        await ApiService.patch(`itemCategory/${responseData.document[0].id}`, { parent: filteredParent })
                            .then(secondResponse => {
                                history.push('/purchase/orders')
                                console.log(secondResponse)
                            })
                    }
                }
                else {
                    await ApiService.post(`/itemCategory`, data).then(response => {
                    }).catch(err => console.log(err));
                }
                history.push('/purchase/orders')
            })
    }

    const updateRecord = async (data) => {
        await ApiService.patch(`/itemCategory/${id}`, data).then(async response => {
        }).catch(err => console.log(err))
    }

    useEffect(async () => {
        await ApiService.get('/itemCategory/search?type=brand')
            .then(async response => {
                if (response.data.isSuccess) {
                    setBrandList(value => response.data.document)
                    let options = []
                    await response.data.document.map((value) => {
                        let res = {}
                        res['value'] = value.id;
                        res['label'] = value.name;
                        options.push(res)
                        return null;
                    })
                    setSelectOptions(options)
                }
            })

        if (!isAddMode) {
            await ApiService.get(`/itemCategory/${id}`).then(async response => {
                seteditModeData(response.data.document)
                reset(response.data.document)
            }).catch(err => console.log(err))

        }
    }, [])

    return (
        <div>
            <Card className="card">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Card.Title className="title">Category 1</Card.Title>
                    <Card.Body>
                        <Row>
                            <Form.Group className="mb-3" as={Col}>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" id="name" name="name" {...register("name")} required />
                            </Form.Group>
                            {brandList && selectOptions && <Form.Group className="mb-3" as={Col}>
                                <Form.Label>Brand</Form.Label>
                                <Select id="parent" name="parent"
                                    options={selectOptions}
                                    value={editModeData.parent && editModeData.parent.map((value) => (
                                        selectOptions[selectOptions.findIndex(element => element.value === value)]
                                    ))}
                                    closeMenuOnSelect={false}
                                    isMulti
                                    components={animatedComponents}
                                    onChange={(selected) => {
                                        let parentArr = []
                                        selected.map((value) => {
                                            parentArr.push(value.value)
                                            return null;
                                        })
                                        setSelectedOptions(parentArr)
                                        !isAddMode && seteditModeData(parentArr)
                                    }}
                                />
                            </Form.Group>}
                        </Row>
                    </Card.Body>
                    <Card.Footer><Button type="submit" className="btn btn-sm">Save</Button></Card.Footer>
                </Form>
            </Card>
        </div>
    )
}
