import React, { Component } from 'react';

import './MapModal.scss'

class MapModal extends Component {
    body = document.body;

    componentDidMount() {    
        this.body.style.overflowY = 'hidden';
        this.body.style.height = '100vh';
        this.body.style.paddingRight = '15px';
    }
    componentWillUnmount() {
        this.body.style.overflowY = 'auto';
        this.body.style.height = '100vh';
        this.body.style.paddingRight = '0';
    }
    render() {
        return (
            <div className="modal-map">
                <a className="__close" href=" #" onClick={(e) => { e.preventDefault(); this.props.onClose() } }> </a>
                <section>{this.props.children}</section>
            </div>
        )
    }
}

export default MapModal;