import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Category1 from './Category1';

export default function Category1App() {

    return (
        <Routes>
            <Route path={`/`} element={< Category1 />} />
            <Route path={`/list`} element={<Category1 />} />
            <Route path={`/add`} element={< Category1 />} />
            <Route path={`/edit/:id`} element={< Category1 />} />
        </Routes>
    )
}