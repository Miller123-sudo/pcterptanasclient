import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SizeList from './SizeList';

export default function SizeListApp() {

    return (
        <Routes>
            <Route path={`/`} element={< SizeList />} />
            <Route path={`/list`} element={<SizeList />} />
            <Route path={`/add`} element={< SizeList />} />
            <Route path={`/edit/:id`} element={< SizeList />} />
        </Routes>
    )
}