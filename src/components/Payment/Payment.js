import React, { Component } from 'react'
import Cards from 'react-credit-cards'

import authContext from '../../context/auth-context'

import 'react-credit-cards/lib/styles.scss'
import './Payment.scss'

export function cc_format(value, type = 'number', separ) {
    const chunck = type === 'number' ? 4 : 2;
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').replace(/[/]/, '')
    const matches = type === 'number' ? v.match(/\d{4,16}/g) : v.match(/\d{2,7}/g);
    const match = matches ? matches[0] : ''
    const parts = []
    for (let i = 0; i < match.length; i += chunck) {
        parts.push(match.substring(i, i + chunck))
    }
    if (parts.length) {
        return parts.join(separ)
    } else {
        return value
    }
}

export class Payment extends Component {
    static contextType = authContext;

    state = {
        card_holder: '',
        card_number: '',
        card_expiry: '',
        focused: '',
        cvc: '',
    };

    constructor(props) {
        super(props)
        this.cardFormRef = React.createRef();
    }

    handleInputFocus = (e) => {
        this.setState({ focused: e.target.name });
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'card_number') {
            e.target.value = cc_format(value, 'number', ' ')
        }
        if (name === 'card_expiry') {
            e.target.value = cc_format(value, 'expiry', '/')
        }
        e.target.classList.add('validate');
        if (!e.target.checkValidity()) {
            e.target.nextElementSibling.classList.add('validation_error')
            e.target.nextElementSibling.innerHTML = e.target.validationMessage
        } else {
            e.target.nextElementSibling.classList.remove('validation_error')
            e.target.nextElementSibling.innerHTML = ''
            this.props.handleChange(e.target.name)(e.target.value);
        }
        const inputs = [...this.cardFormRef.current.elements]
        const inValid = inputs.some(input => !input.checkValidity())
        !inValid ? this.props.handleChange('isValid')(true) : inputs.forEach(el => {
            el.classList.add('validate')
            this.props.handleChange('isValid')(false)
        });

        this.setState({ [name]: value });
    }

    render() {
        return (
            <>
                <div className={'payment__container'}>
                    <legend className="header">Payment details</legend>
                    <p className="fa fa-lock"> Payments are secure and encrypted</p>
                    <div id="PaymentForm" className="payment__form">
                        <section className="payment__container__cards">
                            <Cards
                                cvc={this.state.cvc}
                                expiry={this.state.card_expiry}
                                focused={this.state.focused}
                                name={this.state.card_holder}
                                number={this.state.card_number}
                            />
                        </section>
                        <form ref={this.cardFormRef}>
                            <div>
                                <input
                                    type="text"
                                    name="card_holder"
                                    placeholder="Holder Name"
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    pattern="^(([A-za-z]+[\s]{1}[A-za-z]+)|([A-Za-z]+))$"
                                    required
                                />
                                <span aria-live="polite"></span>
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    name="card_number"
                                    placeholder="Card Number"
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    max="19"
                                    required
                                    pattern="(\d{4}[-. ]?){4}|\d{4}[-. ]?\d{6}[-. ]?\d{5}"
                                />
                                <span aria-live="polite"></span>
                            </div>
                            <div className="tel_cvc">
                                <input
                                    type="text"
                                    name="card_expiry"
                                    placeholder="MM / YY"
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    pattern="^(0[1-9]|1[0-2])[- /.]\d{2}"
                                    maxLength = "5"
                                    required
                                />
                                <span aria-live="polite"></span>
                                <input
                                    type="text"
                                    name="cvc"
                                    placeholder="CVC"
                                    onChange={this.handleInputChange}
                                    onFocus={this.handleInputFocus}
                                    pattern="\d{3,4}"
                                    maxLength="4"
                                    required
                                />
                                <span aria-live="polite"></span>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        )
    }
}

export default Payment
