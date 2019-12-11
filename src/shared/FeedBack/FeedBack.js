import React, { Component } from 'react'
import axios from 'axios';

import './FeedBack.scss'
import authContext from '../../context/auth-context'
import Backdrop from '../Backdrop/Backdrop';
import Notify from '../Notify/Notify';

export default class FeedBack extends Component {
    static contextType = authContext;

    state = {
        isSuccess: false,
        hasSent: false
    }

    constructor(props) {
        super(props)

        this.nameElRef = React.createRef();
        this.emailElRef = React.createRef();
        this.ageElRef = React.createRef();
        this.countryElRef = React.createRef();
        this.messageElRef = React.createRef();
        this.subjectElRef = React.createRef();
        this.genderElRef = React.createRef();
    }

    sendEmail = (e) => {
        e.preventDefault();
        const name = this.nameElRef.current.value;
        const email = this.emailElRef.current.value;
        const age = this.ageElRef.current.value;
        const country = this.countryElRef.current.value;
        const message = this.messageElRef.current.value;
        const subject = this.subjectElRef.current.value;
        const gender = this.genderElRef.current.value;
        const body = { email, subject, name, country, gender, age, message }
        axios.post(
            `${this.context.hostname}/send`,
            body,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: "include"
            })
            .then(() => {
                return this.setState({ isSuccess: true, hasSent: true, notifyMsg: 'Email was sent!' })
            })
            .catch(err => {
                return this.setState({ isSuccess: false, hasSent: true, notifyMsg: 'Email wasn\'t sent!'}, () => new Error(err)) 
            });
    }

    render() {
        return (
            <>
                {!this.state.hasSent ? (
                    <>
                        <Backdrop />
                        <div className="container">
                            <div className="wrapper">
                                <section className="contact-info">
                                    <div className="contact-info__header">
                                        <h1>Contact Info</h1>
                                    </div>
                                    <div className="contact-info__body">
                                        <ul>
                                            <li>first corner St LA</li>
                                            <li>aemail@gmail.com</li>
                                            <li>(777)-4545-4545</li>
                                        </ul>
                                    </div>
                                </section>
                                <section className="form">
                                    <div className="form__header">
                                        <h3>Email Us</h3>
                                    </div>
                                    <div className="form__body">
                                        <form onSubmit={this.sendEmail}>
                                            <div className="form__input">
                                                <label htmlFor="">Name</label>
                                                <input type="text" ref={this.nameElRef} />
                                            </div>
                                            <div className="form__input">
                                                <label htmlFor="">Email*</label>
                                                <input type="email" name="email" ref={this.emailElRef} required />
                                            </div>
                                            <div className="form__input">
                                                <label htmlFor="">Age</label>
                                                <input type="number" ref={this.ageElRef} />
                                            </div>
                                            <div className="form__input">
                                                <label htmlFor="">Country</label>
                                                <input type="text" ref={this.countryElRef} />
                                            </div>
                                            <div className="form__input">
                                                <label>Reason</label>
                                                <select name="reason" ref={this.subjectElRef}>
                                                    <option value="Cost">Cost</option>
                                                    <option value="Secure">Secure</option>
                                                    <option value="Visa">Visa</option>
                                                    <option value="Food">Food</option>
                                                    <option value="Transport">Transport</option>
                                                </select>
                                            </div>
                                            <div className="form__input">
                                                <label>Gender</label>
                                                <select name="gender" ref={this.genderElRef}>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form__message full">
                                                <label htmlFor="">Message*</label>
                                                <textarea className="form__message" ref={this.messageElRef} required></textarea>
                                            </div>
                                            <div className="form__button full">
                                                <button type="submit" className="form__button">Submit</button>
                                            </div>
                                        </form>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </>
                ) : <Notify error={!this.state.isSuccess} text={this.state.notifyMsg} duration={3} onClose={this.props.onClose} />}
            </>
        )
    }
}
