import React, { Component } from 'react';

import './Modal.scss'
import Geo from '../../../shared/Geo/Geo';
import MapModal from '../MapModal/MapModal';
import Backdrop from '../../../shared/Backdrop/Backdrop';

class Modal extends Component {
    state = {
        isOpen: false
    }
    constructor() {
        super()
        this.dialogRef = React.createRef();
    }
    
    onClose = () => this.setState({ isOpen: false })

    componentDidMount() {
        document.addEventListener('keydown', this.onClose);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onClose);
    }

    showMap = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

    render() {
        return (
            <div className="modal">
                <header className="modal__header">
                    <h1>{!this.props.editable ? this.props.title : 'Tour Creating'}</h1>
                    {!this.props.editable ? <>
                        <span>Price: US$ {this.props.event.price}</span>
                        <span>Start date: {new Date(this.props.event.date).toLocaleDateString()}</span>
                        <span>Available Seats: {this.props.availableSeats || 0}/{this.props.maxSeats || 9}</span>
                        {this.state.isOpen && (
                            <>
                                <Backdrop />
                                <MapModal onClose={this.showMap}>
                                    <Geo event={this.props.event} editable={false} zoom={15} />
                                </MapModal>
                            </>
                        )}
                        <a href="# " onClick={(e) => { e.preventDefault(); this.showMap() }}><i className="fa fa-map-marked-alt" /></a>
                    </> : null}
                </header>
                <section>{this.props.children}</section>
                <div>
                    <section className="modal__actions">
                        {this.props.canCancel 
                        && <button className="btn" onClick={this.props.onCancel}>Cancel</button>}
                        {this.props.canConfirm 
                        && this.props.availableSeats < this.props.maxSeats 
                        && <button className="btn" onClick={this.props.onConfirm}>{this.props.confirmText}</button>}
                    </section>
                </div>
            </div>
        )
    }
}

export default Modal
