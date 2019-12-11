import React from 'react';

import './Spinner.css';

const Spinner = (props) => (
    <div className="spinner" style={props.style}>
        <div className="lds-ripple">
            <div></div>
            <div></div>
        </div>
    </div>
    );

export default Spinner;