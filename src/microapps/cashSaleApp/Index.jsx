import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Order from './Order';
import OrderList from './OrderList';




export default function CashsaleApp() {

    return (
        <Routes>
            <Route path={`/`} element={<OrderList />} />
            <Route path={`/list`} element={<OrderList />} />
            <Route path={`/add`} element={<Order />} />
            <Route path={`/edit/:id`} element={<Order />} />
        </Routes>
    )
}
