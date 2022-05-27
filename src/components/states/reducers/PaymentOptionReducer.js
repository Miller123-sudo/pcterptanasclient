import React from "react";

export const PaymentOptionReducer = (paymentOptions, action) => {
  switch (action.type) {
    case "ADD_PAYMENT_OPTION":
      return [
        ...paymentOptions,
        {
          _id: action.payload._id,
          mode: action.payload.mode,
          amount: action.payload.amount,
        },
      ];
    case "REMOVE_PAYMENT_OPTION":
      return paymentOptions.filter(
        (paymentOptions) => paymentOptions._id !== action.payload._id
      );
    case "UPDATE_PAYMENT_OPTION_AMOUNT":
      console.log("UPDATE");
      //return paymentOptions.map(paymentOption => paymentOption._id === action.payload._id ? paymentOption.amount = action.amount : paymentOption.amount = paymentOption.amount)
      console.log(paymentOptions);
      const paymentOptionObj =
        paymentOptions[
          paymentOptions.findIndex(
            (paymentOption) => paymentOption._id === action.payload._id
          )
        ];
      console.log(paymentOptionObj);
      paymentOptionObj.amount = action?.amount;
      return paymentOptions;
    case "CLEAR_ALL_PAYMENT_OPTIONS":
      return [];
  }
};

// Old code
// import React from 'react';

// export const PaymentOptionReducer = (paymentOptions, action) => {
//     switch (action.type) {
//         case 'ADD_PAYMENT_OPTION':
//             return [...paymentOptions, { _id: action.payload._id, mode: action.payload.mode, amount: action.payload.amount }]
//         case 'REMOVE_PAYMENT_OPTION':
//             return paymentOptions.filter(paymentOptions => paymentOptions._id !== action.payload._id);
//         case 'UPDATE_PAYMENT_OPTION_AMOUNT':
//             console.log("UPDATE")
//             //return paymentOptions.map(paymentOption => paymentOption._id === action.payload._id ? paymentOption.amount = action.amount : paymentOption.amount = paymentOption.amount)
//             const paymentOptionObj = paymentOptions[paymentOptions.findIndex(paymentOption => paymentOption._id === action.payload._id)];
//             console.log(paymentOptionObj)
//             paymentOptionObj.amount = action.amount;
//             return paymentOptions;
//         case 'CLEAR_ALL_PAYMENT_OPTIONS':
//             return [];
//     }
// }
