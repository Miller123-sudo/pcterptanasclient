import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Department from './Department';
import DepartmentList from './DepartmentList';




export default function DepartmentApp() {

    return (
        <Routes>
            <Route path={`/`} element={<DepartmentList />} />
            <Route path={`/list`} element={<DepartmentList />} />
            <Route path={`/add`} element={<Department />} />
            <Route path={`/edit/:id`} element={<Department />} />
        </Routes>
    )
}
