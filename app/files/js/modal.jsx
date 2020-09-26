import * as Icon from 'react-feather';
import React from 'react';

class Modal extends React.Component {
  callbackWrapper(ev, callback) {
    if (ev.target.closest('.modal-content')) return false;
    if (!callback) return false;

    return callback(ev);
  }

  componentWillUnmount() {
    Skep.modal = false;
  }

  componentDidMount() {
    Skep.modal = true;
  }

  render() {
    const {
      content,
      closeCallback,
      contentClass,
      wrapperClass,
      title,
      subtitle
    } = this.props;

    return (
      <div onClick={(ev) => this.callbackWrapper(ev, closeCallback)}
           className={'modal-wrapper modal'}>
        <div
          className={`modal-content ${wrapperClass || ''}`}
          onClick={(ev) => { ev.stopPropagation() }}
        >
          <div className={'viewport'}>
            <div className={'header'}>
              <div className="modal-close">
                <Icon.X onClick={() => closeCallback && closeCallback()} />
              </div>
              <h5>{title}</h5>
              <div className={'subtitle'}>
                {subtitle}
              </div>
            </div>
            <div className={`modal-content-body ${contentClass}`}>
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
