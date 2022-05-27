import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductReceive from './ProductReceive';
import ProductReceiveList from './ProductReceiveList';




export default function ProductReceiveApp() {

    return (
        <Routes>
            <Route path={`/`} element={<ProductReceiveList />} />
            <Route path={`/list`} element={<ProductReceiveList />} />
            <Route path={`/add`} element={<ProductReceive />} />
            <Route path={`/edit/:id`} element={<ProductReceive />} />
        </Routes>
    )
}
