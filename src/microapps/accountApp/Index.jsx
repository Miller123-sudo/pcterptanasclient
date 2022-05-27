import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Account from './Account';
import AccountList from './AccountList';




export default function AccountApp() {

    return (
        <Routes>
            <Route path={`/`} element={<AccountList />} />
            <Route path={`/list`} element={<AccountList />} />
            <Route path={`/add`} element={<Account />} />
            <Route path={`/edit/:id`} element={<Account />} />
        </Routes>
    )
}
