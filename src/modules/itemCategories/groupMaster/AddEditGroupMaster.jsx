import React, { useState, useEffect } from 'react'
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useForm, Controller } from 'react-hook-form';
import ApiService from '../../../helpers/ApiServices';


const animatedComponents = makeAnimated();

export const AddEditGroupMaster = () => {
    // const history = useNavigate();
    const history = useHistory();

    const { id } = useParams();
    const { control, register, handleSubmit, reset } = useForm()
    const isAddMode = !id;

    const [productMasterList, setProductMasterList] = useState([])
    const [selectOptions, setSelectOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [editModeData, seteditModeData] = useState([]);

    const onSubmit = (data) => {
        let newData = { ...data }
        newData['schemaId'] = 'groupMaster';
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
        await ApiService.get('/itemCategory/search?type=productMaster')
            .then(async response => {
                if (response.data.isSuccess) {
                    setProductMasterList(value => response.data.document)
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
            <Card className="p-0 m-0" style={{ margin: 0 }} className="card">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Card.Title className="title">Group Master</Card.Title>
                    <Card.Body>
                        <Row>
                            <Form.Group className="mb-3" as={Col}>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" id="name" name="name" {...register("name")} required />
                            </Form.Group>
                            {productMasterList && selectOptions && <Form.Group className="mb-3" as={Col}>
                                <Form.Label>Product Master</Form.Label>
                                {/* <Controller
                                    name="parent"
                                    control={control}

                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <Select
                                            id="parent"
                                            labelKey='name'
                                            isMulti
                                            closeMenuOnSelect={false}
                                            onChange={onChange}
                                            options={selectOptions}
                                            placeholder="Select..."
                                            selected={value}
                                        />)}
                                />; */}
                                <Select id="parent" name="parent"
                                    options={selectOptions}
                                    value={editModeData.parent && editModeData.parent.map((value) => (
                                        selectOptions[selectOptions.findIndex(element => element.value === value)]
                                    ))}

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
