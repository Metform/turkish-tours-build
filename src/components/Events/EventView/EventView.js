import React, { Component } from 'react'

import Slider from '../../../shared/Slider/Slider';
import FeedBack from '../../../shared/FeedBack/FeedBack';

import './EventView.scss'
const summaryList = [
    'Inclusions',
    'Exclusions',
    'Prepare for the activity'
]

function textToHtml(html)
{
    let arr = html.split(/<br\s*\/?>/i);
    return arr.reduce((acc, a, idx) => {
        const el = <React.Fragment key={Date.now() + idx}>{a}<br /></React.Fragment>;
        return acc.concat(el);
    }, []);
}

export default class EventView extends Component {
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
                <div className="tour-container">
                    <div className="tour-slider">
                        <Slider event={this.props.event} />
                    </div>
                    <section className="tour-content">
                        <div className="see-more-content">
                           <p>{ textToHtml(this.props.event.description) }</p>
                        </div>
                    </section>
                    <article className="tour-sidebar">
                        <h2>About this activity</h2>
                        <ul>
                            {this.props.event.options.map((option, idx) => <li key={Date.now() + idx}><i className={`fa ${option.icon}`} /> {option.name}{option.subtitle && <><br /><span>{option.subtitle}</span></>}</li>)}
                        </ul>
                    </article>
                    <div className="modal__footer">
                        <section className="extra-info">
                            {this.props.event.extraInfo.map((el, elIdx) => {
                                return (
                                    <details key={Date.now() + elIdx}>
                                        <summary>{summaryList[elIdx]}</summary>
                                        <ul key={Date.now() + elIdx + 1}>
                                            {
                                                el.split('&').sort(a => a.match('^!') ? 1 : -1).map((item, itmIdx) => {
                                                    if (item.match('^!')) {
                                                        const clippedItm = item.slice(1).trim();
                                                        return (<li key={Date.now() + itmIdx}><i className="fa fa-times-circle" />{clippedItm}</li>)
                                                    } else {
                                                        return (<li key={Date.now() + itmIdx}><i className="fa fa-check-circle" />{item}</li>)
                                                    }
                                                })
                                            }
                                        </ul>
                                    </details>
                                )
                            })}
                        </section>
                        <h2>Contact the host</h2>
                        <div className="contact-host">
                            <p>Need more details before you book your trip?</p>
                            <button onClick={() => { this.setState({ showPopup: { map: false, feedBack: true } }) }}>Contact the host</button>
                        </div>
                        {this.state.showPopup.feedBack &&
                            <>
                                <FeedBack event={this.props.event} onClose={this.onSendForm} />
                            </>
                        }
                    </div>
                </div>
            </>
        )
    }
}
