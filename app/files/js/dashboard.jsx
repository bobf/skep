import React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import * as Icon from 'react-feather';

import store from './redux/store';
import Messages from './messages';
import NodeList from './node_list';
import Overview from './overview';
import PingIcon from './ping_icon';
import Stack from './stack';

class ConnectedDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodesMinimized: true,
      stacksMinimized: false,
      collapsedStacks: null,
      modalVisible: false,
      modalHidden: true,
      overviewVisible: false,
      overviewHidden: true,
      obscured: false,
      fullyCollapsed: true,
    }
  }

  manifest() {
    const { manifest } = this.props.swarm;
    return manifest;
  }

  swarmStatistics() {
    const { statistics } = this.state;
    return statistics;
  }

  services() {
    return this.stacks().map(stack => stack.services()).flat();
  }

  renderStack(stack) {
    const { fullyCollapsed } = this.state;

    return (
      <Stack
        key={`stack-${stack.name}`}
        stack={stack}
        manifest={this.manifest()}
        fullyCollapsed={fullyCollapsed}
      />
    );
  }

  toggle(id) {
    $(`#${id}`).toggle();
  }

  renderManifestMissing() {
    return (
      <div className="waiting-data">
        {'Waiting for data...'}
      </div>
    );
  }

  toggleStacks() {
    const visible = $("#stacks").is(':visible');
    const $nodes = $('#nodes');
    const $dashboard = $('#dashboard');
    const $stacks = $('#stacks');
    const $eachNode = $('.node');

    if (visible) {
      $nodes.addClass('maximized');
      $nodes.removeClass('minimized');
      $nodes.animate({ width: $('body').width() - 28}, 1000, 'swing',
                     () => $stacks.fadeOut());
      this.setState({ stacksMinimized: true, nodesMinimized: false });
    } else {
      $stacks.show();
      $nodes.animate({ width: '21em' }, 1000, 'swing');
      $nodes.removeClass('maximized');
      $nodes.addClass('minimized');
      this.setState({ stacksMinimized: false, nodesMinimized: true });
    }
  }

  toggleOverview(ev, visible) {
    if (Skep.modal) return false;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (visible) {
      this.setState({ modalHidden: false, modalVisible: true, overviewVisible: true, overviewHidden: false });
    } else {
      this.setState({ modalHidden: true, overviewHidden: true });
      this.timeout = setTimeout(
        () => this.setState({ modalVisible: false, overviewVisible: false }),
        500
      );
    }
  }

  renderConnectionError() {
    return (
      <span className={'connection-error'}>
        {Messages.skep.connectionError}
      </span>
    );
  }

  renderPingIcon() {
    return (
      <PingIcon />
    );
  }

  renderOverviewMinimized() {
    const { overviewVisible } = this.state;
    const { connectionLive, ping } = this.props.swarm;

    const classes = ['overview-minimized'];
    if (overviewVisible) classes.push('visible');
    if (ping) classes.push('ping');
    classes.push(connectionLive ? 'connected' : 'disconnected')

    return (
      <div
        onClick={(ev) => this.toggleOverview(ev, true)}
        className={classes.join(' ')}>
        {this.renderConnectionError()}
        {this.renderPingIcon()}
      </div>
    );
  }

  renderOverviewModal() {
    const { modalVisible, modalHidden } = this.state;
    const classes = [];
    if (modalVisible) classes.push('visible');
    if (modalHidden) classes.push('hidden');

    return (
      <div
        onClick={(ev) => this.toggleOverview(ev, false)}
        className={`overview-modal ${classes.join(' ')}`}>
      </div>
    );
  }

  renderOverview() {
    const { overviewVisible, overviewHidden } = this.state;
    if (!overviewVisible) return null;

    return (
      <Overview
        visible={!overviewHidden}
        closeCallback={(ev) => this.toggleOverview(ev, false)} />
    );
  }

  renderViewSwitchButton() {
    const { stacksMinimized } = this.state;
    const classes = ['toggle-section btn btn-secondary'];
    if (stacksMinimized) classes.push('stacks-minimized');

    return (
      <button
        onClick={() => this.toggleStacks()}
        className={classes.join(' ')}>
        {stacksMinimized ? <Icon.ChevronsLeft/> : <Icon.ChevronsRight/>}
      </button>
    );
  }

  render() {
    if (!this.manifest()) return this.renderManifestMissing();
    const { nodes } = this.manifest();
    const { nodesMinimized: minimized, fullyCollapsed } = this.state;

    return (
      <div className={'dashboard-overview-wrapper'}>
        {this.renderOverviewMinimized()}
        {this.renderOverview()}
        {this.renderOverviewModal()}
        <div className={this.state.obscured ? 'obscured' : ''} id={'dashboard'}>
          <div className={'section minimized'} id={'nodes'}>
            <div className={'section-content'}>
              <h2 className={'section-title'}>
                <Icon.Server className={'icon'} />
                {'Nodes'}
              </h2>
              <NodeList minimized={minimized} nodes={nodes} />
            </div>
          </div>

          {this.renderViewSwitchButton()}
          <div className={'divider'}></div>

          <div id={'stacks'} className={'section'}>
            <div className={'section-content'}>
              <h2
                className={'clickable section-title'}
              >
                <Icon.Layers className={'icon'} />
                {'Stacks'}
              </h2>
              <button
                onClick={() => this.setState({ fullyCollapsed: !fullyCollapsed })}
                type="button"
                className="expand-collapse-stacks btn btn-primary"
              >
                { fullyCollapsed ? <Icon.Maximize size="1em"/> : <Icon.Minimize size="1em" /> }
              </button>
              <table className='stacks'>
                <tbody>
                  {this.manifest().stacks.map(stack => this.renderStack(stack))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const select = (state) => {
  return { swarm: state.swarm };
};

const Dashboard = connect(select)(ConnectedDashboard);
export default Dashboard;
