import React, { Children, createContext, useReducer } from "react";
import { PaymentOptionReducer } from "../reducers/PaymentOptionReducer";

export const PaymentOptionContext = createContext();

// const PaymentOptionReducer = (paymentOptions, action) => {
//     switch (action.type) {
//         case 'ADD_PAYMENT_OPTION':
//             return [...paymentOptions, { id: action.payload._id, mode: action.payload.mode, amount: action.payload.amount }]
//         case 'REMOVE_PAYMENT_OPTION':
//             return paymentOptions.filter(paymentOptions => paymentOptions._id !== action.payload._id);
//     }
// }

// const initialValue = [];

export default function PaymentOptionContextProvider({ children }) {
  const [paymentOptions, dispatch] = useReducer(PaymentOptionReducer, []);

  const addPaymentOptions = (payload) => {
    dispatch({ type: "ADD_PAYMENT_OPTION", payload });
  };

  const removePaymentOptions = (payload) => {
    dispatch({ type: "REMOVE_PAYMENT_OPTION", payload });
  };

  const updatePaymentOptionAmount = (payload, amount) => {
    dispatch({ type: "UPDATE_PAYMENT_OPTION_AMOUNT", payload, amount });
  };

  const clearAllPaymentOptions = () => {
    dispatch({ type: "CLEAR_ALL_PAYMENT_OPTIONS" });
  };

  return (
    <PaymentOptionContext.Provider
      value={{
        addPaymentOptions,
        removePaymentOptions,
        updatePaymentOptionAmount,
        clearAllPaymentOptions,
        paymentOptions,
      }}
    >
      {children}
    </PaymentOptionContext.Provider>
  );
}

//Old code
// import React, { Children, createContext, useReducer } from 'react';
// import { PaymentOptionReducer } from '../reducers/PaymentOptionReducer';

// export const PaymentOptionContext = createContext();

// // const PaymentOptionReducer = (paymentOptions, action) => {
// //     switch (action.type) {
// //         case 'ADD_PAYMENT_OPTION':
// //             return [...paymentOptions, { id: action.payload._id, mode: action.payload.mode, amount: action.payload.amount }]
// //         case 'REMOVE_PAYMENT_OPTION':
// //             return paymentOptions.filter(paymentOptions => paymentOptions._id !== action.payload._id);
// //     }
// // }

// // const initialValue = [];

// export default function PaymentOptionContextProvider({ children }) {
//     const [paymentOptions, dispatch] = useReducer(PaymentOptionReducer, []);

//     const addPaymentOptions = (payload) => {
//         dispatch({ type: 'ADD_PAYMENT_OPTION', payload });
//     }

//     const removePaymentOptions = (payload) => {
//         dispatch({ type: 'REMOVE_PAYMENT_OPTION', payload })
//     }

//     const updatePaymentOptionAmount = (payload, amount) => {
//         dispatch({ type: 'UPDATE_PAYMENT_OPTION_AMOUNT', payload, amount })
//     }

//     const clearAllPaymentOptions = () => {
//         dispatch({ type: 'CLEAR_ALL_PAYMENT_OPTIONS' });
//     }

//     return <PaymentOptionContext.Provider value={{
//         addPaymentOptions,
//         removePaymentOptions,
//         updatePaymentOptionAmount,
//         clearAllPaymentOptions,
//         paymentOptions
//     }}>
//         {children}
//     </PaymentOptionContext.Provider>;
// }
