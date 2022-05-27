import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChangePassword from './ChangePassword';
import Employee from './Employee';
import EmployeeList from './EmployeeList';




export default function EmployeeApp() {

    return (
        <Routes>
            <Route path={`/`} element={<EmployeeList />} />
            <Route path={`/list`} element={<EmployeeList />} />
            <Route path={`/add`} element={<Employee />} />
            <Route path={`/edit/:id`} element={<Employee />} />
            <Route path={`/changepassword/:id`} element={<ChangePassword />} />
        </Routes>
    )
}
