import { React, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from '../components/states/contexts/UserContext';
import Home from '../components/pages/home/Home';
import Login from '../components/pages/login/Login';
import EmployeeModule from '../modules/_employee/Index';
import CustomAppModule from '../modules/customApp/Index';
import CustomMicroAppModule from '../modules/customMicroApp/Index';
import ForgotPassword from '../components/pages/authentication/ForgotPassword';
import ResetPassword from '../components/pages/authentication/ResetPassword';
import PurchaseModule from '../modules/_purchase/Index';
import AccountingModule from '../modules/_accounting/Index';
import POSModule from '../modules/__pos/Index';
import SalesModule from '../modules/_sales/Index';
import InventoryModule from '../modules/_inventory/Index';
import ManufacturingModule from '../modules/_manufacturing/Index';



export default function AppRoutes() {
    const { user } = useContext(UserContext);
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={user ? <Home /> : <Login />} />
                <Route path='/forgotpassword' element={<ForgotPassword />} />
                <Route path='/resetpassword/:id' element={<ResetPassword />} />
                <Route path='/employees/*' element={<EmployeeModule />} />
                <Route path='/customapps/*' element={<CustomAppModule />} />
                <Route path='custommicroapp/*' element={<CustomMicroAppModule />} />
                <Route path='purchase/*' element={<PurchaseModule />} />
                <Route path='sales/*' element={<SalesModule />} />
                <Route path='accounting/*' element={<AccountingModule />} />
                <Route path="/pos/*" element={<POSModule />} />
                <Route path="/inventory/*" element={<InventoryModule />} />
                <Route path="/manufacturing/*" element={<ManufacturingModule />} />

            </Routes>
        </BrowserRouter>
    )
}
