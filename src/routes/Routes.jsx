import { React, useContext } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import ForgotPassword from '../components/pages/authentication/ForgotPassword';
import ResetPassword from '../components/pages/authentication/ResetPassword';
import Home from '../components/pages/home/Home';
import Login from '../components/pages/login/Login';
import { UserContext } from '../components/states/contexts/UserContext';
import AccountingRoutes from '../modules/accounting/Index';
import Employee from '../modules/employee/employee/Employee';
import { EmployeeRoutes } from '../modules/employee/Index';
import InventoryRoutes from '../modules/inventory/Index';
import ManufacturingRoutes from '../modules/manufacturing/Index';
import { PurchaseRoutes } from '../modules/purchase/Index';
import { ReportingRoutes } from '../modules/reporting/Index';
import SalesRoutes from '../modules/sales/Index';
import POSRoutes from '../modules/pos/Index';
import ItemCategoryRoutes from '../modules/itemCategories';
import { CompanyRoutes } from '../modules/settings/company/Index';
import SettingsRoutes from '../modules/settings/Index';

export default function Routes() {
    const { user } = useContext(UserContext);
    console.log(user);

    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    {/* <Home /> */}
                    {user ? <Home /> : <Login />}
                </Route>
                <Route exact path="/login">
                    {/* <Home /> */}
                    <Login />
                </Route>
                <Route path="/forgotpassword">
                    <ForgotPassword />
                </Route>

                <Route path="/resetpassword/:id">
                    <ResetPassword />
                </Route>
                <Route path="/purchase">
                    {user ? <PurchaseRoutes /> : <Login />}
                </Route>
                <Route path="/employees">
                    {user ? <EmployeeRoutes /> : <Login />}
                </Route>
                <Route path="/sales">
                    {user ? <SalesRoutes /> : <Login />}
                </Route>
                <Route path="/manufacturings">
                    {user ? <ManufacturingRoutes /> : <Login />}
                </Route>

                <Route path="/inventory">
                    {user ? <InventoryRoutes /> : <Login />}
                </Route>

                <Route path="/accountings">
                    {user ? <AccountingRoutes /> : <Login />}
                </Route>

                <Route path="/reporting">
                    {user ? <ReportingRoutes /> : <Login />}
                </Route>

                <Route path="/pos">
                    {user ? <POSRoutes /> : <Login />}
                </Route>

                <Route path="/settings">
                    {user ? <SettingsRoutes /> : <Login />}
                </Route>
                {/* <Route path="/itemcategory">{user ? <ItemCategoryRoutes /> : <Login />}</Route> */}



            </Switch>
        </Router>
    )
}
