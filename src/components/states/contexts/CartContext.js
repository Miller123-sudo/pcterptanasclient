import React, { createContext, useReducer } from "react";
import Constants from "../../../helpers/Constants";
// import { CartReducer, sumItems } from "../reducer/CartReducer";
import { CartReducer, sumItems } from "../reducers/CartReducer";

export const CartContext = createContext();

const storage = localStorage.getItem(Constants.POS_CART)
  ? JSON.parse(localStorage.getItem(Constants.POS_CART))
  : [];
const initialState = {
  cartItems: storage,
  ...sumItems(storage),
  checkout: false,
};

const CartContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(CartReducer, initialState);

  const increase = (payload) => {
    dispatch({ type: "INCREASE", payload });
  };

  const increaseByValue = (payload, value) => {
    dispatch({ type: "INCREASE_BY_VALUE", payload, value });
  };

  const increaseByPrice = (payload, value) => {
    dispatch({ type: "INCREASE_BY_PRICE", payload, value });
  };

  const changeDiscountPercentage = (payload, value) => {
    dispatch({ type: "CHANGE_DISCOUNT_PERCENTAGE", payload, value });
  };

  const changeRefundQuantity = (payload, value) => {
    dispatch({ type: "CHANGE_REFUND_QUANTITY", payload, value });
  };

  const setSalesCode = (payload, value) => {
    dispatch({ type: "SET_SALES_CODE", payload, value });
  };

  const decrease = (payload) => {
    dispatch({ type: "DECREASE", payload });
  };

  const addProduct = (payload) => {
    dispatch({ type: "ADD_ITEM", payload });
  };

  const addQuantity = (payload, quantity) => {
    dispatch({ type: "ADDQUANTITY", payload, quantity });
  };

  const removeProduct = (payload) => {
    dispatch({ type: "REMOVE_ITEM", payload });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR" });
  };

  const handleCheckout = () => {
    dispatch({ type: "CHECKOUT" });
  };

  const contextValues = {
    removeProduct,
    addProduct,
    addQuantity,
    increase,
    increaseByValue,
    increaseByPrice,
    changeDiscountPercentage,
    changeRefundQuantity,
    setSalesCode,
    decrease,
    clearCart,
    handleCheckout,
    ...state,
  };

  return (
    <CartContext.Provider value={contextValues}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;

//Old code
// import React, { createContext, useReducer } from 'react';
// import Constants from "../../../helpers/Constants";
// import { CartReducer, sumItems } from '../reducers/CartReducer';

// export const CartContext = createContext()

// const storage = localStorage.getItem(Constants.POS_CART) ? JSON.parse(localStorage.getItem(Constants.POS_CART)) : [];
// const initialState = { cartItems: storage, ...sumItems(storage), checkout: false };

// const CartContextProvider = ({ children }) => {

//     const [state, dispatch] = useReducer(CartReducer, initialState)

//     const increase = payload => {
//         dispatch({ type: 'INCREASE', payload })
//     }

//     const increaseByValue = (payload, value) => {
//         dispatch({ type: 'INCREASE_BY_VALUE', payload, value })
//     }

//     const increaseByPrice = (payload, value) => {
//         dispatch({ type: 'INCREASE_BY_PRICE', payload, value })
//     }

//     const changeDiscountPercentage = (payload, value) => {
//         dispatch({ type: 'CHANGE_DISCOUNT_PERCENTAGE', payload, value })
//     }

//     const changeRefundQuantity = (payload, value) => {
//         dispatch({ type: 'CHANGE_REFUND_QUANTITY', payload, value })
//     }

//     const decrease = payload => {
//         dispatch({ type: 'DECREASE', payload })
//     }

//     const addProduct = payload => {
//         dispatch({ type: 'ADD_ITEM', payload })
//     }

//     const addQuantity = (payload, quantity) => {
//         dispatch({ type: 'ADDQUANTITY', payload, quantity })
//     }

//     const removeProduct = payload => {
//         dispatch({ type: 'REMOVE_ITEM', payload })
//     }

//     const clearCart = () => {
//         dispatch({ type: 'CLEAR' })
//     }

//     const handleCheckout = () => {
//         dispatch({ type: 'CHECKOUT' })
//     }

//     const contextValues = {
//         removeProduct,
//         addProduct,
//         addQuantity,
//         increase,
//         increaseByValue,
//         increaseByPrice,
//         changeDiscountPercentage,
//         changeRefundQuantity,
//         decrease,
//         clearCart,
//         handleCheckout,
//         ...state
//     }

//     return (
//         <CartContext.Provider value={contextValues} >
//             {children}
//         </CartContext.Provider>
//     );
// }

// export default CartContextProvider;
