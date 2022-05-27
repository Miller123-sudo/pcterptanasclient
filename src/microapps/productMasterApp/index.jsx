import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductMaster from './ProductMaster';

export default function ProductMasterApp() {

    return (
        <Routes>
            <Route path={`/`} element={< ProductMaster />} />
            <Route path={`/list`} element={<ProductMaster />} />
            <Route path={`/add`} element={< ProductMaster />} />
            <Route path={`/edit/:id`} element={< ProductMaster />} />
        </Routes>
    )
}