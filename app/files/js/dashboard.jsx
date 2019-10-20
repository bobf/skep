import React from 'react';
import * as Icon from 'react-feather';

import Node from './node';
import Overview from './overview';
import Stack from './stack';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this._nodes = [];
    this._stacks = {};
    this.state = {
      nodesMinimized: true,
      stacksMinimized: false,
      collapsedStacks: null,
      modalVisible: false,
      modalHidden: true,
      overviewVisible: false,
      obscured: false
    }
  }

  getNode(hostname) {
    return this._nodes.find(
      node => node.hostname.toLowerCase() === hostname.toLowerCase()
    )
  }

  manifest() {
    const { manifest } = this.state;
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
    this._stacks[stack.name] = this._stacks[stack.name] || React.createRef();
    return (
      <Stack
        dashboard={this}
        ref={this._stacks[stack.name]}
        key={`stack-${stack.name}`}
        stack={stack}
        manifest={this.manifest()}
        collapsed={this.isCollapsed(stack.name)} />
    );
  }

  stacks() {
    return Object.values(this._stacks).map(stack => stack.current);
  }

  nodeComponents() {
    return this.fullNodes().map(node => node.component);
  }

  nodes() {
    return this.fullNodes().map(node => node.ref.current);
  }

  fullNodes() {
    return this.manifest().nodes.map(
      node => this.findOrCreateNode(node)
    ).sort(
      (left, right) => {
        const leftManager = left.ref.current && left.ref.current.manager();
        const leftLeader = left.ref.current && left.ref.current.leader();
        const rightManager = right.ref.current && right.ref.current.manager();
        const rightLeader = right.ref.current && right.ref.current.leader();

        if (leftLeader) return -1;
        if (rightLeader) return 1;
        if (leftManager && !rightManager) return -1;
        if (rightManager && !leftManager) return 1;
        if (left.hostname < right.hostname) return -1;
        if (left.hostname > right.hostname) return 1;
        return 0;
      }
    );
  }

  findOrCreateNode(state) {
    const found = this._nodes.find(node => node.id === state.id);

    if (found) {
      return found;
    }

    const node = this.createNode(state);
    this._nodes.push(node);
    return node;
  }

  createNode(state) {
    const ref = React.createRef();
    return {
      id: state.id,
      hostname: state.hostname,
      ref: ref,
      component: (minimized) => (
        <Node
          key={state.id}
          ref={ref}
          node={state}
          minimized={minimized}
        />
      )
    }
  }

  toggle(id) {
    $(`#${id}`).toggle();
  }

  renderManifestMissing() {
    return (
      <div className={'error'}>
        {'Waiting for data'}
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

  collapseAll(options = {}) {
    const { stacks } = this.manifest();
    const stackNames = stacks.map(stack => stack.name);
    const toCollapse = stackNames.filter(
      name => !options.except || name !== options.except
    );

    this.setState({ collapsedStacks: toCollapse })
  }

  collapse(stackName) {
    const { stacks } = this.manifest();
    this.setState({ collapsedStacks: stacks.map(stack => stack.name) });
  }

  isCollapsed(stackName) {
    const { collapsedStacks } = this.state;

    if (collapsedStacks === null) return true;

    return collapsedStacks.includes(stackName);
  }

  toggleOverview(visible) {
    this.setState({ overviewVisible: visible });

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (visible) {
      this.setState({ modalHidden: false });
      this.setState({ modalVisible: true });
    } else {
      this.setState({ modalHidden: true });
      this.timeout = setTimeout(
        () => this.setState({ modalVisible: false }),
        500
      );
    }
  }

  renderOverviewMinimized() {
    const { overviewVisible } = this.state;
    const className = overviewVisible ? '' : 'visible';
    return (
      <div
        onMouseEnter={() => this.toggleOverview(true)}
        className={`overview-minimized ${className}`}>
        <Icon.ArrowDownCircle className={'icon'} />
      </div>
    );
  }

  renderOverviewModal() {
    const { modalVisible, modalHidden } = this.state;
    const classes = [];
    if (modalVisible) classes.push('visible');
    if (modalHidden) classes.push('hidden');

    return (
      <div className={`overview-modal ${classes.join(' ')}`}></div>
    );
  }

  renderOverview() {
    const { statistics, overviewVisible } = this.state;
    if (!statistics) return null;

    return (
      <Overview
        visible={overviewVisible}
        statistics={statistics}
        closeCallback={() => this.toggleOverview(false)} />
    );
  }

  render() {
    if (!this.manifest()) return this.renderManifestMissing();
    const { nodes } = this.manifest();

    return (
      <div className={'dashboard-overview-wrapper'}>
        {this.renderOverviewMinimized()}
        {this.renderOverview()}
        {this.renderOverviewModal()}
        <div className={this.state.obscured ? 'obscured' : ''} id={'dashboard'}>
          <div className={'section minimized'} id={'nodes'}>
            <div className={'section-content'}>
              {this.nodeComponents().map(
                component => component(this.state.nodesMinimized)
              )}
            </div>
          </div>

          <button
            onClick={() => this.toggleStacks()}
            className={'toggle-section btn btn-secondary'}>
            {this.state.stacksMinimized ? <Icon.ChevronsLeft/> : <Icon.ChevronsRight/>}
          </button>

          <div id={'stacks'} className={'section'}>
            <div className={'section-content'}>
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

export default Dashboard;
