import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BOM from './BOM';
import BOMList from './BOMList';



export default function BOMApp() {

    return (
        <Routes>
            <Route path={`/`} element={<BOMList />} />
            <Route path={`/list`} element={<BOMList />} />
            <Route path={`/add`} element={<BOM />} />
            <Route path={`/edit/:id`} element={<BOM />} />
        </Routes>
    )
}
