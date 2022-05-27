import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ApiService from '../../helpers/ApiServices';
import { errorMessage } from '../../helpers/Utils';
import CompanyList from './CompanyList';
import Company from './Conpany';

export default function CompanyApp() {


    return (
        <Routes>
            {/* <Route path={`/edit/:id`} element={< Company />} />
            <Route path={`/list`} element={<CompanyList />} /> */}
            {/* <Route path={`/add`} element={< Company />} /> */}
            <Route path={`/`} element={< Company />} />
        </Routes>
    )
}