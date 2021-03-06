import { React, useState, useEffect } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tabs, Tab, Breadcrumb, Form, Card, Table } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage, formatAddressByDefault, formatAddress, formatAddr } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import LogHistories from '../../pcterp/components/LogHistories'
import NumberField from '../../pcterp/field/NumberField'
import EmailField from '../../pcterp/field/EmailField'
import SelectField from '../../pcterp/field/SelectField'
import TextArea from '../../pcterp/field/TextArea'
import TextField from '../../pcterp/field/TextField'
import AppLoader from '../../pcterp/components/AppLoader'
import Address from '../../pcterp/components/Address'
import { BsBoxArrowInUpRight, BsTrash } from 'react-icons/bs'
import CheckboxField from '../../pcterp/field/CheckboxField'

export default function Vendor() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setState] = useState(null)
    const [tabKey, setTabKey] = useState('address');
    const [checkDefault, setCheckDefault] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [checkDefaultArr, setCheckDefaultArr] = useState([]);
    const [isDefaultTick, setIsDefaultTick] = useState([]);
    const [addressValue, setAddressValue] = useState('');
    const [addressValueLineLevel, setAddressValueLineLevel] = useState([]);
    const [editAddressModalState, setEditAddressModalState] = useState({});
    const [editAddressModalIndex, setEditAddressModalIndex] = useState();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDefaultTickAdd, setIsDefaultTickAdd] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1]; // path of the module
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            perPcsLess: 0,
            perMeterLess: 0,
            boxLess: 0,
            discountPercentLess: 0,
        }
    });
    const { append: addressAppend, remove: addressRemove, fields: addressFields, update: addressUpdate, insert: addressInsert } = useFieldArray({ control, name: "addresses" });



    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        let address = formatAddr(formData)
        formData.address = address

        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/vendor', data).then(response => {
            if (response.data.isSuccess) {
                if (rootPath == "accounting") {
                    navigate(`/${rootPath}/bills/add`)
                } else {
                    navigate(`/${rootPath}/vendors/list`)
                }
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/vendor/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/vendors/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/vendor/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/vendors/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/vendor/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            if (document.date) {
                setValue('date', document?.date.split("T")[0])
            }

            setLoderStatus("SUCCESS");
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const handleShow = (value) => {
        setShowAddressModal(value);

        if (isDefaultTick.length > 1) {
            let flag = true;
            isDefaultTick.map(e => {
                if (e) {
                    flag = false;
                    setCheckDefault(true);
                }
            })

            if (flag) {
                setCheckDefault(false)
            }
        }
    }


    useEffect(() => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()
        }

        ApiService.get(`address/countries`).then(response => {
            console.log(response.data.documents)
        })

    }, []);

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Container fluid>
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/vendors/list` }}>   <div className='breadcrum-label'>VENDORS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={rootPath == "accounting" ? `/${rootPath}/bills/add` : `/${rootPath}/vendors/list`} variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>


            </AppContentHeader>
            <AppContentBody>
                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Name of the sipplier.",
                                label: "Name",
                                fieldId: "name",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: ".",
                                label: "Phone",
                                fieldId: "phone",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <EmailField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Email",
                                fieldId: "email",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "GSTIN",
                                fieldId: "gstin",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "MARKET",
                                fieldId: "market",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "AGENT",
                                fieldId: "agent",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "DISCOUNT % LESS",
                                fieldId: "discountPercentLess",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                if (!e.target.value) {
                                    setValue("discountPercentLess", 0)
                                }
                            }}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "BOX LESS",
                                fieldId: "boxLess",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                if (!e.target.value) {
                                    setValue("boxLess", 0)
                                }
                            }}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "PER PCS LESS",
                                fieldId: "perPcsLess",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                if (!e.target.value) {
                                    setValue("perPcsLess", 0)
                                }
                            }}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "PER METER LESS",
                                fieldId: "perMeterLess",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => {
                                if (!e.target.value) {
                                    setValue("perMeterLess", 0)
                                }
                            }}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "BANK NAME",
                                fieldId: "bankName",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "BANK BRANCH",
                                fieldId: "bankBranch",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "BANK ACCOUNT NUMBER",
                                fieldId: "bankAccountNumber",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "IFCI",
                                fieldId: "ifci",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "CITY",
                                fieldId: "city",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <CheckboxField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "IS LOCAL",
                                fieldId: "isLocal",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Address",
                                label: "Address",
                                fieldId: "address",
                                value: addressValue,
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        {/* <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Permissions",
                                label: "Permissions",
                                fieldId: "permissions",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "permission",
                                multiple: true
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        /> */}




                    </Row>
                </Container>

                {/* SUBTABS */}
                <Tabs defaultActiveKey='address'>
                    <Tab eventKey="address" title="Address">
                        <Card style={{ width: '100%', marginLeft: -2 }}>
                            <Card.Header>Address</Card.Header>
                            <Card.Body className="card-scroll">
                                <Table responsive striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "1rem" }}>Edit</th>
                                            <th style={{ minWidth: "0.5rem" }}>#</th>
                                            <th style={{ minWidth: "1rem" }}>Billing</th>
                                            <th style={{ minWidth: "1rem" }}>Shipping</th>
                                            <th style={{ minWidth: "1rem" }}>Default</th>
                                            <th style={{ minWidth: "1rem" }}>Return</th>
                                            <th style={{ minWidth: "16rem" }}>Address</th>
                                            {/* <th style={{ minWidth: "16rem" }}>Country</th>
                                                        <th style={{ minWidth: "16rem" }}>Addressee</th>
                                                        <th style={{ minWidth: "16rem" }}>Phone</th>
                                                        <th style={{ minWidth: "16rem" }}>Address1</th>
                                                        <th style={{ minWidth: "16rem" }}>Address2</th>
                                                        <th style={{ minWidth: "16rem" }}>Address3</th>
                                                        <th style={{ minWidth: "16rem" }}>City</th>
                                                        <th style={{ minWidth: "16rem" }}>State</th>
                                                        <th style={{ minWidth: "16rem" }}>Zip</th> */}
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {addressFields.map((field, index) => {
                                            return (
                                                <tr key={field.id} >
                                                    <td>
                                                        <Button style={{ minWidth: "4rem" }} size="sm" onClick={e => {
                                                            handleShow(true);
                                                            console.log(field)
                                                            setIsEditMode(true);
                                                            setEditAddressModalState(field);
                                                            setEditAddressModalIndex(index);
                                                        }}><BsBoxArrowInUpRight /></Button>
                                                    </td>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <Form.Group >
                                                            <Form.Check
                                                                label=''
                                                                type="checkbox"
                                                                id="billing"
                                                                name="billing"
                                                                {...register(`addresses.${index}.billing`)} />
                                                        </Form.Group>
                                                    </td>
                                                    <td>
                                                        <Form.Group >
                                                            <Form.Check
                                                                label=''
                                                                type="checkbox"
                                                                id="shipping"
                                                                name="shipping"
                                                                {...register(`addresses.${index}.shipping`)}
                                                            />
                                                        </Form.Group>
                                                    </td>
                                                    <td>
                                                        <Form.Group >
                                                            <Form.Check
                                                                label=''
                                                                type="checkbox"
                                                                id="default"
                                                                name="default"
                                                                // disabled={!checkDefaultArr[index]}
                                                                disabled={isDefaultTick[index]}
                                                                {...register(`addresses.${index}.default`)}
                                                                onChange={e => {
                                                                    console.log(e.target.checked);
                                                                    setCheckDefault(e.target.checked)
                                                                    const currentValue = e.target.checked;
                                                                    setValue(`addresses.${index}.default`, currentValue);
                                                                    const values = getValues();

                                                                    const v = formatAddressByDefault(values);
                                                                    console.log(v)
                                                                    setAddressValue(v);

                                                                    let shippingArr = [];
                                                                    for (var i = 0; i < values.addresses.length; i++) {
                                                                        if (i === index) {
                                                                            currentValue ? shippingArr[i] = !currentValue : shippingArr[i] = currentValue;
                                                                            setIsDefaultTickAdd(currentValue);
                                                                        } else {
                                                                            shippingArr[i] = currentValue;
                                                                        }
                                                                    }
                                                                    console.log(shippingArr);
                                                                    setIsDefaultTick(shippingArr);
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </td>
                                                    <td>
                                                        <Form.Group >
                                                            <Form.Check
                                                                label=''
                                                                type="checkbox"
                                                                id="return"
                                                                name="return"
                                                                {...register(`addresses.${index}.return`)}
                                                            />
                                                        </Form.Group>
                                                    </td>
                                                    <td>
                                                        <Form.Group>
                                                            <Form.Control
                                                                type="text"
                                                                id="address"
                                                                name="address"
                                                                disabled
                                                                defaultValue={addressValueLineLevel[index]}
                                                                value={addressValueLineLevel[index]}
                                                                {...register(`addresses.${index}.address`)}
                                                                onBlur={() => {
                                                                    const values = getValues();
                                                                    const v = formatAddress(values)
                                                                    setValue("address", v);
                                                                }}
                                                            >
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </td>
                                                    {/* <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="country"
                                                                            name="country"
                                                                            {...register(`addresses.${index}.country`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="addressee"
                                                                            name="addressee"
                                                                            {...register(`addresses.${index}.addressee`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="number"
                                                                            id="phone"
                                                                            name="phone"
                                                                            {...register(`addresses.${index}.phone`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="address1"
                                                                            name="address1"
                                                                            {...register(`addresses.${index}.address1`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="address2"
                                                                            name="address2"
                                                                            {...register(`addresses.${index}.address2`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="address3"
                                                                            name="address3"
                                                                            {...register(`addresses.${index}.address3`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="city"
                                                                            name="city"
                                                                            {...register(`addresses.${index}.city`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group>
                                                                        <Form.Control
                                                                            type="text"
                                                                            id="state"
                                                                            name="state"
                                                                            {...register(`addresses.${index}.state`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        >
                                                                        </Form.Control>
                                                                    </Form.Group>
                                                                </td>
                                                                <td>
                                                                    <Form.Group >
                                                                        <Form.Control
                                                                            type="number"
                                                                            id="zip"
                                                                            name="zip"
                                                                            {...register(`addresses.${index}.zip`)}
                                                                            onBlur={() => {
                                                                                const values = getValues();
                                                                                const v = formatAddress(values)
                                                                                setValue("address", v);
                                                                            }}
                                                                        />
                                                                    </Form.Group>
                                                                </td> */}
                                                    <td>
                                                        <Button size="sm" variant="danger"
                                                            onClick={() => {
                                                                let arr = [];
                                                                if (!isDefaultTick[index]) {
                                                                    isDefaultTick.splice(index, 1);
                                                                    setIsDefaultTickAdd(false);
                                                                    setCheckDefault(false)
                                                                    isDefaultTick.map(e => {
                                                                        arr.push(false);
                                                                    })
                                                                    setIsDefaultTick(arr);
                                                                } else {
                                                                    isDefaultTick.splice(index, 1);
                                                                }

                                                                addressRemove(index);

                                                                const values = getValues();
                                                                const v = formatAddressByDefault(values);
                                                                console.log(v)
                                                                setAddressValue(v);
                                                            }}
                                                        ><BsTrash /></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        <tr>
                                            <td colSpan="14">
                                                {/* <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => addressAppend({ billing: false, shipping: false, label: '', country: '', state: '', zip: "" })} >Add a Address</Button> */}
                                                <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => {
                                                    handleShow(true);
                                                    setIsEditMode(false);
                                                    console.log(checkDefault);
                                                    setEditAddressModalState([])
                                                }} >Add a Address</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab>
                    {!isAddMode && <Tab eventKey="auditTrail" title="Audit Trail">
                        <Container className="mt-2" fluid>
                            <Row>

                            </Row>
                            {/* {!isAddMode && <LogHistories documentPath={"vendor"} documentId={id} />} */}
                        </Container>
                    </Tab>}
                </Tabs>

                <Address
                    state={editAddressModalState}
                    isEditMode={isEditMode}
                    show={showAddressModal}
                    handleShow={(e) => handleShow(e)}
                    addressAppend={addressAppend}
                    checkDefault={checkDefault}
                    addressFields={addressFields}
                    isDefaultTick={isDefaultTick}
                    setIsDefaultTick={setIsDefaultTick}
                    isDefaultTickAdd={isDefaultTickAdd}
                    setIsDefaultTickAdd={setIsDefaultTickAdd}
                    setCheckDefault={setCheckDefault}
                    setAddressValue={setAddressValue}
                    addressValueLineLevel={addressValueLineLevel}
                    setAddressValueLineLevel={setAddressValueLineLevel}
                    editAddressModalIndex={editAddressModalIndex}
                    addressUpdate={addressUpdate}
                    addressInsert={addressInsert}
                    addressRemove={addressRemove}
                />

            </AppContentBody>
        </AppContentForm>
    )
}
