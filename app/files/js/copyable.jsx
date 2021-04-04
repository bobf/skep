import React, { useState } from 'react';
import copyTextToClipboard from './copy';
import * as Icon from 'react-feather';

const Copyable = (props) => {
  const [visible, setVisible] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const copy = (ev) => {
    setHighlighted(true);
    setTimeout(() => setHighlighted(false), 300);
    ev.preventDefault();
    ev.stopPropagation();
    copyTextToClipboard(props.copyText);
  };

  const classes = ['icon', 'copy'];
  if (highlighted) classes.push('highlight');

  const copyIcon = (
    <Icon.Copy onClick={(ev) => copy(ev)} className={classes.join(" ")} />
  );

  return (
    <span onMouseEnter={() => setVisible(true)} onMouseLeave={() => setTimeout(() => setVisible(false), 300)}>
      {props.children}
      {visible ? copyIcon : null}
    </span>
  );
};

export default Copyable;
