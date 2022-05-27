import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Brand from './Brand';

export default function BrandApp() {

    return (
        <Routes>
            <Route path={`/`} element={< Brand />} />
            <Route path={`/list`} element={<Brand />} />
            <Route path={`/add`} element={< Brand />} />
            <Route path={`/edit/:id`} element={< Brand />} />
        </Routes>
    )
}