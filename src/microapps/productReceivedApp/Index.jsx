import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductReceivedList from './ProductReceivedList';




export default function ProductReceivedApp() {

    return (
        <Routes>
            <Route path={`/:id`} element={<ProductReceivedList />} />
            <Route path={`/list/:id`} element={<ProductReceivedList />} />
        </Routes>
    )
}
