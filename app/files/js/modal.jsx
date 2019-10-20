function callbackWrapper(ev, callback) {
  if (!callback) return false;
  if (ev.target.closest('.modal-content')) return false;

  return callback(ev);
}

function Modal(props) {
  const { content, closeCallback, contentClass, wrapperClass, title, subtitle } = props;
  return (
    <div onClick={(ev) => callbackWrapper(ev, closeCallback)}
         className={'modal-wrapper modal'}>
      <div className={`modal-content ${wrapperClass || ''}`}>
        <div className={'viewport'}>
          <div className={'header'}>
            <h5>{title}</h5>
            <div className={'subtitle'}>
              {subtitle}
            </div>
          </div>
          <div className={contentClass || ''}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
