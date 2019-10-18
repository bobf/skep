import * as Icon from 'react-feather';

import FilesystemStats from './filesystem_stats';
import NodeStats from './node_stats';
import NodeChart from './node_chart';

class Node extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: { previous: {}, current: {} },
      chartData: null,
      chartClosed: true
    };
  }

  hostname() {
    const { hostname } = this.props.node;
    return hostname;
  }

  stats() {
    return this.state.stats;
  }

  containers() {
    return this.stats().current.containers;
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
    }[role];
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
    return (
      <div id={`node-${this.props.node.id}`} className={'node'}>
        {this.renderChart()}
        <Icon.Power className={'light'} size={'1em'} />
        {this.chartButton()}
        <h2 title={'Version: ' + node.version} className={'hostname'}>
          {this.hostname()}
        </h2>
        {minimized ? null : <br/>}
        {this.leaderBadge()}
        {this.roleBadge()}
        <NodeStats
          key={'node_' + node.id + '_stats'}
          minimized={minimized}
          stats={this.stats().current}
        />
      </div>
    );
  }
}

export default Node;
