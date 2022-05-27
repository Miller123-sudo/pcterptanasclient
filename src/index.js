import 'bootstrap/dist/css/bootstrap.min.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { UserContextProvider } from './components/states/contexts/UserContext';
import CartContextProvider from './components/states/contexts/CartContext';
import CustomerContextProvider from './components/states/contexts/CustomerContext';
import PaymentOptionContextProvider from './components/states/contexts/PaymentOptionContext';
import ApiService from './helpers/ApiServices';
import AppRoutes from './routes/AppRoutes';



ApiService.init();
ReactDOM.render(
  <React.StrictMode>
    <UserContextProvider>
      <CustomerContextProvider>
        <CartContextProvider>
          <PaymentOptionContextProvider>
            <AppRoutes />
          </PaymentOptionContextProvider>
        </CartContextProvider>
      </CustomerContextProvider>
    </UserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

