import React, { createContext, useReducer } from "react";
import { CustomerReducer } from "../reducers/CustomerReducer";
import Constants from "../../../helpers/Constants";

export const CustomerContext = createContext();

const storage = localStorage.getItem(Constants.CURRENT_CUSTOMER)
  ? JSON.parse(localStorage.getItem(Constants.CURRENT_CUSTOMER))
  : [];
const initialState = { customer: storage };

function CustomerContextProvider({ children }) {
  const [state, dispatch] = useReducer(CustomerReducer, initialState);

  const addCustomer = (payload) => {
    dispatch({ type: "ADD_CUSTOMER", payload });
  };

  const removeCustomer = (payload) => {
    dispatch({ type: "REMOVE_CUSTOMER", payload });
  };

  const clearCustomer = () => {
    dispatch({ type: "CLEAR_CUSTOMER" });
  };

  const updateCustomer = (payload) => {
    dispatch({ type: "UPDATE_CUSTOMER", payload });
  };

  return (
    <CustomerContext.Provider
      value={{
        addCustomer,
        removeCustomer,
        clearCustomer,
        updateCustomer,
        ...state,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export default CustomerContextProvider;

//Old code
// import React, { createContext, useReducer } from 'react';
// import { CustomerReducer } from '../reducers/CustomerReducer';
// import Constants from "../../../helpers/Constants";

// export const CustomerContext = createContext();

// const storage = localStorage.getItem(Constants.CURRENT_CUSTOMER) ? JSON.parse(localStorage.getItem(Constants.CURRENT_CUSTOMER)) : [];
// const initialState = { customer: storage };

// function CustomerContextProvider({ children }) {

//     const [state, dispatch] = useReducer(CustomerReducer, initialState);

//     const addCustomer = (payload) => {
//         dispatch({ type: 'ADD_CUSTOMER', payload })
//     }

//     const removeCustomer = (payload) => {
//         dispatch({ type: 'REMOVE_CUSTOMER', payload })
//     }

//     const clearCustomer = () => {
//         dispatch({ type: 'CLEAR_CUSTOMER' })
//     }

//     const updateCustomer = (payload) => {
//         dispatch({ type: 'UPDATE_CUSTOMER', payload })
//     }

//     return (
//         <CustomerContext.Provider value={{
//             addCustomer,
//             removeCustomer,
//             clearCustomer,
//             updateCustomer,
//             ...state
//         }} >
//             {children}
//         </CustomerContext.Provider>
//     )
// }

// export default CustomerContextProvider;
