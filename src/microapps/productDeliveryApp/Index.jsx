import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductDelivery from './ProductDelivery';
import ProductDeliveryList from './ProductDeliveryList';




export default function ProductDeliveryApp() {

    return (
        <Routes>
            <Route path={`/`} element={<ProductDeliveryList />} />
            <Route path={`/list`} element={<ProductDeliveryList />} />
            <Route path={`/add`} element={<ProductDelivery />} />
            <Route path={`/edit/:id`} element={<ProductDelivery />} />
        </Routes>
    )
}
