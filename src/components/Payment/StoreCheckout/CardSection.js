import React from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from 'react-stripe-elements'

import './CardSection.scss'

class CardSection extends React.Component {

    handleChange = (e) => {
            console.log(e)
    }

    render() {
        return (
            <>
            <div className="payment_form_elements">
                <label>
                    Card number
                    <CardNumberElement />
                </label>
                <label>
                    Expiration date
                    <CardExpiryElement />
                </label>
                <label>
                    CVC
                    <CardCvcElement />
                </label>
            </div>
            </>
        );
    }
}

export default CardSection;