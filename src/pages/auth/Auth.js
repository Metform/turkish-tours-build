import React, { Component } from 'react'
import { path, view, lensPath } from 'ramda'

import './Auth.scss'
import authContext from '../../context/auth-context'
import Notify from '../../shared/Notify/Notify'

const regex = {
    email: new RegExp(
    '^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|' +
    '(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])' +
    '|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'),
    password: '^(?=.)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'
}

class AuthPage extends Component {
    state = {
        isLogin: true,
        isPendingConfirmation: false,
        isConfirmed: false,
        isSuccess: false,
        popupMessage: ''
    };

    static contextType = authContext;

    constructor(props) {
        super(props)
        this.emailEl = React.createRef()
        this.passwordEl = React.createRef()
        this.phoneNumberEl = React.createRef()
        this.confirmationCodeEl = React.createRef()
    }

    switchModeHandler = () => {
        this.resetInvalidFields()
        this.setState(pervState => {
            return { isLogin: !pervState.isLogin }
        })
    }

    submitHandler = event => {
        event.preventDefault();
        const password = this.passwordEl.current.value;
        const phone_number = this.phoneNumberEl.current.value;

        if (password.trim().length === 0 || 
            phone_number.trim().length === 0 ) {
            return;
        }

        let requestBody = {
            query: `
                mutation Login($LoginInput: LoginInput!){
                    login(input: $LoginInput) {
                        idToken
                    }
                }
            `,
            variables: { LoginInput: { phoneNumber: phone_number, password } }
        };

        if (!this.state.isLogin && !this.state.isPendingConfirmation) {
            const email = this.emailEl.current.value
            requestBody = {
                query: `
                mutation Signup($SignupInput: SignupInput!){
                    signup(input: $SignupInput) {
                        username
                    }
                }`,
                variables: { SignupInput: { phoneNumber: phone_number, password, name: email }}
            }
        }

        if (!this.state.isLogin && !this.state.isConfirmed && this.state.isPendingConfirmation) {
            const confirmationCode = this.confirmationCodeEl.current.value
            requestBody = {
                query:`
                    mutation SignupConfirm($SignupConfirmInput: SignupConfirmInput!) {
                        signupConfirm(input: $SignupConfirmInput)
                    }
                `,
                variables: { SignupConfirmInput: { phoneNumber: phone_number, confirmationCode }}
            }
        }

        fetch(`${this.context.hostname}/graphql`, {
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
                return res.json();
            })
            .then(resParse => {
                const idToken = path(['data', 'login', 'idToken'], resParse)
                const errors = view(lensPath(['errors', 0, 'message']), resParse)
                if (this.state.isLogin && !resParse.data.login && errors) {
                    this.setInvalidFields(errors)
                }
                if (errors) {
                    console.log(errors)
                    this.setState({ isSuccess: false, popupMessage: errors })
                    return
                }
                if (!this.state.isLogin && !this.state.isConfirmed && resParse.data.signup) {
                    this.setState({ isPendingConfirmation: true })
                }
                if (this.state.isLogin && idToken) {
                    this.context.login(idToken);
                }
                if (resParse.data.signupConfirm) {
                    this.setState({ isSuccess: true, isConfirmed: true, popupMessage: 'You are successfully signed up' })
                }
            })
            .catch(err => {
                throw Error(err)
            });
    };

    setInvalidFields = (errorMessage = 'Invalid data') => {
        document.getElementById('loginErrorMsg') && document.getElementById('loginErrorMsg').remove()
        const p = document.createElement("p")
        p.innerText = errorMessage
        p.style.color = 'red'
        p.id = 'loginErrorMsg'
        this.phoneNumberEl.current && this.phoneNumberEl.current.parentElement.classList.add('invalid_auth')
        this.passwordEl.current && this.passwordEl.current.parentElement.classList.add('invalid_auth')
        this.passwordEl.current && this.passwordEl.current.parentElement.parentElement.insertBefore(p, this.passwordEl.current.parentElement.nextSibling)
    }

    resetInvalidFields = () => {
        this.phoneNumberEl.current && this.phoneNumberEl.current.parentElement.classList.remove('invalid_auth')
        this.passwordEl.current && this.passwordEl.current.parentElement.classList.remove('invalid_auth')
        document.getElementById('loginErrorMsg') && document.getElementById('loginErrorMsg').remove()
    }

    emailInputHandle = (e) => {
        e.target.parentElement.classList.toggle('email__success', regex.email.test(this.emailEl.current.value));
    }
    
    renderConfirmationForm() {
        return (
            <div className="email">
                <input type="number" id="confirmationCode" name="confirmationCode" placeholder="code" ref={this.confirmationCodeEl} required />
            </div>
        )
    }
    
    renderSignupForm() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
               <div className="email">
                    <input type="text"
                        id="phone"
                        name="phone"
                        placeholder="tel"
                        ref={this.phoneNumberEl}
                        pattern="^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$"
                        title="Invalid phone number try again"
                        required />
                </div>
                <div className="email">
                    <input type="text" 
                        placeholder="test@test.com"
                        ref={this.emailEl}
                        onChange={this.emailInputHandle}
                        pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                        title="Invalid email please try better" />
                    <svg viewBox="0 0 16 16">
                        <path d="M10.8000002,10.8000002 C9.85000038,11.6500006 9.18349609,12 8,12 C5.80000019,12 4,10.1999998 4,8 C4,5.80000019 5.80000019,4 8,4 C10.1999998,4 12,6 12,8 C12,9.35332031 12.75,9.5 13.5,9.5 C14.25,9.5 15,8.60000038 15,8 C15,4 12,1 8,1 C4,1 1,4 1,8 C1,12 4,15 8,15 C12,15 15,12 15,8"></path>
                        <polyline points="5 8.375 7.59090909 11 14.5 4" transform='translate(0 -0.5)'></polyline>
                    </svg>
                    <a className="dribbble" href=" +" target="_blank">
                        <img src="https://cdn.dribbble.com/assets/dribbble-ball-1col-dnld-e29e0436f93d2f9c430fde5f3da66f94493fdca66351408ab0f96e2ec518ab17.png" alt="" />
                    </a>
                </div>
                <div className="email">
                    <input type="password" 
                        placeholder="passwod" 
                        ref={this.passwordEl}
                        pattern='^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'
                        autoComplete="off"
                        required
                        title="Enter an password consisting of 8+ symbols with at least one uppercase and lowercase letter" />
                </div>
                { this.state.isPendingConfirmation && this.renderConfirmationForm() }
                { this.state.popupMessage && this.state.isSuccess && <Notify error={!this.state.isSuccess} text={this.state.popupMessage} onClose={() => {this.setState({ popupMessage: '' })}} />}
                { this.state.popupMessage && !this.state.isSuccess && <Notify error={!this.state.isSuccess} text={this.state.popupMessage} onClose={() => {this.setState({ popupMessage: '' })}} />}
                <div className="form-action">
                    <button type="submit">{ this.state.isPendingConfirmation ? 'Submit' : 'Confirm' }</button>
                    <button type="button" onClick={this.switchModeHandler}>{this.state.isLogin ? 'Sign Up' : 'Login'}</button>
                </div>
            </form>
        )
    }

    renderLoginForm() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
               <div className="email">
                    <input type="text"
                        id="phone"
                        name="phone"
                        placeholder="tel"
                        ref={this.phoneNumberEl}
                        pattern="^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$"
                        title="Invalid phone number try again"
                        required />
                </div>
                <div className="email">
                    <input type="password" 
                            placeholder="passwod" 
                            ref={this.passwordEl}
                            pattern='^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'
                            autoComplete="off"
                            required
                            title="Enter an password consisting of 7+ symbols with at least one upper case letter" />
                </div>
                    <div className="form-action">
                        <button type="submit">Submit</button>
                        <button type="button" onClick={this.switchModeHandler}>{this.state.isLogin ? 'Sign Up' : 'Login'}</button>
                    </div>
            </form>
        )
    }


    render() {
        return (
            <React.Fragment>
                <div className="auth-container">
                    <div className="auth-control">
                        <div className="header">{!this.state.isLogin ? 'Sign Up' : 'Login'}</div>
                            { this.state.isLogin ? (
                                this.renderLoginForm()
                            ) : (
                                this.renderSignupForm()
                            ) }
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default AuthPage;