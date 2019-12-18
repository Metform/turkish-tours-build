import React from 'react';
import { Redirect } from 'react-router-dom';
import { injectStripe } from 'react-stripe-elements';
import CardSection from './CardSection';
import { map, pathOr } from 'ramda'

import './CheckoutForm.scss'
import authContext from "../../../context/auth-context";
import Notify from '../../../shared/Notify/Notify';

// Visa: 4242 4242 4242 4242 — Exp: 01/20 — CVV: 123
// Mastercard: 5555 5555 5555 4444 — Exp: 01/20 — CVV: 123

class CheckoutForm extends React.Component {
    static contextType = authContext;

    state = {
        isRedirect: false,
        status: {
            succeeded: false,
            failed: false,
            pending: false
        },
        isInvalidForm: false,
        error_message: '',
        ...this.props.values.values
    }

    constructor(props) {
        super(props);
        this.props = props
    }

    handleSubmit = (ev) => {
        ev.preventDefault();
        this.props.stripe.createToken({ type: 'card', name: this.state.firstName }).then(({ token }) => this.setState({ token: token.id })).catch(err => console.log(err));
        this.props.stripe.createPaymentMethod('card', { billing_details: { name: this.state.firstName } })
            .then(({ paymentMethod: { card } }) => {
                this.onPaymentCheck(card)
            })
            .catch((err) => console.log(err))
    };

    onPaymentCheck = () => {
        const customerInput = {
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            country: this.state.country,
            residence: this.state.address || '',
            clientEmail: this.state.clientEmail,
            mobilePhone: this.state.mobilePhone
        }
        const transform = ({_id, quantity}) => ({ id: _id, quantity })
        const eventsIds = map(transform)(this.state.events)
        let requestBody = {
            query: `
            mutation CreatePayment($PaymentInputArgs: PaymentInputArgs! ){
                createPayment(paymentInput: $PaymentInputArgs) {
                  id
                  paid
                  status
                }
              }`,
            variables: { PaymentInputArgs: { token: this.state.token, total: (this.state.total_cost * 100), eventsIds } }
        };
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
            .then(res => {
                if (res.errors) {
                    this.setState({ isInvalidForm: true, error_message: res.errors[0].message })
                    const humanMessage = pathOr([res.errors[0].message], ['extensions', 'exception', 'invalidArgs'], res.errors[0])
                    this.setState({ error_message: humanMessage[0], isInvalidForm: true })
                    return new Error(res.errors[0].message)
                } else {
                    return res
                }
            })
            .then(({ data: { createPayment: { id, paid, status } } }) => {
                if (paid) {
                    requestBody = {
                        query: `
                            mutation CreateOrUpdateCustomer($CustomerInput: CustomerInput!) {
                                createOrUpdateCustomer(customerInput: $CustomerInput)
                            }
                        `,
                        variables: {
                            CustomerInput: {
                                ...customerInput,
                                lastPaymentId: id,
                                lastBill: this.state.total_cost,
                                lastBookingId: this.state.bookingId,
                                lastPaymentStatus: status
                            }
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
                    .then(res => {
                        this.setState({ status: { [status]: true }, isInvalidForm: false })
                    })
                    .catch(err => `Customer: ${err}`)
                }
            })
            .catch(err => `From Server: ${err}`)
    };

    render() {
        const { status: { succeeded, pending, failed }, isInvalidForm, error_message } = this.state
        return (
            <>
                <form onSubmit={this.handleSubmit} className="payment_stripe_form">
                    <CardSection />
                    <button>Confirm order</button>
                </form>
                { isInvalidForm && <Notify text={error_message} error={true} duration="4" onClose={() => { this.setState({ isInvalidForm: false }) }} />}
                <>
                    {succeeded || pending || failed ?
                        <>
                            <Notify text={!failed ? 'Payment was successful.\nDetailed information was sent to your email' : 'Payment declined'} error={failed} success={succeeded || pending} duration="3" onClose={() => { this.setState({ isRedirect: true }) }} />
                            {this.state.isRedirect && <Redirect to="/events" />}
                        </> : null}
                </>
            </>
        )
    }
}

export default injectStripe(CheckoutForm);