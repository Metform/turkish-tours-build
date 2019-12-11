import React from 'react'

import './PayMethodsInfo.scss'

const PayMethodsInfo = () => {
    return (
        <div className="content-secondary">
            <div className="trust-block accept">
                <h4 className="trust-block-title">You can pay with:</h4>
                <ul className="payment-methods">
                    <li className="payment-method paypal available" title="PayPal"></li>
                    <li className="payment-method mastercard available" title="MasterCard"></li>
                    <li className="payment-method visa available" title="VISA"></li>
                    <li className="payment-method maestro available" title="Maestro"></li>
                    <li className="payment-method jcb  available" title="JCB"></li>
                </ul>
            </div>
            <div className="trust-block security-gyg">
                <h4 className="trust-block-title">Data Security</h4>
                <div className="trust-block-lock icon-lock">
                    <p className="security-gyg__item first">Your info's safe with us. All data is
                        <strong> encrypted and transmitted securely </strong>with an SSL protocol.
                    </p>
                </div>
            </div>
            <div className="trust-block why-gyg">
                <h4 className="trust-block-title">Book with confidence</h4>
                <div className="trust-block-checkmark">
                    <p className="why-gyg-item first">
                        <strong>Best price guarantee. </strong>
                        Found your activity for less? We'll refund the difference.
                    </p>
                    <p className="why-gyg-item subsequent">
                        <strong>Peace of mind. </strong>
                        Book ahead to skip the lines and reserve your spot.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default PayMethodsInfo
