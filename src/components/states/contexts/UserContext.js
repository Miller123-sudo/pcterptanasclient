import { createContext, useReducer, useEffect } from "react";
import constants from "../../../helpers/Constants";
import UserReducer from "../reducers/UserReducer";


const initialState = {
    user: JSON.parse(localStorage.getItem(constants.CURRENT_USER)),
    isFetching: false,
    loginError: false,
};

export const UserContext = createContext(initialState);

export const UserContextProvider = ({ children }) => {

    const [state, dispatch] = useReducer(UserReducer, initialState);

    useEffect(() => {

        localStorage.setItem(constants.CURRENT_USER, JSON.stringify(state.user))

    }, [state.user])

    return <UserContext.Provider value={{
        user: state.user,
        isFetching: state.isFetching,
        loginError: state.loginError,
        dispatch,
    }}>{children}</UserContext.Provider>

}