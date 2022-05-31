import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Category from './Category';
import CategoryList from './CategoryList';




export default function CategoryApp() {

    return (
        <Routes>
            <Route path={`/`} element={< CategoryList />} />
            <Route path={`/list`} element={< CategoryList />} />
            <Route path={`/add`} element={< Category />} />
            <Route path={`/edit/:id`} element={< Category />} />
        </Routes>
    )
}
