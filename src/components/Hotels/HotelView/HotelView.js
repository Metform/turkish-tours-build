import React, { Component } from 'react'

import MapModal from '../../Modal/MapModal/MapModal';
import Backdrop from '../../../shared/Backdrop/Backdrop';
import Geo from '../../../shared/Geo/Geo';
import Slider from '../../../shared/Slider/Slider';
import FeedBack from '../../../shared/FeedBack/FeedBack';

import './HotelView.scss'

export default class HotelView extends Component {
    state = {
        showPopup: {
            map: false,
            feedBack: false
        }
    }

    cb = (e) => {
        if (e.keyCode === 27) {
            this.setState({ showPopup: { map: false, feedBack: false } })
        }
    }

    onSendForm = () => {
        this.setState({ showPopup: { feedBack: false } })
    }

    componentDidMount() {
        document.addEventListener('keydown', this.cb);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.cb);
    }

    render() {
        return (
            <>
                <div className="hotel-container">
                    <div className="hotel-slider">
                        <Slider event={this.props.hotel} />
                    </div>
                    <div className="hotel-map">
                        <a href="# " onClick={(e) => { e.preventDefault(); this.setState({ showPopup: { map: true, feedBack: false } }) }}><span>Perfect location</span> - Show on map</a>
                        {this.state.showPopup.map && (
                            <>
                                <Backdrop />
                                <MapModal>
                                    <Geo event={this.props.hotel} editable={false} />
                                </MapModal>
                            </>
                        )}
                    </div>
                    <section className="hotel-content">
                        <h1>{this.props.hotel.name}</h1>
                        <h2>${this.props.hotel.price} - {this.props.hotel.rate}</h2>
                        <p>{this.props.hotel.site}</p>
                        <p>{this.props.hotel.description}</p>
                    </section>
                    <article className="hotel-sidebar">
                        <h2>Most Popular Facilities</h2>
                        <ul>
                            {this.props.hotel.options.map((option, idx) => <li key={Date.now()+idx} className={option.icon}> {option.name}</li>)}
                        </ul>
                    </article>
                    <div className="modal__footer">
                        <h2>Contact the host</h2>
                        <div className="contact-host">
                            <p>Need more details before you book your stay?</p>
                            <button onClick={() => { this.setState({ showPopup: { map: false, feedBack: true } }) }}>Contact the host</button>
                        </div>
                        {this.state.showPopup.feedBack &&
                            <>
                                <FeedBack event={this.props.hotel} onClose={this.onSendForm} />
                            </>
                        }
                    </div>
                </div>
            </>
        )
    }
}
