import React from 'react';

export default React.createContext({
    token: undefined,
    userId: null,
    isAdmin: false,
    hostname: null,
    stripe_pub_key: null,
    login: () => {},
    logout: () => {console.log('logout!')}
});