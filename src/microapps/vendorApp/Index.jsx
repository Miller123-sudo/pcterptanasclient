import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Vendor from './Vendor';
import VendorList from './VendorList';




export default function VendorApp() {

    return (
        <Routes>
            <Route path={`/`} element={<VendorList />} />
            <Route path={`/list`} element={<VendorList />} />
            <Route path={`/add`} element={<Vendor />} />
            <Route path={`/edit/:id`} element={<Vendor />} />
        </Routes>
    )
}
