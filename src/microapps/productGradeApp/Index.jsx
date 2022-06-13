import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductGrade from './ProductGrade';




export default function ProductGradeApp() {

    return (
        <Routes>
            {/* <Route path={`/importproduct`} element={<ImportProduct />} /> */}
            <Route path={`/`} element={<ProductGrade />} />
            <Route path={`/list`} element={<ProductGrade />} />
            <Route path={`/add`} element={<ProductGrade />} />
            <Route path={`/edit/:id`} element={<ProductGrade />} />
        </Routes>
    )
}
