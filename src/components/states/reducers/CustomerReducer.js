import Constants from "../../../helpers/Constants";

const Storage = (customer) => {
  console.log("cust", customer);
  localStorage.setItem(
    Constants.CURRENT_CUSTOMER,
    customer ? JSON.stringify(customer) : null
  );
};

export const CustomerReducer = (state, action) => {
  switch (action.type) {
    case "ADD_CUSTOMER":
      console.log(action.payload);
      Storage(action.payload);
      return { ...state };
    case "REMOVE_CUSTOMER":
      console.log(action.payload);
      return { ...state };
    case "UPDATE_CUSTOMER":
      // Storage(null);
      // Storage(action.payload);
      // return { ...state };
      const customer = action.payload;
      Storage(customer);
      return { customer };
    case "CLEAR_CUSTOMER":
      return {
        customer: [],
      };
    default:
      return state;
  }
};
