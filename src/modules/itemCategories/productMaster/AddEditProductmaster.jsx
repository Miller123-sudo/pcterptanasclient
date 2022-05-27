import React, { useEffect } from 'react'
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { useForm } from 'react-hook-form';
import './style.css';
import ApiService from '../../../helpers/ApiServices';

export const AddEditProductmaster = () => {
    // const history = useNavigate();
    const history = useHistory();
    const { id } = useParams();
    const { register, handleSubmit, reset } = useForm()
    const isAddMode = !id;

    const onSubmit = (data) => {
        let newData = { ...data }
        newData['schemaId'] = 'productMaster';
        isAddMode ? createRecord(newData) : updateRecord(newData)
    }

    const createRecord = async (data) => {
        await ApiService.post('/itemCategory', data).then(res => {
            history.push('/purchase/orders')
        }).catch(err => console.log(err))
    }

    const updateRecord = async (data) => {
        await ApiService.patch(`/itemCategory/${id}`, data).then(res => {
            history.push('/purchase/orders')
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        if (!isAddMode) {
            const getProductMaster = async () => {
                await ApiService.get(`/itemCategory/${id}`).then(response => {
                    reset(response.data.document)
                }).catch(err => console.log(err))
            }
            getProductMaster()
        }

    }, [id, isAddMode, reset])

    return (
        <div>
            <Card className="card">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Card.Title className="title">Product Master</Card.Title>
                    <Card.Body>
                        <Row>
                            <Form.Group className="mb-3" as={Col}>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" id="name" name="name" {...register("name")} required />
                            </Form.Group>
                        </Row>
                    </Card.Body>
                    <Card.Footer><Button type="submit" className="btn btn-sm">Save</Button></Card.Footer>
                </Form>
            </Card>
        </div>
    )
}
