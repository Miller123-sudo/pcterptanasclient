import { React, useState, useEffect, useContext } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Breadcrumb, Table, DropdownButton, Dropdown } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../helpers/ApiServices';
import { UserContext } from '../../components/states/contexts/UserContext';
import { errorMessage } from '../../helpers/Utils';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const schema = Yup.object().shape({
    password: Yup.string().required('Password is required'),
    passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

export default function ChangePassword() {
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const [state, setState] = useState({});
    const [employeeList, setEmployeeList] = useState([]);
    const [departmentList, setDepartmentList] = useState([])
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            supervisor: null,
            parentDepartment: null
        },
        resolver: yupResolver(schema),
    });

    const onSubmit = (formData) => {
        console.log(formData);
        return updateDocument(id, formData);
    }



    const updateDocument = async (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`employee/updateMyPassword`, data).then(async response => {
            console.log(response.data)
            if (response.data.isSuccess) {

                dispatch({ type: "LOGOUT_USER" });
                navigate("/");
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, dispatch)
        })

    }


    useEffect(() => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

    }, []);

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid >
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <h3>Change Password</h3>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">UPDATE PASSWORD</Button>{" "}
                            <Button as={Link} to={`/employees/employee/${id}`} variant="light" size="sm">DISCARD</Button>
                            {/* {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>} */}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid style={{ height: 200 }}>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Current Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="passwordCurrent"
                                    name="passwordCurrent"
                                    {...register("passwordCurrent")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">New Password</Form.Label>

                                <Form.Control
                                    type="password"
                                    id="password"
                                    name="password"
                                    {...register("password")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    {...register("passwordConfirm")}
                                />
                                <span style={{ color: 'red' }}>{errors.passwordConfirm?.message}</span>
                            </Form.Group>
                        </Row>
                    </Container>

                </Container>
            </Form>
        </Container>
    )
}
