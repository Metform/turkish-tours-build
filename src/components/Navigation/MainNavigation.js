import React from 'react';
import NavLink from 'react-router-dom/NavLink';
import Authcontext from '../../context/auth-context';

import './MainNavigation.css';

const mainNavigation = props => (
    <Authcontext.Consumer>

        {(context) => {
            return (
                <header className="main-navigation">
                    <div className="main-navigation__logo">
                        <h1>
                            Turkey Tours
                        </h1>
                    </div>
                    <nav className="main-navigation__items">
                        <ul>
                            {!context.token && (
                                <li>
                                    <NavLink to="/auth">Authenticate</NavLink>
                                </li>
                            )}
                            <li>
                                <NavLink to="/events">Tours</NavLink>
                            </li>
                            {context.token && <React.Fragment>
                                    <li>
                                        <NavLink to="/bookings">Bookings</NavLink>
                                    </li>
                                    <li>
                                        <button onClick={context.logout}>Logout</button>
                                    </li>
                            </React.Fragment>}
                            {/* <li>
                                <NavLink to="/hotels">Hotels</NavLink>
                            </li> */}
                        </ul>
                    </nav>
                </header>
            )}
        }

    </Authcontext.Consumer>
);

export default mainNavigation;