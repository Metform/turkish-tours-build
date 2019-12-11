import React, { Component } from 'react';
import classNames from 'classnames';

import './Notify.scss';

class Notify extends Component {
    state = {
        isHide: false
    };

    timer = null;

    componentDidMount() {
        const duration = this.props.duration | 2
        this.timer = setTimeout(() => {
            this.setState({ isHide: true })
            this.props.onClose && this.props.onClose();
        }, duration * 1000);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        return (
            <>
                {!this.state.isHide && (
                    <div className={classNames({
                        'notify__container': true,
                        'warning': this.props.warning,
                        'success': !this.props.error,
                        'error': this.props.error,
                    })}>
                        <div>{this.props.text}</div>
                    </div>
                )}
            </>
        )
    }
}

export default Notify
