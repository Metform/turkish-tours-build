import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import MainNavigation from './components/Navigation/MainNavigation';

import { StripeProvider } from 'react-stripe-elements';

import AuthPage from './pages/auth/Auth';
import EventsPage from './pages/events/Events';
import BookingPage from './pages/bookings/Bookings';
import AuthContext from '../src/context/auth-context';

import './App.scss';
const API_URL = window.location.hostname === 'localhost' ? 'https://ast4fv2t15.execute-api.eu-west-2.amazonaws.com/dev' : 'https://ast4fv2t15.execute-api.eu-west-2.amazonaws.com/dev'
const STRIPE_PUBLISH_KEY = 'pk_test_4GBYsitSDwJ20srHk9Qr0F8q00LKrBd3gE'
const jwtToken = new RegExp(/("(\\.|[^"])*"|\[|\]|,|\d+|\{|\}|[a-zA-Z0-9_]+)/g)
function setCookie(name, value, options = {}) {

  options = {
    path: '/',
    ...options
  };

  if (options.expires && options.expires.toUTCString) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}

class App extends Component {

  state = {
    token: undefined,
    isAdmin: false,
    userId: null
  }

  getUser = (idToken) => {
    const userPayload = idToken.match(jwtToken)[1];
    let user = JSON.parse(atob(userPayload))
    user.isAdmin = user['cognito:groups'][0] === 'admin'
    return user
  }

  login = (idToken) => {
    const user = this.getUser(idToken)
    this.setState({ token: idToken, userId: user.sub, isAdmin: user.isAdmin })
    localStorage.setItem('token', idToken)
  }

  logout = () => {
    const requestBody = {
      query:`
        mutation {
          logout
        }`
    }
    fetch(`${API_URL}/graphql`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': `${document.cookie}`,
      },
      credentials: "include"
    })
      .then(res => {
          if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
          }
          return res.json()
        })
        .then(({ data: { logout } }) => {
          if (logout || logout === null) {
            this.setState({ token: null, userId: null })
            localStorage.removeItem('token')
            deleteCookie('access-token')
            deleteCookie('refresh-token')
          }
      })
      .catch(err => {
        console.log('FAILED')
        console.log(err)
      })
}

  componentDidMount() {
    const idToken = localStorage.getItem('token')
    if (idToken) {
      const user = this.getUser(idToken)
      this.setState({ token: idToken, userId: user.sub, isAdmin: user.isAdmin })
    }
  }
  
  render() {
    return (
      <StripeProvider apiKey={STRIPE_PUBLISH_KEY}>
        <BrowserRouter>
          <React.Fragment>
            <AuthContext.Provider value={{
              token: this.state.token,
              userId: this.state.userId,
              isAdmin: this.state.isAdmin,
              login: this.login,
              logout: this.logout,
              hostname: API_URL,
              stripe_pub_key: STRIPE_PUBLISH_KEY
            }}>
              <MainNavigation />
              <main className="main-content">
                <Switch>
                  {!this.state.token && <Redirect from="/bookings" to="/auth" exact />}
                  {<Redirect from="/" to="/events" exact />}
                  {this.state.token && <Redirect from="/" to="/events" exact />}
                  {this.state.token && <Redirect from="/auth" to="/events" exact />}
                  {!this.state.token && (
                    <Route path="/auth" component={AuthPage} />
                  )}
                  <Route path="/events" component={EventsPage} />
                  {/* <Route path="/hotels" component={HotelsPage} /> */}
                  {this.state.token && (
                    <Route path="/bookings" component={BookingPage} />
                  )}
                  {!this.state.token && <Redirect to="/auth" exact />}
                </Switch>
              </main>
            </AuthContext.Provider>
          </React.Fragment>
        </BrowserRouter>
      </StripeProvider>
    );
  }
}

export default App;
