
import { React, useState, useEffect } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Breadcrumb, Form } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import SelectField from '../../pcterp/field/SelectField'
import TextField from '../../pcterp/field/TextField'
import TextArea from '../../pcterp/field/TextArea'
import DateField from '../../pcterp/field/DateField'
import NumberField from '../../pcterp/field/NumberField'
import AppLoader from '../../pcterp/components/AppLoader'
import LogHistories from '../../pcterp/components/LogHistories'
import AppContentLine from '../../pcterp/builder/AppContentLine'
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import { PurchaseOrderPDF } from '../../helpers/PDF';
import Decimal128Field from '../../pcterp/field/Decimal128Field';
import swal from "sweetalert2"
var converter = require('number-to-words');

export default function BillPayment() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [frmData, setfrmData] = useState();
    const [vendor, setvendor] = useState();
    const [state, setState] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();

    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });



    // Functions

    const onSubmit = (formData) => {
        setfrmData(formData)
        return createDocument(formData)
    }

    const createDocument = async (data) => {
        console.log(state);
        data.status = "Posted"
        console.log(data);
        ApiService.setHeader();
        await ApiService.patch('/billPayment/updateBillPaymentAndBill/' + state.id, data).then(response => {
            if (response.data.isSuccess) {
                console.log(response.data);
                navigate(`/${rootPath}/billpayment`)
            }
        }).catch(e => {
            console.log(e);
        })

    }




    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/billPayment/${id}`).then(async response => {
            const document = response?.data.document;
            console.log(document)
            setState(document)
            reset(document);
            if (document.billDate) {
                setValue('billDate', document.billDate.split("T")[0])
            }

            setValue('paymentDate', document.paymentDate.split("T")[0]);

            const res = await ApiService.get("vendor/" + document?.bill?.vendor)
            if (res?.data.isSuccess) {
                console.log(res?.data.document)
                setvendor(res?.data.document)
            }

            setLoderStatus("SUCCESS");
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    const handleConfirmButton = async () => {
        console.log(state)
        try {
            const response = await ApiService.patch('newBill/' + state.id, { status: "Posted", referenceNumber: getValues('referenceNumber') });
            console.log(response)
            if (response.data.isSuccess) {
                const itemReceipt = response.data.document;
                setState(itemReceipt)
                reset(itemReceipt);
                if (itemReceipt.billDate) {
                    setValue('billDate', itemReceipt.billDate.split("T")[0]);
                }
            }
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        }
    }

    const handleRegisterPaymentButton = async () => {
        ApiService.setHeader();
        await ApiService.post("/billPayment", state).then((res) => {
            if (res.data.isSuccess) {
                console.log(res.data.document.id);
                navigate('/purchase/billpayment/' + res.data.document.id)
            }
        });
    }

    // handle Print
    const handlePrintOrder = async () => {
        PurchaseOrderPDF.generateBillPDF(state.id);
        return;
    }

    /** Print cheque function for single cheque payment. After printing cheque, bill's status will be set to "Paid" and payment 
    * record will be created.
    */
    const printCheque = async () => {
        ApiService.setHeader();
        console.log(getValues());
        let data = getValues()
        data.status = "Posted"

        swal.fire({
            title: `A/C Payee`,
            text: "Enter payee name",
            input: 'text',
            showCancelButton: true
        }).then(async (payee) => {
            if (payee.value) {
                swal.fire({
                    title: `Pay`,
                    text: "To pay",
                    input: 'text',
                    showCancelButton: true
                }).then(async (pay) => {
                    if (payee.value == undefined || pay.value == undefined) {
                        // infoNotification("please enter something in popup..")
                    } else {
                        console.log("payee:", payee.value);
                        console.log("pay:", pay.value);
                        // let total = 0;
                        // selectedBill?.map(e => {
                        //     total += parseFloat(e.amount)
                        // })
                        // console.log(converter.toWords(total))
                        const mySentence = converter.toWords(getValues("amount"));

                        const finalSentence = mySentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                        console.log(finalSentence);
                        PurchaseOrderPDF.generateCheque(payee.value, pay.value, `${finalSentence} Only`, getValues("amount"))


                        await ApiService.patch('/billPayment/updateBillPaymentAndBill/' + state._id, data).then(response => {
                            if (response.data.isSuccess) {
                                console.log(response.data);
                                PurchaseOrderPDF.generateCheque()
                                navigate(`/${rootPath}/billpayment`)
                            }
                        }).catch(e => {
                            console.log(e);
                        })

                    }
                })
            }
        })

        // await ApiService.patch('/billPayment/updateBillPaymentAndBill/' + state._id, data).then(response => {
        //     if (response.data.isSuccess) {
        //         console.log(response.data);
        //         PurchaseOrderPDF.generateCheque()
        //         navigate(`/${rootPath}/billpayment`)
        //     }
        // }).catch(e => {
        //     console.log(e);
        // })
    }

    // Print RTGS function for single cheque payment
    const printRTGS = async () => {
        let obj = new Object()
        console.log(state);
        const res = await ApiService.get("vendor/" + state?.bill?.vendor)
        if (res?.data.isSuccess) {
            console.log(res?.data.document)
            obj.name = res?.data.document.name
            obj.accountno = String(state?.bankAccount[0].name).split(' ')[0]
            obj.total = state?.amount

            PurchaseOrderPDF.generateSingleRTGS([obj])
        }
    }

    // Print Acknoledgement function for single cheque payment
    const printAcknoledgement = () => {
        PurchaseOrderPDF.generateAcknowledgment([state])
    }

    useEffect(async () => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()
        }

    }, []);

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Row>
                    <Breadcrumb style={{ fontSize: '24px' }}>
                        <Breadcrumb.Item className="breadcrumb-item" linkAs={Link} linkProps={{ to: `/${rootPath}/bills` }} ><span className="breadcrum-label">BILLS</span></Breadcrumb.Item>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/${rootPath}/bills/edit/${state?.bill?.id}` }} ><span className="breadcrum-label">{state?.memo}</span></Breadcrumb.Item>
                        {isAddMode ? <Breadcrumb.Item active><span >New</span></Breadcrumb.Item> : <Breadcrumb.Item active><span>Register Payment</span></Breadcrumb.Item>}
                    </Breadcrumb>
                </Row>
                <Row>
                    <Col>
                        {
                            // state?.bill?.paymentStatus !== "Paid" && <Button type="submit" variant="primary" size="sm">CREATE PAYMENT</Button>
                            state?.status == "Draft" && <Button type="submit" variant="primary" size="sm">CREATE PAYMENT</Button>
                        }
                        <Button as={Link} to={`/${rootPath}/billpayment/list`} variant="light" size="sm">DISCARD</Button>{" "}
                        <Button variant="primary" size="sm" onClick={printRTGS}>RTGS PAYMENT</Button>{" "}
                        {
                            // state?.bill?.paymentStatus !== "Paid" && <Button variant="primary" size="sm" onClick={printCheque} >CHEQUE PAYMENT</Button>
                            state?.status == "Draft" && <Button variant="primary" size="sm" onClick={printCheque} >CHEQUE PAYMENT</Button>
                        }
                        <Button variant="primary" size="sm" onClick={printAcknoledgement} > ACKNOWLEDGEMENT</Button>{" "}

                    </Col>
                    <Col style={{ display: 'flex', justifyContent: 'end' }}>

                        <div className="m-2 d-flex justify-content-end">
                            {!isAddMode && <div className='' style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state?.status}</div>}
                        </div>
                    </Col>
                </Row>


            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}

                <Row className="p-0 mt-0 m-0">
                    <Col>
                        <ButtonGroup size="sm">

                            {state?.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                            {state?.status == "Posted" && state?.paymentStatus == "Not Paid" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
                        </ButtonGroup>
                    </Col>

                </Row>


                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Journal Type</Form.Label>
                            <Form.Select style={{ maxWidth: '400px' }} size='sm' id="journalType" name="journalType" {...register("journalType", { required: true })}>
                                <option value="Bank">Bank</option>
                                <option value="Cash">Cash</option>

                            </Form.Select>
                        </Form.Group>

                        <Decimal128Field
                            register={register}
                            errors={errors}
                            field={{

                                description: "",
                                label: "Amount",
                                fieldId: "amount",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Bank",
                                fieldId: "bankAccount",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "account"

                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <DateField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Payment Date",
                                fieldId: "paymentDate",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the bill's created date!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Memo",
                                fieldId: "memo",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the bill's created date!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Reference Number",
                                fieldId: "referenceNumber",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />



                    </Row>
                </Container>

                {/* SUBTABS */}


            </AppContentBody>
        </AppContentForm>
    )
}
