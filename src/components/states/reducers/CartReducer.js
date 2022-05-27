import Constants from "../../../helpers/Constants";

const Storage = (cartItems) => {
  localStorage.setItem(
    Constants.POS_CART,
    JSON.stringify(cartItems.length > 0 ? cartItems : [])
  );
};

export const sumItems = (cartItems) => {
  if (!cartItems) return;
  Storage(cartItems);



  let itemCount = cartItems?.reduce(
    (total, product) => (parseFloat(parseFloat(total) + parseFloat(product.quantity))).toFixed(2),
    0
  );
  let total = cartItems
    .reduce(
      (total, product) =>
        total +
        (product.salesPrice * product.quantity -
          ((product.salesPrice * product.quantity) / 100) *
          product.discountPercentage),
      0
    )
    .toFixed(2);
  let taxes = cartItems
    .reduce(
      (total, product) =>
        total + (((product.salesPrice * product.quantity) / 100) * 5),
      0
    )
    .toFixed(2);
  let totalDiscount = cartItems
    .reduce(
      (total, product) =>
        total + ((product.salesPrice * product.quantity) / 100) *
        product.discountPercentage,
      0
    )
    .toFixed(2);
  let totalWithTaxes = cartItems
    .reduce(
      (total, product) =>
        total +
        (product.salesPrice * product.quantity -
          ((product.salesPrice * product.quantity) / 100) *
          product.discountPercentage +
          ((product.salesPrice * product.quantity) / 100) * 5),
      0
    )
    .toFixed(2);
  return { itemCount, total, taxes, totalDiscount, totalWithTaxes };


};

export const CartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      if (!state.cartItems.find((item) => item._id === action.payload._id)) {
        state.cartItems.push({
          ...action.payload,
          quantity: action.payload.quantity ? action.payload.quantity : 1,
          discountPercentage: 0,
          refundQuantity: 0,
          salesCode: 'N/A'
        });

        state.cartItems[
          state.cartItems.findIndex((item) => item._id === action.payload._id)
        ].onHand--;
      }

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        ...sumItems(
          state.cartItems.filter((item) => item._id !== action.payload._id)
        ),
        cartItems: [
          ...state.cartItems.filter((item) => item._id !== action.payload._id),
        ],
      };
    case "INCREASE":
      const incObj =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(state);
      console.log(incObj.quantity); // BEFORE
      const updatedQuantity = parseFloat(parseFloat(incObj.quantity) + 1.00).toFixed(2);
      incObj.quantity = updatedQuantity;
      console.log(incObj.quantity); //AFTER
      incObj.onHand--;

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "INCREASE_BY_VALUE":
      const incObj2 =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(incObj2?.quantity);
      incObj2.quantity = parseFloat(action.value).toFixed(2);
      console.log(incObj2?.quantity);
      incObj2.onHand--;

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "INCREASE_BY_PRICE":
      const incObj3 =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(incObj3?.salesPrice);
      incObj3.salesPrice = parseFloat(action.value).toFixed(2);
      console.log(incObj3?.salesPrice);
      // incObj2.onHand--;

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "CHANGE_DISCOUNT_PERCENTAGE":
      const incObj4 =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(incObj4?.discountPercentage);
      incObj4.discountPercentage = parseFloat(action.value).toFixed(2);
      console.log(incObj4?.discountPercentage);
      // incObj2.onHand--;

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "CHANGE_REFUND_QUANTITY":
      const incObj5 =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(incObj5?.refundQuantity);
      incObj5.refundQuantity = parseInt(action.value);
      console.log(incObj5?.refundQuantity);
      // incObj2.onHand--;

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "SET_SALES_CODE":
      const incObj6 =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(incObj6?.salesCode);
      incObj6.salesCode = action.value;
      console.log(incObj6?.salesCode);
      // incObj2.onHand--;

      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "ADDQUANTITY":
      const addObj =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      console.log(action.quantity);
      addObj.quantity = addObj.quantity + action.quantity;
      console.log(action.quantity);
      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "DECREASE":
      const decObj =
        state.cartItems[
        state.cartItems.findIndex((item) => item._id === action.payload._id)
        ];
      decObj.quantity--;
      decObj.onHand++;
      return {
        ...state,
        ...sumItems(state.cartItems),
        cartItems: [...state.cartItems],
      };
    case "CHECKOUT":
      return {
        cartItems: [],
        checkout: true,
        ...sumItems([]),
      };
    case "CLEAR":
      return {
        cartItems: [],
        ...sumItems([]),
      };
    default:
      return state;
  }
};

//Old code
// import Constants from "../../../helpers/Constants";

// const Storage = (cartItems) => {
//     localStorage.setItem(Constants.POS_CART, JSON.stringify(cartItems.length > 0 ? cartItems : []));
// }

// export const sumItems = cartItems => {
//     Storage(cartItems);
//     console.log(cartItems)
//     let itemCount = cartItems.reduce((total, product) => total + product.quantity, 0);
//     let total = cartItems.reduce((total, product) => total + (((product.salesPrice * product.quantity) - (((product.salesPrice * product.quantity) / 100) * product.discountPercentage))), 0).toFixed(2);
//     return { itemCount, total }
// }

// export const CartReducer = (state, action) => {
//     switch (action.type) {
//         case "ADD_ITEM":
//             if (!state.cartItems.find(item => item._id === action.payload._id)) {
//                 state.cartItems.push({
//                     ...action.payload,
//                     quantity: action.payload.quantity ? action.payload.quantity : 1,
//                     discountPercentage: 0,
//                     refundQuantity: 0
//                 });

//                 state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)].onHand--;
//             }

//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "REMOVE_ITEM":
//             return {
//                 ...state,
//                 ...sumItems(state.cartItems.filter(item => item._id !== action.payload._id)),
//                 cartItems: [...state.cartItems.filter(item => item._id !== action.payload._id)]
//             }
//         case "INCREASE":
//             const incObj = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             console.log(state)
//             console.log(incObj.quantity);// BEFORE
//             const updatedQuantity = incObj.quantity + 1;
//             incObj.quantity = (updatedQuantity);
//             console.log(incObj.quantity);//AFTER
//             incObj.onHand--;

//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "INCREASE_BY_VALUE":
//             const incObj2 = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             console.log(incObj2?.quantity)
//             incObj2.quantity = parseInt(action.value);
//             console.log(incObj2?.quantity)
//             incObj2.onHand--;

//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "INCREASE_BY_PRICE":
//             const incObj3 = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             console.log(incObj3?.salesPrice)
//             incObj3.salesPrice = (parseFloat(action.value)).toFixed(2);
//             console.log(incObj3?.salesPrice)
//             // incObj2.onHand--;

//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "CHANGE_DISCOUNT_PERCENTAGE":
//             const incObj4 = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             console.log(incObj4?.discountPercentage)
//             incObj4.discountPercentage = parseInt(action.value);
//             console.log(incObj4?.discountPercentage)
//             // incObj2.onHand--;

//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "CHANGE_REFUND_QUANTITY":
//             const incObj5 = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             console.log(incObj5?.refundQuantity)
//             incObj5.refundQuantity = parseInt(action.value);
//             console.log(incObj5?.refundQuantity)
//             // incObj2.onHand--;

//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "ADDQUANTITY":
//             const addObj = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             console.log(action.quantity)
//             addObj.quantity = addObj.quantity + action.quantity;
//             console.log(action.quantity)
//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "DECREASE":
//             const decObj = state.cartItems[state.cartItems.findIndex(item => item._id === action.payload._id)];
//             decObj.quantity--;
//             decObj.onHand++;
//             return {
//                 ...state,
//                 ...sumItems(state.cartItems),
//                 cartItems: [...state.cartItems]
//             }
//         case "CHECKOUT":
//             return {
//                 cartItems: [],
//                 checkout: true,
//                 ...sumItems([]),
//             }
//         case "CLEAR":
//             return {
//                 cartItems: [],
//                 ...sumItems([]),
//             }
//         default:
//             return state

//     }
// }
