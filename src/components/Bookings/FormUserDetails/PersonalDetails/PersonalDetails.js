import React, { Component } from 'react'

import countriesList from "../../../../shared/countriesList";

import './PersonalDetails.scss'

export class PersonalDetails extends Component {
    telRegex = '^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-/0-9]*$'

    constructor(props) {
        super(props);
        this.props = props;
        this.billDetailsRef = React.createRef();
    }

    billDetailsHandler = e => {
        e.target.classList.add('validate');
        if (!e.target.validity.valid) {
            e.target.nextElementSibling.classList.remove('validation_success')
            e.target.nextElementSibling.classList.add('validation_error')
            e.target.nextElementSibling.innerHTML = e.target.validationMessage
        } else {
            e.target.nextElementSibling.classList.add('validation_success')
            e.target.nextElementSibling.classList.remove('validation_error')
            e.target.nextElementSibling.innerHTML = ''
            this.props.handleChange(e.target.name)(e.target.value);
        }
        const inputs = [...this.billDetailsRef.current.elements]
        const inValid = inputs.some(input => !input.validity.valid)
        !inValid ? this.props.handleChange('isValidPersonalInfo')(true) : inputs.forEach(el => {
            el.classList.add('validate')
            this.props.handleChange('isValidPersonalInfo')(false)
        });
    }

    render() {
        const values = this.props.values
        return (
            <>
                <fieldset className="billing_details" ref={this.billDetailsRef}>
                    <legend>Personal details</legend>
                    <p className="form-row">
                        <label htmlFor="firstName">First name *</label>
                        <input type="text" id="firstName" name="firstName" maxLength="45" defaultValue={values.firstName} onInput={this.billDetailsHandler} required />
                        <span aria-live="polite"></span>
                    </p>
                    <p className="form-row">
                        <label htmlFor="lastName">Last name *</label>
                        <input type="text" id="lastName" name="lastName" maxLength="45" defaultValue={values.lastName} onInput={this.billDetailsHandler} required />
                        <span aria-live="polite"></span>
                    </p>
                    <p className="form-row">
                        <label htmlFor="clientEmail">Email *</label>
                        <input type="email" id="clientEmail" name="clientEmail" maxLength="255" defaultValue={values.clientEmail} onInput={this.billDetailsHandler} required />
                        <span aria-live="polite"></span>
                    </p>
                    <p className="form-row">
                        <label htmlFor="country">Country *</label>
                        <input list="countries" id="country" name="country" defaultValue={values.country} onChange={this.billDetailsHandler} required />
                        <span aria-live="polite"></span>
                        <datalist id="countries" >
                            {countriesList.map(country => <option key={country} value={country}></option>)}
                        </datalist>
                    </p>
                    <p className="form-row">
                        <label htmlFor="mobilePhone">Mobile phone *</label>
                        <input type="tel" id="mobilePhone"
                            name="mobilePhone" defaultValue={values.mobilePhone}
                            maxLength="20"
                            onInput={this.billDetailsHandler}
                            placeholder="e.g. +43 (0)288 234 534"
                            pattern={this.telRegex}
                            required />
                        <span aria-live="polite"></span>
                    </p>
                </fieldset>
            </>
        )
    }
}

export default PersonalDetails
