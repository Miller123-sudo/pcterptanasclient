import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Role from './Role';
import RoleList from './RoleList';




export default function EmployeeApp() {

    return (
        <Routes>
            <Route path={`/`} element={<RoleList />} />
            <Route path={`/list`} element={<RoleList />} />
            <Route path={`/add`} element={<Role />} />
            <Route path={`/edit/:id`} element={<Role />} />
        </Routes>
    )
}
