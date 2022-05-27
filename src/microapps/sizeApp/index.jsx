import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Size from './Size';

export default function SizeApp() {

    return (
        <Routes>
            <Route path={`/`} element={< Size />} />
            <Route path={`/list`} element={<Size />} />
            <Route path={`/add`} element={< Size />} />
            <Route path={`/edit/:id`} element={< Size />} />
        </Routes>
    )
}