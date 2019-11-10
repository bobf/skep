import * as Icon from 'react-feather';
import React from 'react';
import { connect } from 'react-redux';

import Messages from './messages';

class ConnectedPingIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tick: 0 };
  }

  since() {
    const { connectionLive } = this.props.swarm;

    return (Date.now() - connectionLive) / 1000
  }

  message() {
    return Messages.skep.connectionLive(this.since());
  }

  classes() {
    const classes = ['icon'];
    const since = this.since();

    if (since >= Skep.thresholds.global.timeout.danger) {
      classes.push('text-danger');
    } else if (since > Skep.thresholds.global.timeout.warning) {
      classes.push('text-warning');
    }

    return classes;
  }

  tick() {
    this.setState(prevState => ({ tick: prevState.tick + 1 }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div className={'ping-wrapper'}>
        <div
          className={'ping-pulse'}
          data-original-title={this.message()}
          data-html={'true'}
          data-toggle={'tooltip'}>
          <Icon.Radio className={this.classes().join(' ')} />
        </div>
      </div>
    );
  }
}

const select = (state) => {
  return { swarm: state.swarm };
};

const PingIcon = connect(select)(ConnectedPingIcon);
export default PingIcon;
