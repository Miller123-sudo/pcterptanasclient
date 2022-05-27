import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductDeliveredist from './ProductDeliveredist';




export default function ProductDeliveredApp() {

    return (
        <Routes>
            <Route path={`/:id`} element={<ProductDeliveredist />} />
            <Route path={`/list/:id`} element={<ProductDeliveredist />} />
        </Routes>
    )
}
