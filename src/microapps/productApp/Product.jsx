import { React, useState, useEffect } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Breadcrumb, Form, Card, FormSelect } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { BsArrowLeft, BsArrowRight, BsPauseBtnFill, BsFillCreditCardFill, BsFillBarChartFill, BsSaveFill } from 'react-icons/bs';
import ApiService from '../../helpers/ApiServices'
import { errorMessage } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppFormTitle from '../../pcterp/components/AppFormTitle'
import SelectField from '../../pcterp/field/SelectField'
import TextArea from '../../pcterp/field/TextArea'
import TextField from '../../pcterp/field/TextField'
import Decimal128Field from '../../pcterp/field/Decimal128Field';
import LogHistories from '../../pcterp/components/LogHistories';
import CheckboxField from '../../pcterp/field/CheckboxField';
import PCTTax from '../../components/form/searchAndSelect/PCTTax';
import AppLoader from '../../pcterp/components/AppLoader';
import swal from "sweetalert2"

export default function Product() {
    const [state, setState] = useState(null)
    const [colleapse, setcolleapse] = useState(false);
    const [productMasterList, setProductMasterList] = useState([])
    const [accountObj, setaccountObj] = useState()
    const [rangeList, setrangeList] = useState([])
    const [colleapseRange, setcolleapseRange] = useState(false);
    const [productList, setProductList] = useState([])
    const [MaxMinSizeList, setMaxMinSizeList] = useState([])
    const [groupMasterList, setGroupMasterList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [firstCategoryList, setFirstCategoryList] = useState([])
    const [sizeList, setSizeList] = useState([])
    const [secondCategoryList, setSecondCategoryList] = useState([])
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const [loderStatus, setLoderStatus] = useState(null);
    const { id } = useParams();
    // const history = useHistory();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            assetAccount: null,
            incomeAccount: null,
            expenseAccount: null,
            vendorTaxes: ['5']

        }
    });



    // Functions

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/product', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/product/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/product/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/product/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/product/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/product/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/product/${id}`).then(response => {
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

    const filterCategory = async (event) => {
        try {
            let responseData = await ApiService.get(`itemCategory/search?parent=${event.target.value}`)

            switch (event.target.id) {
                case 'productMaster':
                    setGroupMasterList(responseData?.data.document)
                    break;
                case 'groupMaster':
                    setBrandList(responseData?.data.document)
                    break;
                case 'brand':
                    setFirstCategoryList(responseData?.data.document)
                    break;
                case 'firstCategory':
                    setSecondCategoryList(responseData?.data.document)
                    break;
                case 'secondCategory':
                    setSizeList(responseData?.data.document)
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log(e.response.data.message);
            // errorMessage(e, dispatch)
        }
    }

    const roundOff = 5;
    class TanasUtils {

        /**
         * This method is use to find the Price of each size in a pack.
         * 
         * @param {Number} min Minimum size in the pack
         * @param {*} max Maximum size in the pack.
         * @param {Number} basePrice Base Price
         * @param {Number} expense Expense
         * @param {Number} transportChargePer Transportation charge in number. eg. 8% is 8, 40% is 40
         * @param {Number} profitPer Profit Percentage in number. eg. 45% is 45, 75% is 75.
         * @param {Number} gst GST Percentage in number
         * @returns Object
         */
        calculatePrice(min, max, basePrice, expense, transportChargePer, profitPer, gst) {
            let arrayOfSize = new Array();

            const priceFactor = this.findPriceFactor(basePrice);
            const result = this.findMedian(min, max);

            if (result.median) {
                for (var i = min; i <= max; i += 2) {

                    let totalPrice = ((basePrice + (i - result.median) * (priceFactor) / 2) + expense);
                    //console.log(i, (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / 5)) * 5)
                    const eachSize = {
                        size: i,
                        price: (Math.ceil(totalPrice * (1 + transportChargePer / 100) * (1 + profitPer / 100) * (1 + gst / 100) / roundOff)) * roundOff
                    }

                    arrayOfSize.push(eachSize);
                }
                return arrayOfSize;
            } else {
                return "Something went wrong, please check the size you have provided!"
            }
        }


        /**
         * This method is use to find the median(the middle value) in a list ordered from smallest to largest.
         * 
         * @param {Number} min - Minimun size in the pack.
         * @param {Number} max - Maximum size in the pack.
         * @returns Object
         */
        findMedian(min, max) {
            let sumOfSize = (min + max) / 2;
            return { median: sumOfSize }
        }

        isOddNumberOfSize(min, max) {
            let sumOfSize = (min + max) / 2;
            if (sumOfSize % 2 == 0)
                return { isOdd: true, median: sumOfSize };
            else return { isOdd: false, median: sumOfSize };
        }


        /**
         * This method is use to find the price factor
         * Rules
         * price: 1 - 25 return 1
         * price: 26 - 50 return 2
         * price: 51 - 75 return 3
         * ..
         * ..
         * price: 501 - 525 return 21
         * @param {Number} price - Base price of the product.
         * @returns Number
         */
        findPriceFactor(price) {
            let result = price / 25;
            return Math.ceil(result);
        }
    }

    // const generateItemName = async () => {
    //     const formData = getValues();
    //     console.log(formData);

    //     const categoryObjArr = [
    //         {
    //             categoryValue: formData.productMaster,
    //             listName: productMasterList
    //         },
    //         {
    //             categoryValue: formData.groupMaster,
    //             listName: groupMasterList
    //         },
    //         {
    //             categoryValue: formData.brand,
    //             listName: brandList
    //         },
    //         {
    //             categoryValue: formData.firstCategory,
    //             listName: firstCategoryList
    //         },
    //         {
    //             categoryValue: formData.secondCategory,
    //             listName: secondCategoryList
    //         },
    //         {
    //             categoryValue: formData.size,
    //             listName: sizeList
    //         }
    //     ]

    //     let itemName = createItemName(categoryObjArr);
    //     setValue("name", itemName)
    //     let itemId;
    //     if (itemName !== '') {
    //         await ApiService.get(`product/search/${itemName}`)
    //             .then(async response => {
    //                 if (response.data.isSuccess && response.data.document.length > 0) {
    //                     itemId = await response.data.document[0].id
    //                     await updateProductList();
    //                     if (itemId) {
    //                         swal({
    //                             title: "Item already present in database",
    //                             buttons: false
    //                         })
    //                     }
    //                 }
    //                 else {

    //                 }
    //             })
    //             .catch(e => {
    //                 console.log(e.response.data.message);
    //                 // errorMessage(e, dispatch)
    //             })

    //         let productListLength = formData.products?.length
    //         let itemAlreadyPresent = formData.products?.findIndex(element => element.product === itemId);
    //         let categoryQty = formData.itemQty
    //         if (itemAlreadyPresent === -1) {
    //             // itemAppend({})
    //             // setValue(`products.${productListLength}.product`, itemId)

    //             // Generate items according to sizes and set in line
    //             if (parseInt(formData.minimunSize) && parseInt(formData.mazimumSize) && parseInt(formData.size)) {
    //                 console.log("Either select only size or select max and min size")
    //             } else if (parseInt(formData.minimunSize) && parseInt(formData.mazimumSize)) {
    //                 console.log("min and max size present");
    //                 createAndSetItems(formData, itemName)
    //             } else {
    //                 console.log("min and max size not present");
    //                 console.log(formData);
    //                 console.log(formData.itemQty);
    //                 if (parseInt(formData.size)) {
    //                     try {
    //                         //find size
    //                         const sizeResponse = await ApiService.get(`itemCategory/${formData.size}`)
    //                         if (sizeResponse?.data.isSuccess) {
    //                             const r = await ApiService.post(`product/procedure`, {
    //                                 name: itemName,
    //                                 description: `${itemName}`,
    //                                 cost: formData.costPrice,

    //                             })
    //                             if (r.data.isSuccess) {
    //                                 itemId = await r.data.document.id;
    //                                 await updateProductList();

    //                                 let products = getValues('products')
    //                                 let obj = new Object()
    //                                 obj.product = itemId
    //                                 obj.quantity = parseInt(formData.itemQty)
    //                                 obj.size = parseInt(sizeResponse?.data.document.name)
    //                                 obj.unitPrice = 0
    //                                 obj.taxes = r?.data.document?.igstRate
    //                                 obj.subTotal = 0
    //                                 obj.received = 0
    //                                 obj.billed = 0
    //                                 products.push(obj)
    //                                 console.log(obj);
    //                                 setValue(`products`, products)
    //                             }
    //                         } else {
    //                             console.log("can not get size data")
    //                         }

    //                     } catch (e) {
    //                         console.log(e.response.data.message);
    //                         // errorMessage(e, dispatch)
    //                     }
    //                 } else {
    //                     console.log("Please select size")
    //                 }
    //             }
    //             updateOrderLines();
    //         }
    //         else {
    //             swal({
    //                 title: "Item already present in line",
    //                 text: "Quantity will be added. Do you want to proceed?",
    //                 buttons: true
    //             }).then(data => {
    //                 if (data) {
    //                     let lineData = getValues(`products.${itemAlreadyPresent}`)
    //                     setValue(`products.${itemAlreadyPresent}.quantity`, parseFloat(formData.itemQty) + parseFloat(lineData.quantity))
    //                     setValue(`products.${itemAlreadyPresent}.subTotal`, (getValues(`products.${itemAlreadyPresent}.quantity`)) * parseInt(getValues(`products.${itemAlreadyPresent}.unitPrice`)));
    //                     updateOrderLines();
    //                 }
    //             })
    //         }
    //     }
    //     // updateOrderLines()
    // }
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

    const createAndSetItems = async (formData, itemName) => {
        const products = getValues("products")
        let array = new Array();

        const tanasUtil = new TanasUtils();
        const rangeArray = tanasUtil.calculatePrice(parseInt(formData.minimunSize), parseInt(formData.mazimumSize), parseInt(formData.costPrice), 15, 8, 40, 5)
        console.log(rangeArray);

        rangeArray?.map(async e => {
            let obj = new Object()

            try {
                const response = await ApiService.get(`product/search/${itemName}_${e.size}`)
                if (response.data.document.length > 0) {
                    console.log("Item already present in database for max min")
                    // swal({
                    //     title: "Item already present in database for max min",
                    //     buttons: false
                    // })
                } else {
                    const res = await ApiService.post(`product/procedure`, {
                        name: `${itemName}_${e.size}`,
                        description: `${itemName}_${e.size}`,
                        cost: formData.costPrice,
                        salesPrice: e.price
                    })

                    if (res.data.isSuccess) {
                        obj.product = res.data.document.id
                        obj.quantity = formData.itemQty
                        obj.size = parseInt(e.size)
                        obj.unitPrice = parseInt(formData.costPrice)
                        obj.taxes = res?.data.document?.igstRate
                        obj.salesPrice = parseInt(e.price)
                        obj.subTotal = parseInt(formData.costPrice) * parseInt(formData.itemQty)
                        obj.received = 0
                        obj.billed = 0
                        products.push(obj)

                        await updateProductList();
                        updateOrderLines()
                    }

                    // if (products.length == rangeArray.length + 1) {
                    console.log("final array: ", products);
                    setValue("products", products)
                    // categoryQty ? setValue(`products.${productListLength}.quantity`, formData.itemQty) : setValue(`products.${productListLength}.quantity`, 0)
                    // }
                }
            } catch (e) {
                console.log(e.response.data.message);
                // errorMessage(e, dispatch)
            }
        })
    }
    const createAndSetItemsForRange = async (itemName) => {
        const formData = getValues();

        const products = getValues("products")
        let array = new Array();

        const tanasUtil = new TanasUtils();
        const rangeArray = tanasUtil.calculatePrice(parseInt(formData.minimunSize), parseInt(formData.mazimumSize), parseInt(formData.costPrice), 15, 8, 40, 5)
        console.log(rangeArray);

        rangeArray?.map(async e => {
            let obj = new Object()

            const response = await ApiService.get(`product/search/${itemName}_${e.size}`)
            if (response.data.document.length > 0) {
                swal({
                    title: "Item already present in database for max min",
                    buttons: false
                })
            } else {
                try {
                    const res = await ApiService.post(`product/procedure`, {
                        name: `${itemName}_${e.size}`,
                        description: `${itemName}_${e.size}`,
                        cost: formData.costPrice,
                        salesPrice: e.price
                    })

                    if (res.data.isSuccess) {
                        obj.product = res.data.document.id
                        obj.quantity = 1
                        obj.size = parseInt(e.size)
                        obj.unitPrice = parseInt(formData.costPrice)
                        obj.salesPrice = parseInt(e.price)
                        obj.subTotal = parseInt(formData.costPrice) * parseInt(1)
                        obj.received = 0
                        obj.billed = 0
                        products.push(obj)

                        await updateProductList();
                    }
                } catch (err) {
                    console.log(err);
                    alert(err)
                }

                // if (products.length == rangeArray.length + 1) {
                console.log("final array: ", products);
                setValue("products", products)
                // categoryQty ? setValue(`products.${productListLength}.quantity`, formData.itemQty) : setValue(`products.${productListLength}.quantity`, 0)
                // }
            }
        })
    }

    const updateProductList = async () => {
        try {
            const productResponse = await ApiService.get('product');
            console.log(productResponse.data.documents)

            if (productResponse.data.isSuccess) {
                setProductList(productResponse.data.documents)
            }
        } catch (e) {
            console.log(e.response.data.message);
            // errorMessage(e, dispatch)
        }
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
        console.log("itemName: ", itemName);
        return itemName
    }

    const resetItemCategory = () => {
        reset({ ...getValues(), "productMaster": {}, "groupMaster": {}, "brand": {}, "firstCategory": {}, "secondCategory": {}, "size": {}, "itemQty": 0 })
    }

    const openTransferedProduct = () => {
        // history.push("/purchase/received/" + state.id);
        navigate("/purchase/received/" + state.id);
    }

    const updateOrderLines = (index) => {
        // let cumulativeSum = 0, cgstSum = 0, sgstSum = 0, igstSum = 0;
        // const products = getValues('products')
        // console.log(products);
        // products.map((val) => {
        //     console.log(val);
        //     cumulativeSum += parseFloat(val.subTotal);
        //     cgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
        //     sgstSum += parseFloat(((val.taxes) / 2 * val.subTotal) / 100);
        //     igstSum += parseFloat(((val.taxes) * val.subTotal) / 100);
        // });

        // setValue("estimation", {
        //     untaxedAmount: cumulativeSum,
        //     cgst: cgstSum,
        //     sgst: sgstSum,
        //     igst: igstSum,
        //     total: parseFloat(cumulativeSum + igstSum)
        // });
        // setstate(prevState => ({
        //     ...prevState,    // keep all other key-value pairs
        //     estimation: {
        //         untaxedAmount: cumulativeSum,
        //         cgst: cgstSum,
        //         sgst: sgstSum,
        //         igst: igstSum,
        //         total: parseFloat(cumulativeSum + igstSum)
        //     }
        // }));

    }

    const collapseCard = () => {
        setcolleapse(!colleapse)
    }


    useEffect(async () => {

        await ApiService.get('/product/getIncomeExpenseAssetAccount')
            .then(response => {
                console.log(response);
                if (response.data.isSuccess) {
                    console.log(response.data.document);
                    setaccountObj(response.data.document)
                }
            }).catch(e => {
                console.log(e);
                console.log(e.response.data.message);
            })

        const getAllProductMaster = async () => {
            await ApiService.get('itemCategory/search?type=productMaster')
                .then(response => {
                    if (response.data.isSuccess) {
                        setProductMasterList(response.data.document)
                    }
                }).catch(e => {
                    console.log(e);
                    console.log(e.response.data.message);
                })
        }
        getAllProductMaster()

        const res = await ApiService.get('sizeList');
        console.log(res.data.documents)
        setMaxMinSizeList(res.data.documents)

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()
        }

    }, []);
    console.log(accountObj);


    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }

    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/product/list` }}>   <div className='breadcrum-label'>PRODUCTS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to={`/${rootPath}/product/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}

                        </Col>
                    </Row>
                </Container>
            </AppContentHeader>
            <AppContentBody>
                <Container className=" bg-light p-0 m-0" fluid>
                    <Row className="m-0 p-0">
                        <Col className="m-0 p-0 text-center" md="3" sm="6" xs="6">
                            <div class="p-2 bg-light">
                                <BsFillBarChartFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('totalSoldQuantity')} UNITS  SOLD

                            </div>
                        </Col>
                        <Col className="m-0 p-0 text-center" md="3" sm="6" xs="6">
                            <div class="p-2 bg-light">
                                <BsFillCreditCardFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('totalPurchasedQuantity')} UNITS  PURCHASED

                            </div>
                        </Col>
                        <Col className="m-0 p-0 text-center" md="3" sm="6" xs="6">
                            <div class="p-2 bg-light">
                                <BsSaveFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('onHand')} ON HAND

                            </div>
                        </Col>
                        <Col className="m-0 p-0 text-center" md="3" sm="6" xs="6">
                            <div class="p-2 bg-light">
                                <BsPauseBtnFill style={{ width: '24px', height: '24px' }} />{" "}{getValues('commited')} UNITS  COMMITED

                            </div>
                        </Col>
                    </Row>
                </Container>
                {/* BODY FIELDS */}
                <Container className='mt-2' fluid>
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
                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Name of the Product.",
                                label: "PRODUCT NAME",
                                fieldId: "name",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the Product name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <Decimal128Field
                            register={register}
                            errors={errors}
                            field={{
                                description: "Selling Price of this Product.",
                                label: "SALES PRICE",
                                fieldId: "salesPrice",
                                placeholder: "",

                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />


                        <Decimal128Field
                            register={register}
                            errors={errors}
                            field={{
                                description: "Purchase Cost",
                                label: "PURCHASE COST",
                                fieldId: "cost",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Product Description",
                                label: "PRODUCT DESCRIPTION",
                                fieldId: "description",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Remark",
                                label: "REMARK",
                                fieldId: "remark",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "Units of Measure",
                                label: "UNITS",
                                fieldId: "uom",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "uom",
                                multiple: false
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                    </Row>
                </Container>

                {/* SUBTABS */}
                <Container className='mt-2' fluid>
                    <Tabs defaultActiveKey='generalInformations'>
                        <Tab eventKey="generalInformations" title="GENERAL INFORMATIONS">
                            <Container className="mt-2" fluid>
                                <Row>
                                    <SelectField
                                        control={control}
                                        errors={errors}
                                        field={{
                                            description: "Location",
                                            label: "LOCATION",
                                            fieldId: "location",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            selectRecordType: "location",
                                            multiple: false
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />


                                    <TextField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            disabled: true,
                                            description: "",
                                            label: "ON HAND",
                                            fieldId: "onHand",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Product name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />
                                    <TextField
                                        disabled={true}
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "",
                                            label: "BARCODE",
                                            fieldId: "barcode",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Product name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <TextField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            disabled: true,
                                            description: "",
                                            label: "AVAILABLE",
                                            fieldId: "available",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Product name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <TextField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            disabled: true,
                                            description: "",
                                            label: "COMMITED",
                                            fieldId: "commited",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Product name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <TextField
                                        register={register}
                                        errors={errors}
                                        field={{
                                            disabled: true,
                                            description: "",
                                            label: "AVERAGE COST",
                                            fieldId: "averageCost",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the Product name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />
                                </Row>
                            </Container>
                        </Tab>
                        <Tab eventKey="tax" title="TAX INFORMATION">
                            <Container className="mt-2" fluid>
                                <Row>
                                    <SelectField
                                        control={control}
                                        errors={errors}
                                        field={{
                                            description: "HSN/SAC",
                                            label: "HSN/SACS CODE",
                                            fieldId: "HSNSACS",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            selectRecordType: "gstRates",
                                            multiple: false
                                        }}
                                        changeHandler={async (e, value) => {

                                            const HSNSACSNo = await ApiService.get('gstRates/' + value?.value._id);
                                            setValue(`cgstRate`, HSNSACSNo.data.document.cgstRate);
                                            setValue(`igstRate`, HSNSACSNo.data.document.igstRate);
                                            setValue(`sgstRate`, HSNSACSNo.data.document.sgstRate);
                                            setValue(`cess`, HSNSACSNo.data.document.cess);

                                        }}
                                        blurHandler={null}
                                    />
                                    <Decimal128Field
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "",
                                            label: "CGST RATE(%)",
                                            fieldId: "cgstRate",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />
                                    <Decimal128Field
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "",
                                            label: "SGST / UTGST(%)",
                                            fieldId: "sgstRate",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />
                                    <Decimal128Field
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "Purchase Cost",
                                            label: "IGST RATE (%)",
                                            fieldId: "igstRate",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />
                                    <Decimal128Field
                                        register={register}
                                        errors={errors}
                                        field={{
                                            description: "",
                                            label: "CESS (%)",
                                            fieldId: "cess",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!"
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    <PCTTax control={control}
                                        errors={errors}
                                        field={{
                                            description: "",
                                            label: "VENDOR TAXES",
                                            fieldId: "vendorTaxes",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            // selectRecordType: "account",
                                            multiple: true
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    />

                                    {/* <SelectField
                                        control={control}
                                        errors={errors}
                                        field={{
                                            description: "Default Vendor Taxes",
                                            label: "Vendor Taxes",
                                            fieldId: "vendorTaxes",
                                            placeholder: "",
                                            // required: true,
                                            // validationMessage: "Please enter the department name!",
                                            selectRecordType: null,
                                            multiple: true
                                        }}
                                        changeHandler={null}
                                        blurHandler={null}
                                    /> */}

                                </Row>
                            </Container>
                        </Tab>
                        <Tab eventKey="accounting" title="ACCOUNTINGS">
                            <Row>
                                <SelectField
                                    control={control}
                                    errors={errors}
                                    field={{
                                        description: "income Account",
                                        label: "INCOME ACCOUNT",
                                        fieldId: "incomeAccount",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the department name!",
                                        selectRecordType: "account",
                                        multiple: false
                                    }}
                                    changeHandler={null}
                                    blurHandler={null}
                                />
                                <SelectField
                                    control={control}
                                    errors={errors}
                                    field={{
                                        description: "Expense Account",
                                        label: "EXPENSE ACCOUNT",
                                        fieldId: "expenseAccount",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the department name!",
                                        selectRecordType: "account",
                                        multiple: false
                                    }}
                                    changeHandler={null}
                                    blurHandler={null}
                                />

                                <SelectField
                                    control={control}
                                    errors={errors}
                                    field={{
                                        description: "Asset Account",
                                        label: "ASSET ACCOUNT",
                                        fieldId: "assetAccount",
                                        placeholder: "",
                                        // required: true,
                                        // validationMessage: "Please enter the department name!",
                                        selectRecordType: "account",
                                        multiple: false
                                    }}
                                    changeHandler={null}
                                    blurHandler={null}
                                />

                            </Row>
                        </Tab>
                        {!isAddMode && <Tab eventKey="auditTrail" title="ADUIT TRAIL">
                            <Container className="mt-2" fluid>
                                {!isAddMode && <LogHistories documentPath={"product"} documentId={id} />}
                            </Container>
                        </Tab>}


                    </Tabs>

                </Container>

            </AppContentBody>
        </AppContentForm>
    )
}
