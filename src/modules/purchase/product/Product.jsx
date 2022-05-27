import { React, useEffect, useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, FormSelect } from 'react-bootstrap';

import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { useFieldArray, useForm } from "react-hook-form";
import { BsArrowLeft, BsArrowRight, BsFillCreditCardFill, BsFillBarChartFill } from 'react-icons/bs';
import ApiService from '../../../helpers/ApiServices';
import { TanasUtils } from '../../../helpers/Utils';
import { BarcodePDF } from '../../../helpers/PDF';
import Swal from 'sweetalert2';


export default function Product() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1]; // path of the module
    const [colleapse, setcolleapse] = useState(false);
    const [colleapseRange, setcolleapseRange] = useState(false);
    const [rangeList, setrangeList] = useState([])
    const [productMasterList, setProductMasterList] = useState([])
    const [groupMasterList, setGroupMasterList] = useState([])
    const [MaxMinSizeList, setMaxMinSizeList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [firstCategoryList, setFirstCategoryList] = useState([])
    const [secondCategoryList, setSecondCategoryList] = useState([])
    const [sizeList, setSizeList] = useState([])
    const [state, setstate] = useState({});
    const [accountList, setAccountList] = useState([]);
    const [uom, setuom] = useState([]);
    const [HSNSACS, setHSNSACS] = useState([]);
    const [tabKey, setTabKey] = useState('generalInformations');
    const navigate = useNavigate();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            totalPurchasedQuantity: 0,
            totalSoldQuantity: 0,
            onHand: 0,
            commited: 0,
            available: 0,
            salesPrice: 0,
            averageCost: 0,
            cost: 0,
        }
    });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        console.log(rangeList);
        if (rangeList.length) {

        } else {
            return ApiService.post('/product', data).then(response => {
                if (response.data.isSuccess) {
                    navigate("/purchase/products");
                }
            }).catch(e => {
                console.log(e);
            })
        }
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/product/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate("/purchase/products");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/product/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                navigate("/purchase/products");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const collapseCard = () => {
        console.log(colleapse);
        setcolleapse(!colleapse)
    }

    const filterCategory = async (event) => {
        let responseData = await ApiService.get(`itemCategory/search?parent=${event.target.value}`)
        switch (event.target.id) {
            case 'productMaster':
                setGroupMasterList(responseData.data.document)
                break;
            case 'groupMaster':
                setBrandList(responseData.data.document)
                break;
            case 'brand':
                setFirstCategoryList(responseData.data.document)
                break;
            case 'firstCategory':
                setSecondCategoryList(responseData.data.document)
                break;
            case 'secondCategory':
                setSizeList(responseData.data.document)
                break;
            default:
                break;
        }
    }

    const generateItemName = async () => {
        const formData = getValues();
        console.log(formData);

        const categoryObjArr = [
            {
                categoryValue: formData.productMaster,
                listName: productMasterList
            },
            {
                categoryValue: formData.groupMaster,
                listName: groupMasterList
            },
            {
                categoryValue: formData.brand,
                listName: brandList
            },
            {
                categoryValue: formData.firstCategory,
                listName: firstCategoryList
            },
            {
                categoryValue: formData.secondCategory,
                listName: secondCategoryList
            },
            {
                categoryValue: formData.size,
                listName: sizeList
            }
        ]

        let itemName = createItemName(categoryObjArr);

        if (formData.minimunSize && formData.mazimumSize) {
            // Get product name by range
            const tanasUtil = new TanasUtils();
            const rangeArray = tanasUtil.calculatePrice(parseInt(formData.minimunSize), parseInt(formData.mazimumSize), parseInt(formData.costPrice), 15, 8, 40, 5)
            console.log(rangeArray);

            let array = new Array()
            rangeArray?.map(e => {
                let obj = new Object()
                obj.name = `${itemName}_${e?.size}`
                obj.price = e?.price
                array.push(obj)
            })
            setrangeList(array)
            setValue('name', "")
        } else {
            // Set item name in product name field for single product creation
            setValue('name', itemName)
        }
        resetItemCategory()
        setcolleapse(false)
    }

    const createItemName = (data) => {
        let itemName = '';
        data && data.map((value) => {
            let propertyName = value.listName.filter(element => element.id === value.categoryValue)
            if (propertyName.length > 0) {
                itemName += propertyName[0].name + '_';
            }
        })

        itemName = itemName.substring(0, itemName.length - 1)
        return itemName
    }

    const resetItemCategory = () => {
        reset({ ...getValues(), "productMaster": {}, "groupMaster": {}, "brand": {}, "firstCategory": {}, "secondCategory": {}, "size": {}, "itemQty": 0, "age": 0, "minimunSize": {}, "mazimumSize": {}, "costPrice": 0 })
    }

    const printBarcode = () => {
        Swal.fire({
            title: `Enter quantity`,
            text: "Enter quantity...",
            input: 'number',
            showCancelButton: true
        }).then(async (result) => {

            console.log("value: ", result.value);
            if (result.value == undefined) {
                Swal.fire("please enter something in popup..")

                console.log("please enter something");
            } else {
                BarcodePDF.generateDefaultPurchaseOrderBarcodePDF(result.value, state)
            }
        })
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");

        const accountResponse = await ApiService.get('account');
        if (accountResponse.data.isSuccess) {
            setAccountList(accountResponse.data.documents);
        }

        const uomResponse = await ApiService.get('uom');
        if (uomResponse.data.isSuccess) {
            setuom(uomResponse.data.documents);
        }

        const HSNSACSResponse = await ApiService.get('gstRates');
        if (HSNSACSResponse.data.isSuccess) {
            setHSNSACS(HSNSACSResponse.data.documents);
        }

        const res = await ApiService.get('sizeList');
        console.log(res.data.documents)
        setMaxMinSizeList(res.data.documents)

        await ApiService.get('itemCategory/search?type=productMaster')
            .then(response => {
                if (response.data.isSuccess) {
                    setProductMasterList(response.data.document)
                }
            })

        if (isAddMode) {
            accountResponse?.data.documents?.map(e => {
                if (e.title == "Sales") {
                    setValue('incomeAccount', e?._id);
                }
                if (e.title == "COGS") {
                    setValue('expenseAccount', e?._id);
                }
                if (e.title == "Inventory Asset") {
                    setValue('assetAccount', e?._id);
                }
            })
            setLoderStatus("SUCCESS");
        }

        if (!isAddMode) {
            setLoderStatus("RUNNING");

            ApiService.setHeader();
            ApiService.get(`product/${id}`).then(response => {
                if (response.data.isSuccess) {
                    setLoderStatus("SUCCESS");
                    console.log(response.data.document)
                    setstate(response.data.document)
                    reset(response.data.document);
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        }
    }, [])


    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>{isAddMode ? "Create New Product" : state.name}</h3></Col>
                    </Row>
                    <Row>
                        <Col md="4">
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/products`} variant="light" size="sm">DISCARD</Button>{" "}
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">
                                {/* <Dropdown.Item eventKey="1">Achive</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Duplicate action</Dropdown.Item> */}
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                        <Col md="4"> </Col>
                        <Col md="4" style={{ display: "flex", justifyContent: "flex-end" }}>
                            {!isAddMode ? <Button variant="primary" size="sm" onClick={printBarcode}>Print barcode</Button> : ""}
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0" fluid>
                    <Container className=" bg-light p-0 m-0" style={{ backgroundColor: 'pink', height: '40px' }} fluid>
                        <Row className="m-0 p-0">
                            <Col className="m-0 p-0 text-center" sm="6" xs="6">
                                <div class="p-2 bg-light">
                                    <BsFillBarChartFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('totalSoldQuantity')} Units  Sold

                                </div>
                            </Col>
                            <Col className="m-0 p-0 text-center" sm="6" xs="6">
                                <div class="p-2 bg-light">
                                    <BsFillCreditCardFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('totalPurchasedQuantity')} Units  Purchased

                                </div>
                            </Col>
                        </Row>
                    </Container>
                    <Container className="mt-4" fluid>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            {
                                isAddMode ?
                                    <Card className="card" style={{ marginTop: 1 }}>
                                        <Card.Header className="title" onClick={collapseCard} style={{ cursor: "pointer" }}>  Item Category</Card.Header>
                                        {
                                            colleapse && (
                                                <Card.Body>
                                                    <Row>
                                                        <Form.Group as={Col} md="4" className="mb-2">
                                                            <Form.Label>Name</Form.Label>
                                                            <Form.Control type="text" id="itemName" name="itemName" {...register("itemName")} disabled />
                                                        </Form.Group>
                                                        <Form.Group as={Col} md="4" className="mb-2" >
                                                            <Form.Label>Product Master</Form.Label>
                                                            <FormSelect id="productMaster" name="productMaster" {...register("productMaster")} onChange={event => filterCategory(event)}  >
                                                                <option value={null} selected>Choose..</option>
                                                                {productMasterList && productMasterList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                        <Form.Group as={Col} md="4" className="mb-2">
                                                            <Form.Label>Group Master</Form.Label>
                                                            <FormSelect id="groupMaster" name="groupMaster" {...register("groupMaster")} onChange={event => filterCategory(event)} >
                                                                <option value={null} selected>Choose..</option>
                                                                {groupMasterList && groupMasterList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>

                                                    </Row>
                                                    <Row>
                                                        <Form.Group as={Col} md="4" className="mb-2">
                                                            <Form.Label>Brand</Form.Label>
                                                            <FormSelect id="brand" name="brand" {...register("brand")} onChange={event => filterCategory(event)} >
                                                                <option value={null} selected>Choose..</option>
                                                                {brandList && brandList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>First Category</Form.Label>
                                                            <FormSelect id="firstCategory" name="firstCategory" {...register("firstCategory")} onChange={event => filterCategory(event)} >
                                                                <option value={null} selected>Choose..</option>
                                                                {firstCategoryList && firstCategoryList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Second Category</Form.Label>
                                                            <FormSelect id="secondCategory" name="secondCategory" {...register("secondCategory")} onChange={event => filterCategory(event)} >
                                                                <option value={null} selected>Choose..</option>
                                                                {secondCategoryList && secondCategoryList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                    </Row>
                                                    <Row>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Size</Form.Label>
                                                            <FormSelect id="size" name="size" {...register("size")}
                                                                onChange={(e) => {
                                                                    console.log(e.target.value);
                                                                    if (e.target.value) {
                                                                        setcolleapseRange(true)
                                                                        setValue("minimunSize", "")
                                                                        setValue("mazimumSize", "")
                                                                        setValue("costPrice", "")
                                                                    } else {
                                                                        setcolleapseRange(false)
                                                                    }
                                                                    if (e.target.value !== "Choose..") {
                                                                        setcolleapseRange(true)
                                                                    } else {
                                                                        setcolleapseRange(false)
                                                                    }
                                                                }}
                                                            >
                                                                <option value={null} selected>Choose..</option>
                                                                {sizeList && sizeList.map((value, index) => {
                                                                    return <option key={index} value={value.id}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Quantity</Form.Label>
                                                            <Form.Control type="number" defaultValue={0} min="0" id="itemQty" name="itemQty" {...register("itemQty")} />
                                                        </Form.Group>
                                                        {/* <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Age</Form.Label>
                                                            <Form.Control type="number" min="0" id="age" name="age" {...register("age")} />
                                                        </Form.Group> */}
                                                    </Row>
                                                    {/* {
                                                !colleapseRange && (
                                                    <Row>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Minimum Size</Form.Label>
                                                            <FormSelect id="minimunSize" name="minimunSize" {...register("minimunSize")} >
                                                                <option value={null} selected>Choose..</option>
                                                                {MaxMinSizeList && MaxMinSizeList.map((value, index) => {
                                                                    return <option key={index} value={value.name}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Mazimum Size</Form.Label>
                                                            <FormSelect id="mazimumSize" name="mazimumSize" {...register("mazimumSize")} >
                                                                <option value={null} selected>Choose..</option>
                                                                {MaxMinSizeList && MaxMinSizeList.map((value, index) => {
                                                                    return <option key={index} value={value.name}>{value.name}</option>
                                                                })}
                                                            </FormSelect>
                                                        </Form.Group>
                                                        <Form.Group className="mb-2" as={Col} md="4">
                                                            <Form.Label>Cost Price</Form.Label>
                                                            <Form.Control type="number" min="0" id="costPrice" name="costPrice" {...register("costPrice")} />
                                                        </Form.Group>
                                                    </Row>
                                                )
                                            } */}

                                                </Card.Body>
                                            )
                                        }
                                        {
                                            colleapse && (
                                                <Card.Footer>
                                                    <Button type="button" size="sm" onClick={generateItemName}>Add</Button>
                                                    <Button type="button" variant="btn btn-outline-secondary" size="sm" onClick={resetItemCategory}>Reset</Button>
                                                </Card.Footer>
                                            )
                                        }
                                    </Card> : ""
                            }
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                <Form.Label className="m-0">Product Name</Form.Label>
                                <Form.Control id="name" name="name" {...register("name")} size="sm" type="text" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Sales Price</Form.Label>
                                <Form.Control id="salesPrice" name="salesPrice" {...register("salesPrice")} size="sm" step="0.001" type="number" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                <Form.Label className="m-0">Purchase Cost</Form.Label>
                                <Form.Control id="cost" name="cost" {...register("cost")} size="sm" step="0.001" type="number" />
                            </Form.Group>

                        </Row>
                        <Row>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Product Description</Form.Label>
                                <Form.Control id="description" name="description" {...register("description")} size="sm" as="textarea" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Remark</Form.Label>
                                <Form.Control id="remark" name="remark" {...register("remark")} size="sm" as="textarea" />
                            </Form.Group>
                            <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                <Form.Label className="m-0">Units</Form.Label>
                                <Form.Select id="uom" name="uom" {...register("uom")}>
                                    <option value={null}>Choose..</option>
                                    {uom.map((element, index) => {
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="generalInformations" title="General Informations">
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Location</Form.Label>
                                        <Form.Control id="location" name="location" {...register("location")} size="sm" type="text" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Quantity On Hand</Form.Label>
                                        <Form.Control id="onHand" name="onHand" {...register("onHand")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Barcode</Form.Label>
                                        <Form.Control id="barcode" name="barcode" {...register("barcode")} size="sm" type="text" />
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Available</Form.Label>
                                        <Form.Control id="available" name="available" {...register("available")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Commited</Form.Label>
                                        <Form.Control id="commited" name="commited" {...register("commited")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Average Cost</Form.Label>
                                        <Form.Control id="averageCost" name="averageCost" {...register("averageCost")} size="sm" type="number" />
                                    </Form.Group>
                                </Row>
                            </Tab>
                            {/* <Tab eventKey="purchase" title="Purchase">

                            </Tab>*/}
                            <Tab eventKey="tax" title="Tax Information">
                                <Row><a href="https://cbic-gst.gov.in/gst-goods-services-rates.html" target="_blank">For more info about taxes....</a></Row>
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">HSN / SACS Code</Form.Label>
                                        <Form.Select id="HSNSACS" name="HSNSACS" {...register("HSNSACS")}
                                            onChange={async (e) => {
                                                console.log(e)
                                                return;
                                                const HSNSACSNo = await ApiService.get('gstRates/' + e.target.value);
                                                setValue(`cgstRate`, HSNSACSNo.data.document.cgstRate);
                                                setValue(`igstRate`, HSNSACSNo.data.document.igstRate);
                                                setValue(`sgstRate`, HSNSACSNo.data.document.sgstRate);
                                                setValue(`cess`, HSNSACSNo.data.document.cess);

                                            }}
                                        >
                                            <option value={null}>Choose..</option>
                                            {HSNSACS.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">CGST Rate(%)</Form.Label>
                                        <Form.Control id="cgstRate" name="cgstRate" {...register("cgstRate")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">SGST / UTGST(%)</Form.Label>
                                        <Form.Control id="sgstRate" name="sgstRate" {...register("sgstRate")} size="sm" type="number" />
                                    </Form.Group>

                                </Row>
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">IGST Rate(%)</Form.Label>
                                        <Form.Control id="igstRate" name="igstRate" {...register("igstRate")} size="sm" type="number" />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Cess(%)</Form.Label>
                                        <Form.Control id="cess" name="cess" {...register("cess")} size="sm" type="number" />
                                    </Form.Group>

                                </Row>
                            </Tab>
                            <Tab eventKey="accounting" title="Accounting">
                                <Row>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-4">
                                        <Form.Label className="m-0">Income Account</Form.Label>
                                        <Form.Select id="incomeAccount" name="incomeAccount" {...register("incomeAccount")}>
                                            <option value={null}>Choose..</option>
                                            {accountList.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>

                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Expense Account</Form.Label>
                                        <Form.Select id="expenseAccount" name="expenseAccount" {...register("expenseAccount")}>
                                            <option value={null}>Choose..</option>
                                            {accountList.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Asset Account</Form.Label>
                                        <Form.Select id="assetAccount" name="assetAccount" {...register("assetAccount")}>
                                            <option value={null}>Choose..</option>
                                            {accountList.map((element, index) => {
                                                return <option key={index} value={element.id}>{element.name}</option>
                                            })}
                                        </Form.Select>
                                    </Form.Group>
                                    {/* <Form.Group as={Col} xs="12" sm="12" md="6" lg="4" className="mb-3">
                                        <Form.Label className="m-0">Price Difference Account</Form.Label>
                                        <Form.Control id="barcode" name="barcode" {...register("barcode")} size="sm" type="text" />
                                    </Form.Group> */}
                                </Row>
                            </Tab>

                        </Tabs>
                    </Container>
                </Container>



            </Form >
        </Container >

    )
}