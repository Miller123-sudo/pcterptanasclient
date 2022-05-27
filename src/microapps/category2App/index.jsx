import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Category2 from './Category2';

export default function Category2App() {

    return (
        <Routes>
            <Route path={`/`} element={< Category2 />} />
            <Route path={`/list`} element={<Category2 />} />
            <Route path={`/add`} element={< Category2 />} />
            <Route path={`/edit/:id`} element={< Category2 />} />
        </Routes>
    )
}