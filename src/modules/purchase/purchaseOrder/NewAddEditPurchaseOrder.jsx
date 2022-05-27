import { React, useContext, useState, useEffect } from 'react';
import { BsTrash } from 'react-icons/bs';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, FormSelect } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'
import { useHistory, useParams } from 'react-router';
import ApiService from '../../../helpers/ApiServices';
import { formatNumber } from '../../../helpers/Utils';
import { Select, Tag } from 'antd';
// import { UserContext } from '../../states/contexts/UserContext';
import swal from 'sweetalert';
import { UserContext } from '../../../components/states/contexts/UserContext';
const { Option } = Select;

const options = [{ value: 'GST 5%' }, { value: 'GST 5% (RC)' }, { value: 'IGST 1%' }, { value: 'IGST 2%' }];

export default function AddEditPurchaseOrder() {
    const { user } = useContext(UserContext)
    const [state, setstate] = useState({ total: 0 });
    const [supplierList, setSupplierList] = useState([]);
    const [productList, setProductList] = useState([])
    const [tabKey, setTabKey] = useState('products');
    const [productMasterList, setProductMasterList] = useState([])
    const [groupMasterList, setGroupMasterList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [firstCategoryList, setFirstCategoryList] = useState([])
    const [secondCategoryList, setSecondCategoryList] = useState([])
    const [sizeList, setSizeList] = useState([])
    const [accountList, setAccountList] = useState([])
    const [hsnCodeList, setHsnCode] = useState([])

    const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            vendor: null,
            total: 0,
            billingStatus: 'Nothing to Bill',
            orderDeadline: new Date().toISOString().split("T")[0],
            productMaster: null,
            groupMaster: null,
            brand: null,
            firstCategory: null,
            secondCategory: null,
            size: null,
            itemQty: 0
        }
    });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });

    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.post('/purchaseOrder', data).then(response => {
            if (response.data.isSuccess) {
                history.push("/purchase/orders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/purchaseOrder/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                history.push("/purchase/orders");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/purchaseOrder/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                history.push("/purchase/orders");
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const handleReceiveProducts = () => {
        console.log(state.productReceipts)
        history.push("/purchase/receivedproduct/" + state.productReceipts);
    }

    const handleCreateBill = async () => {
        console.log(state);
        //`/purchase/supplierbill/${state.id}`
        const response = await ApiService.post('bill', { purchaseOrder: state.id });
        if (response.data.isSuccess) {
            await ApiService.patch('purchaseorder/' + state.id, { billingStatus: 'Fully Billed' })
            history.push("/purchase/bill/" + response.data.document.id);
        }
    }

    const handleVendorBill = async () => {
        console.log(state)
        history.push("/purchase/bill/" + state.vendorBill);

    }

    const handlePrintOrder = async () => {

        // setisPrint(false)
        let itemObjects = new Array();
        // console.log(state);
        state.products.map(async (item) => {
            let newObject = new Object();
            let itemData = await ApiService.get(`product/${item.product}`);

            newObject.product = itemData.data.document.name;
            newObject.quantity = item.quantity;
            newObject.unitPrice = item.unitPrice;
            newObject.subTotal = item.subTotal;
            newObject.description = item.description;
            itemObjects.push(newObject);
        })

        const supplierData = await ApiService.get(`vendor/${state.vendor}`)
        const POData = await ApiService.get(`purchaseOrder/${id}`)
        var doc = new jsPDF('p', "pt", "a4");

        doc.setFontSize(12);
        doc.text("Ship Address:", 40, 65);
        // doc.line(40, 68, 90, 68)
        doc.setFontSize(9);
        doc.text(`PBTI, \nWebel Software, Ground Floor, DN Block, Sector V, West Bengal 700091`, 40, 80);

        doc.setFontSize(12);
        doc.text("Vendor Address:", 400, 65)
        doc.setFontSize(9);
        doc.text(`${supplierData.data.document.address}`, 400, 80);

        doc.setFontSize(19)
        doc.text(`Purchase Order: #PO0000${POData.data.document.purchaseOrderId}`, 40, 140)

        doc.setFontSize(12);
        doc.text("Purchase Representative", 40, 160)
        doc.setFontSize(9);
        doc.text(`${user.name}`, 40, 170);

        doc.setFontSize(12);
        doc.text("Order Date", 400, 160)
        doc.setFontSize(9);
        doc.text(`${POData.data.document.orderDeadline?.slice(0, 10)}`, 400, 170);

        let height = 0;

        // Create the table of products data
        doc.autoTable({
            margin: { top: 220 },
            styles: {
                lineColor: [44, 62, 80],
                lineWidth: 1,
            },
            columnStyles: {
                europe: { halign: 'center' },
                0: { cellWidth: 88 },
                2: { cellWidth: 40 },
                3: { cellWidth: 57 },
                4: { cellWidth: 65 },
            }, // European countries centered
            body: itemObjects,
            columns: [
                { header: 'Product', dataKey: 'product' },
                { header: 'Description', dataKey: 'description' },
                { header: 'Qty', dataKey: 'quantity' },
                { header: 'UnitPrice', dataKey: 'unitPrice' },
                { header: 'Sub Total', dataKey: 'subTotal' },
            ],
            didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
        })

        console.log(height);
        let h = height + 30;

        doc.setFontSize(19);
        doc.text(`Total: ${state.total}`, 400, h);

        doc.save(`Purchase Order - ${state.name}.pdf`);

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
        // console.log(formData);
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
        let itemId;
        if (itemName !== '') {
            await ApiService.get(`product/search/${itemName}`)
                .then(async response => {
                    if (response.data.isSuccess && response.data.document.length > 0) {
                        itemId = await response.data.document[0].id
                        await updateProductList();
                    }
                    else {
                        let itemObj = {
                            name: itemName
                        }

                        if (accountList) {
                            let incomeAccount = accountList.find(account => account.title == "Sales")
                            let assetAccount = accountList.find(account => account.title == "Inventory Asset")
                            let expenseAccount = accountList.find(account => account.title == "Labour charge")

                            if (incomeAccount && assetAccount && expenseAccount) {
                                itemObj[incomeAccount] = incomeAccount._id
                                itemObj[assetAccount] = assetAccount._id
                                itemObj[expenseAccount] = expenseAccount._id
                            }
                        }

                        if (hsnCodeList) {
                            let hsnCode = hsnCodeList.find(hsncode => hsncode.name === '0406')
                            itemObj['HSNSACS'] = hsnCode._id
                            itemObj['cgstRate'] = hsnCode.cgst
                            itemObj['sgstRate'] = hsnCode.sgst
                            itemObj['igstRate'] = hsnCode.igst
                        }

                        console.log(itemObj);

                        await ApiService.post(`product`, itemObj)
                            .then(async secondResponse => {
                                if (secondResponse.data.isSuccess) {
                                    itemId = await secondResponse.data.document.id;
                                    await updateProductList();
                                }
                            })
                            .catch(err => console.log(err))
                        setValue('itemName', itemName)
                        let productListLength = formData.products.length
                        let itemAlreadyPresent = formData.products.findIndex(element => element.product === itemId);
                        let categoryQty = formData.itemQty
                        if (itemAlreadyPresent === -1) {
                            itemAppend({})
                            setValue(`products.${productListLength}.product`, itemId)
                            categoryQty ? setValue(`products.${productListLength}.quantity`, formData.itemQty) : setValue(`products.${productListLength}.quantity`, 0)
                        }
                        else {
                            swal({
                                title: "Item already present in line",
                                text: "Quantity will be added. Do you want to proceed?",
                                buttons: true
                            }).then(data => {
                                if (data) {
                                    let lineData = getValues(`products.${itemAlreadyPresent}`)
                                    setValue(`products.${itemAlreadyPresent}.quantity`, parseFloat(formData.itemQty) + parseFloat(lineData.quantity))
                                }
                            })
                        }
                    }
                })
                .catch(err => console.log(err))
        }
    }

    const updateProductList = async () => {
        const productResponse = await ApiService.get('product');
        console.log(productResponse.data.documents)

        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
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
        return itemName
    }

    const resetItemCategory = () => {
        reset({ ...getValues(), "productMaster": {}, "groupMaster": {}, "brand": {}, "firstCategory": {}, "secondCategory": {}, "size": {}, "itemQty": 0 })
    }

    useEffect(async () => {
        const supplierResponse = await ApiService.get('vendor');
        console.log(supplierResponse.data.documents)
        if (supplierResponse.data.isSuccess) {
            setSupplierList(supplierResponse.data.documents)
        }

        const productResponse = await ApiService.get('product');
        console.log(productResponse.data.documents)

        if (productResponse.data.isSuccess) {
            setProductList(productResponse.data.documents)
        }

        const getAccounts = async () => {
            await ApiService.get('account').then(response => {
                if (response.data.isSuccess) {
                    setAccountList(response.data.document)
                }
            }).catch(err => console.log(err))
        }

        const getHSNCodes = async () => {
            await ApiService.get('hsncode').then(response => {
                if (response.data.isSuccess) {
                    setHsnCode(response.data.documents)
                }
            }).catch(err => console.log(err))
        }

        const getAllProductMaster = async () => {
            await ApiService.get('itemCategory/search?type=productMaster').then(response => {
                if (response.data.isSuccess) {
                    setProductMasterList(response.data.document)
                }
            }).catch(err => console.log(err))
        }

        getHSNCodes();
        getAccounts();
        getAllProductMaster();

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`purchaseOrder/${id}`).then(response => {
                const purchaseOrder = response.data.document;
                setstate(purchaseOrder)
                reset(purchaseOrder);
                if (purchaseOrder.orderDeadline) {
                    setValue('orderDeadline', purchaseOrder.orderDeadline.split("T")[0])
                    setValue('vendor', purchaseOrder.vendor)
                }

            }).catch(e => {
                console.log(e)
            })
        }

    }, []);
    let grandtot = 0;

    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Form onSubmit={handleSubmit(onSubmit)} className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 mt-2 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col>
                            <h3>{isAddMode ? "Purchase Orders" : state.name}</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button type="submit" variant="primary" size="sm">SAVE</Button>{" "}
                            <Button as={Link} to="/purchase/orders" variant="light" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>

                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <Row className="p-0 mb-2 m-0">
                        <Col>
                            <ButtonGroup size="sm">
                                {!isAddMode && state.billingStatus == "Nothing to Bill" ? <Button variant="primary" onClick={handleReceiveProducts}>RECEIVE PRODUCTS</Button> : ""}
                                {!isAddMode && state.billingStatus == "Waiting Bills" ? <Button onClick={handleCreateBill} variant="primary">CREATE BILL</Button> : ""}
                                {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT ORDER</Button>}
                                {/* <Button variant="light">CANCEL</Button>
                                <Button variant="light">LOCK</Button> */}
                            </ButtonGroup>
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'end' }}>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.billingStatus == "Fully Billed" ? <Button size="sm" onClick={handleVendorBill} varient="primary">1 Vendor Bills</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && state.billingStatus !== "Nothing to Bill" ? <Button size="sm" onClick={handleReceiveProducts} varient="primary">1 Receipt</Button> : ""}
                            </div>
                            <div className="m-2 d-flex justify-content-end">
                                {!isAddMode && <div class="" style={{ padding: '5px 20px', backgroundColor: '#2ECC71', color: 'white' }}>{state.billingStatus}</div>}
                            </div>
                        </Col>
                    </Row>
                    <Container className="mt-2" fluid>
                        <Row>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Purchase Order</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="name"
                                    name="name"
                                    disabled={true}
                                    {...register("name")}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Vendor Name</Form.Label>
                                <Form.Select className="selectpicker" id="vendor" name="vendor" {...register("vendor", { required: true })}>
                                    <option value={null}>Choose..</option>
                                    {supplierList.map((element, index) => {
                                        // return <option key={index} data-tokens={element.id}>{element.name}</option>
                                        return <option key={index} value={element.id}>{element.name}</option>
                                    })}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="4" className="mb-2">
                                <Form.Label className="m-0">Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    id="orderDeadline"
                                    name="orderDeadline"
                                    {...register("orderDeadline")} />
                            </Form.Group>
                        </Row>
                        <Card className="card">
                            <Card.Header className="title">Item Category</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control type="text" id="itemName" name="itemName" {...register("itemName")} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Product Master</Form.Label>
                                        <FormSelect id="productMaster" name="productMaster" {...register("productMaster")} onChange={event => filterCategory(event)}  >
                                            <option value={null} selected>Choose..</option>
                                            {productMasterList && productMasterList.map((value, index) => {
                                                return <option key={index} value={value.id}>{value.name}</option>
                                            })}
                                        </FormSelect>
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Group Master</Form.Label>
                                        <FormSelect id="groupMaster" name="groupMaster" {...register("groupMaster")} onChange={event => filterCategory(event)} >
                                            <option value={null} selected>Choose..</option>
                                            {groupMasterList && groupMasterList.map((value, index) => {
                                                return <option key={index} value={value.id}>{value.name}</option>
                                            })}
                                        </FormSelect>
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Brand</Form.Label>
                                        <FormSelect id="brand" name="brand" {...register("brand")} onChange={event => filterCategory(event)} >
                                            <option value={null} selected>Choose..</option>
                                            {brandList && brandList.map((value, index) => {
                                                return <option key={index} value={value.id}>{value.name}</option>
                                            })}
                                        </FormSelect>
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>First Category</Form.Label>
                                        <FormSelect id="firstCategory" name="firstCategory" {...register("firstCategory")} onChange={event => filterCategory(event)} >
                                            <option value={null} selected>Choose..</option>
                                            {firstCategoryList && firstCategoryList.map((value, index) => {
                                                return <option key={index} value={value.id}>{value.name}</option>
                                            })}
                                        </FormSelect>
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Second Category</Form.Label>
                                        <FormSelect id="secondCategory" name="secondCategory" {...register("secondCategory")} onChange={event => filterCategory(event)} >
                                            <option value={null} selected>Choose..</option>
                                            {secondCategoryList && secondCategoryList.map((value, index) => {
                                                return <option key={index} value={value.id}>{value.name}</option>
                                            })}
                                        </FormSelect>
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Size</Form.Label>
                                        <FormSelect id="size" name="size" {...register("size")} >
                                            <option value={null} selected>Choose..</option>
                                            {sizeList && sizeList.map((value, index) => {
                                                return <option key={index} value={value.id}>{value.name}</option>
                                            })}
                                        </FormSelect>
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Quantity</Form.Label>
                                        <Form.Control type="number" min="0" id="itemQty" name="itemQty" {...register("itemQty")} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" as={Col}>
                                        <Form.Label>Age</Form.Label>
                                        <Form.Control type="number" min="0" id="age" name="age" {...register("age")} />
                                    </Form.Group>
                                </Row>
                            </Card.Body>
                            <Card.Footer>
                                <Button type="button" size="sm" onClick={generateItemName}>Add</Button>
                                <Button type="button" variant="btn btn-outline-secondary" size="sm" onClick={resetItemCategory}>Reset</Button>
                            </Card.Footer>
                        </Card>
                    </Container>
                    <Container fluid>
                        <Tabs id="controlled-tab-example" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
                            <Tab eventKey="products" title="Products">
                                <Card>
                                    <Card.Header>Products</Card.Header>
                                    <Card.Body className="card-scroll">
                                        <Table responsive striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "16rem" }}>Product</th>
                                                    <th style={{ minWidth: "16rem" }}>Description</th>
                                                    <th style={{ minWidth: "16rem" }}>Quantity</th>
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Received</th>}
                                                    {!isAddMode && <th style={{ minWidth: "16rem" }}>Billed</th>}
                                                    <th style={{ minWidth: "16rem" }}>Unit Rate</th>
                                                    <th style={{ minWidth: "16rem" }}>Amount</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemFields.map((field, index) => {
                                                    return (<tr key={field.id}>
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Select id="product" name="product" {...register(`products.${index}.product`, { required: true })}
                                                                    onChange={async (e) => {
                                                                        const product = await ApiService.get('product/' + e.target.value);
                                                                        setValue(`products.${index}.account`, product.data.document.assetAccount);
                                                                        setValue(`products.${index}.quantity`, 1);
                                                                        setValue(`products.${index}.description`, product.data.document.description);
                                                                        setValue(`products.${index}.unitPrice`, product.data.document.cost);

                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));

                                                                        let cumulativeSum = 0;

                                                                        const vals = getValues('products')
                                                                        console.log(vals);
                                                                        vals.map((val) => {
                                                                            cumulativeSum += parseFloat(val.subTotal);
                                                                        })
                                                                        setValue("total", cumulativeSum);
                                                                        setstate(prevState => ({
                                                                            // object that we want to update
                                                                            ...prevState,    // keep all other key-value pairs
                                                                            total: cumulativeSum       // update the value of specific key

                                                                        }));

                                                                    }}>
                                                                    <option value={null}></option>
                                                                    {productList.map(element => {
                                                                        return <option value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Select>
                                                                {/* <Form.Control as="select" id="product" {...register(`products.${index}.product`)}
                                                                    onChange={async (e) => {
                                                                        const product = await ApiService.get('product/' + e.target.value);
                                                                        setValue(`products.${index}.units`, product.data.document.units);
                                                                        setValue(`products.${index}.rate`, product.data.document.basePrice);
                                                                        setValue(`products.${index}.description`, product.data.document.productDescription);
                                                                    }} >
                                                                    <option value={null}>Choose..</option>
                                                                    {productList && productList.map((element, index) => {
                                                                        return <option key={index} value={element.id}>{element.name}</option>
                                                                    })}
                                                                </Form.Control> */}
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="text"
                                                                    id="description"
                                                                    name="description"
                                                                    {...register(`products.${index}.description`)} />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="quantity"
                                                                    name="quantity"
                                                                    {...register(`products.${index}.quantity`)}
                                                                    onBlur={(e) => {
                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]));

                                                                        let cumulativeSum = 0;

                                                                        const vals = getValues('products')
                                                                        console.log(vals);
                                                                        vals.map((val) => {
                                                                            cumulativeSum += parseFloat(val.subTotal);
                                                                        });
                                                                        console.log(cumulativeSum)
                                                                        setValue("total", cumulativeSum);
                                                                        setstate(prevState => ({
                                                                            // object that we want to update
                                                                            ...prevState,    // keep all other key-value pairs
                                                                            total: cumulativeSum       // update the value of specific key

                                                                        }));
                                                                        console.log("New State", state)

                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </td>
                                                        {!isAddMode && <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="number"
                                                                    id="received"
                                                                    name="received"
                                                                    {...register(`products.${index}.received`)} />
                                                            </Form.Group>
                                                        </td>}
                                                        {!isAddMode && <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    type="text"
                                                                    id="billed"
                                                                    name="billed"
                                                                    {...register(`products.${index}.billed`)} />
                                                            </Form.Group>
                                                        </td>}
                                                        <td>
                                                            <Form.Group>
                                                                <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="unitPrice"
                                                                    name="unitPrice"
                                                                    {...register(`products.${index}.unitPrice`)}
                                                                    onBlur={() => {
                                                                        const values = getValues([`products.${index}.unitPrice`, `products.${index}.quantity`])
                                                                        console.log(values);
                                                                        setValue(`products.${index}.subTotal`, parseFloat(values[0]) * parseInt(values[1]))

                                                                        const vals = getValues('products')
                                                                        console.log(vals);
                                                                        vals.map((val) => {
                                                                            grandtot = grandtot + parseFloat(val.subTotal);
                                                                            console.log(grandtot);
                                                                        })
                                                                        setValue("total", grandtot)

                                                                        setstate(prevState => ({
                                                                            // object that we want to update
                                                                            ...prevState,    // keep all other key-value pairs
                                                                            total: grandtot       // update the value of specific key

                                                                        }));
                                                                    }}
                                                                >
                                                                    {/* <option value={null}>Choose..</option>
                                                                    {unitList && unitList.map((element, index) => {
                                                                        return <option key={index} value={element._id}>{element.value}</option>
                                                                    })} */}
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </td>


                                                        <td>
                                                            <Form.Group >
                                                                <Form.Control
                                                                    step="0.001"
                                                                    type="number"
                                                                    id="subTotal"
                                                                    name="subTotal"
                                                                    {...register(`products.${index}.subTotal`)} />
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Button size="sm" variant="light"
                                                                onClick={() => {
                                                                    itemRemove(index)

                                                                    const vals = getValues('products')
                                                                    console.log(vals);
                                                                    vals.map((val) => {
                                                                        grandtot = grandtot + parseFloat(val.subTotal);
                                                                        console.log(grandtot);
                                                                    })
                                                                    setValue("total", grandtot);
                                                                    setstate(prevState => ({
                                                                        // object that we want to update
                                                                        ...prevState,    // keep all other key-value pairs
                                                                        total: grandtot       // update the value of specific key

                                                                    }));

                                                                }}
                                                            ><BsTrash /></Button>
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="14">
                                                        <Button size="sm" style={{ minWidth: "8rem" }} onClick={() => itemAppend({ product: null, description: '', quantity: 1, unitPrice: 0, subTotal: 0 })} >Add a product</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                    </Container>
                    <Container className="mt-4 mb-4" fluid>
                        <Row>
                            <Col sm="12" md="8">
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control as="textarea" id="termsAndConditions" name="termsAndConditions" {...register("termsAndConditions")} placeholder="Define your terms and conditions" rows={3} />
                                </Form.Group>
                            </Col>
                            <Col sm="12" md="4">
                                <Card>
                                    {/* <Card.Header as="h5">Featured</Card.Header> */}
                                    <Card.Body>

                                        <Row style={{ textAlign: 'right', fontSize: '20px' }}>
                                            <Col>Total:</Col>
                                            <Col style={{ borderTop: '1px solid black' }}>{formatNumber(state.total)}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Container>
            </Form>
        </Container>
    )
}

function tagRender(props) {
    const colours = [{ value: 'gold' }, { value: 'lime' }, { value: 'green' }, { value: 'cyan' }];
    const random = Math.floor(Math.random() * colours.length);

    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = event => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag
            color={colours[random].value}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}>
            {label}
        </Tag>
    );
}
