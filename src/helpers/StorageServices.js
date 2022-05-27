import constants from "./Constants"

/**
 * Manage the how Access Tokens are being stored and retreived from storage.
 *
 * Current implementation stores to localStorage. Local Storage should always be
 * accessed through this instace.
**/
const TokenService = {
    getToken() {
        return localStorage.getItem(constants.TOKEN_KEY)
    },

    saveToken(accessToken) {
        localStorage.setItem(constants.TOKEN_KEY, accessToken)
    },

    removeToken() {
        localStorage.removeItem(constants.TOKEN_KEY)
    },

    getRefreshToken() {
        return localStorage.getItem(constants.REFRESH_TOKEN_KEY)
    },

    saveRefreshToken(refreshToken) {
        localStorage.setItem(constants.REFRESH_TOKEN_KEY, refreshToken)
    },

    removeRefreshToken() {
        localStorage.removeItem(constants.REFRESH_TOKEN_KEY)
    }

}

const SetUser = {
    getUser() {
        let user = localStorage.getItem(constants.USER);
        return JSON.parse(user)
    },
    isAdmin() {
        let user = this.getUser();
        return user != null ? user.role == 'admin' : false
    },
    saveUser(user) {
        localStorage.setItem(constants.USER, JSON.stringify(user));
    },

    removeUser() {
        localStorage.removeItem(constants.USER)
    }
}

export { TokenService, SetUser }