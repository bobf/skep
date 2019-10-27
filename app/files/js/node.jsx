import React from 'react';
import { connect } from 'react-redux';
import * as Icon from 'react-feather';

import FilesystemStats from './filesystem_stats';
import NodeStats from './node_stats';
import NodeChart from './node_chart';

class ConnectedNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: null,
      chartClosed: true
    };
  }

  hostname() {
    const { hostname } = this.props.node;
    return hostname;
  }

  agentData() {
    const { nodes } = this.props;
    return nodes[this.hostname()];
  }

  stats() {
    const node = this.agentData();
    const { previous } = node || {};

    return { current: node, previous: previous };
  }

  containers() {
    const { current } = this.stats();
    if (!current) return [];

    return current.containers;
  }

  hasContainer(containerID) {
    const containers = this.containers();
    if (!containers) return false;
    const IDs = containers.map(container => container.id);
    return IDs.includes(containerID);
  }

  leader() {
    return this.props.node.leader;
  }

  manager() {
    return this.props.node.role === 'manager';
  }

  roleClass() {
    if (this.manager()) {
      return 'primary';
    } else {
      return 'info';
    }
  }

  roleBadge() {
    const { minimized } = this.props;
    const { role } = this.props.node;
    const label = {
      manager: { abbrev: 'M', full: 'Manager', level: 'primary' },
      worker: { abbrev: 'W', full: 'Worker', level: 'info' }
    }[role] || {};
    const tooltip = minimized ? label.full : '';

    return (
      <span
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        className={`badge badge-${label.level} role`}>
        {minimized ? label.abbrev : label.full}
      </span>
    );
  }

  leaderBadge() {
    const { minimized } = this.props;
    const leader = this.leader();
    const label = minimized ? 'L' : 'Leader';
    return (
      <span
        title={minimized ? 'Leader' : ''}
        data-toggle={'tooltip'}
        className={`badge badge-success ${leader ? 'visible' : 'hidden'} leader`}>
        {label}
      </span>
    );
  }

  versionBadge() {
    const { minimized } = this.props;
    if (minimized) return null;

    return (
      <span
        title={'Docker Engine Version'}
        data-toggle={'tooltip'}
        className={'badge badge-secondary'}>
        {this.version()}
      </span>
    );
  }

  chartButton() {
    return (
      <Icon.BarChart2
        className={'icon chart-button'}
        size={'1.2em'}
        title={'View activity'}
        data-toggle={'tooltip'}
        onClick={() => this.loadChart()}
      />
    );
  }

  loadChart() {
    const that = this;
    const token = Skep.token();
    const params = {
      chartType: 'node',
      requestID: token,
      params: { hostname: this.hostname() }
    };

    this.setState({ chartClosed: false });
    Skep.socket.emit('chart_request', params);
    Skep.chartCallbacks[token] = function (data) {
      that.setState({ chartData: data });
    };
  }

  closeChart() {
    this.setState({ chartData: null, chartClosed: true });
  }

  cores() {
    const stats = this.stats().current;
    if (!stats.load) return 1;

    const { cores } = stats.load;
    return cores;
  }

  version() {
    const { version } = this.props.node;

    return version;
  }

  isHighlighted() {
    const { selectedService } = this.props.dashboard;
    if (!selectedService) return false;
    const containerIDs = selectedService.tasks.map(task => task.containerID);
    return containerIDs.some(
      containerID => this.containers()
                         .map(container => container.id)
                         .includes(containerID)
    );
  }

  renderChart() {
    const { chartData, chartClosed } = this.state;

    if (chartClosed) {
      return null;
    }

    return (
      <NodeChart cores={this.cores()} data={chartData} closeCallback={() => this.closeChart()} />
    );
  }

  render() {
    const { minimized, node } = this.props;
    const { ping } = this.agentData() || {};
    const classes = ['node'];
    const tooltip = (
      `<div class="tooltip-inner info-tooltip">
         Hostname: <em>${this.hostname()}</em><br/>
         Docker Engine Version: <em>${this.version()}</em>
       </div>`
    );

    if (ping) classes.push('ping');
    if (this.isHighlighted()) classes.push('highlight');
    return (
      <div id={`node-${node.id}`} className={classes.join(' ')}>
        {this.renderChart()}
        <Icon.Power className={'light'} size={'1em'} />
        {this.chartButton()}
        <h2
          className={'hostname'}
          title={tooltip}
          data-html={'true'}
          data-original-title={tooltip}
          data-toggle={'tooltip'}>
          {this.hostname()}
        </h2>
        <div className={'badges'}>
          {this.leaderBadge()}
          {this.roleBadge()}
          {this.versionBadge()}
        </div>
        <NodeStats
          key={'node_' + node.id + '_stats'}
          minimized={minimized}
          stats={this.stats().current}
        />
      </div>
    );
  }
}

const select = state => {
  return { dashboard: state.dashboard, nodes: state.nodes };
};

const Node = connect(select)(ConnectedNode);
export default Node;
