import React, { Component } from 'react';
import picture from '../../../../shared/assets/tour_item_img/t2.jpg'
import picture2 from '../../../../shared/assets/tour_item_img/t1.jpg';
import picture3 from '../../../../shared/assets/tour_item_img/t3.jpg';

import './EventItem.scss';
import Backdrop from '../../../../shared/Backdrop/Backdrop';
import MapModal from '../../../Modal/MapModal/MapModal';
import Geo from '../../../../shared/Geo/Geo';

const Pictures = [picture3, picture, picture2];

class EventItem extends Component {
    state = {
        mapIsOpen: false
    }

    showMap = () => {
        this.setState( {mapIsOpen: !this.state.mapIsOpen} );
    }

    render() {
        return (
            <li key={this.props.eventId} className="events__list-item">
                <div className="events__list-item__img">
                    <img src={Pictures[this.props.count]} alt="Tour" />
                </div>
                <div className="events__list-item__content">
                    <div className="item__content__header">{this.props.title}</div>
                    <div className="item__content__price">{this.props.price} USD</div>
                    <div className="item__content__button">
                        { this.props.userInfo.isAdmin ?
                            <>
                                <button className="btn" onClick={this.props.onDetail.bind(this, this.props.eventId)}>View/Edit</button>
                                <a href=" #" onClick={this.props.onDelete.bind(this, this.props.eventId)}><i className="fa fa-trash-restore"></i></a>
                            </> :
                            <button className="btn" onClick={this.props.onDetail.bind(this, this.props.eventId)}>View Details</button>}
                    </div>
                    {this.state.mapIsOpen && (
                        <>
                                <Backdrop />
                                <MapModal onClose={this.showMap}>
                                    <Geo event={this.props.event} editable={false} zoom={8}/>
                                </MapModal>
                            </>
                    )}
                    <a className="__show_route" href=' #' onClick={(e) => {e.preventDefault(); this.showMap()}}>show route</a>
                </div>
                <div className="events__list-item__botton">
                    <div className="item__botton__seats">Seats Available: {this.props.availableSeats}/{this.props.maxSeats}</div>
                    <span><i className="fa fa-calendar"></i> Start: <b>{new Date(this.props.date).toLocaleDateString()}</b></span>
                    {this.props.options ?
                        <>
                            <ul>
                                {this.props.options.map((option, idx) => <li key={Date.now() + idx}><i className={`fa ${option.icon}`} /> {option.name}{option.name === 'Duration' && option.subtitle && <span>{option.subtitle}</span>}</li>)}
                            </ul>
                        </> : null}
                </div>
            </li>

        )
    }
};

export default EventItem;
