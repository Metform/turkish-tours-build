import React from 'react';
import { Elements } from 'react-stripe-elements'
import InjectedCheckoutForm from './CheckoutForm';

class StoreCheckout extends React.Component {
    render() {
        return (
            <Elements>
                <InjectedCheckoutForm values={this.props}/>
            </Elements>
        );
    }
}

export default StoreCheckout;