import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import ImportProduct from './ImportProduct';
import Product from './Product';
import ProductList from './ProductList';




export default function ProductApp() {

    return (
        <Routes>
            {/* <Route path={`/importproduct`} element={<ImportProduct />} /> */}
            <Route path={`/`} element={<ProductList />} />
            <Route path={`/list`} element={<ProductList />} />
            <Route path={`/add`} element={<Product />} />
            <Route path={`/edit/:id`} element={<Product />} />
        </Routes>
    )
}
