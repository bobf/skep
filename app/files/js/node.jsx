import React from 'react';
import { connect } from 'react-redux';
import * as Icon from 'react-feather';

import Messages from './messages';

import FilesystemStats from './filesystem_stats';
import NodeStats from './node_stats';
import NodeChart from './node_chart';

import store from './redux/store';
import { requestNodeChart } from './redux/models/charts';
import { selectService } from './redux/models/dashboard';
import { selectNode } from './redux/models/node';

class ConnectedNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tick: 0,
      chartData: null,
      chartClosed: true
    };
  }

  hostname() {
    const { hostname } = this.props.node;
    return hostname;
  }

  agentData() {
    // Data provided by Skep `agent` service
    const { nodes } = this.props;
    return nodes[this.hostname()] || {};
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

  tick() {
    this.setState(prevState => ({ tick: prevState.tick + 1 }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  icon() {
    const { tstamp } = this.agentData();
    const now = Date.now();
    const since = (now - tstamp) / 1000
    const message = Messages.node.lastUpdated(since);
    const classes = ['light'];
    let icon;

    if (since > Skep.thresholds.global.timeout.danger) {
      icon = Icon.AlertCircle;
      classes.push('text-danger');
      classes.push('pulse');
    } else if (since > Skep.thresholds.global.timeout.warning) {
      icon = Icon.AlertCircle;
      classes.push('text-warning');
      classes.push('pulse');
    } else {
      icon = Icon.Power;
    }

    const props = {
      className: classes.join(' '),
      size: '1em',
      'data-original-title': message,
      'data-html': 'true',
      'data-toggle': 'tooltip',
   };

    return React.createElement(icon, props, null);
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
    this.setState({ chartClosed: false });
    store.dispatch(requestNodeChart(this.hostname()));
  }

  closeChart() {
    this.setState({ chartData: null, chartClosed: true });
  }

  chartData() {
    const { node } = this.props.charts;

    return node[this.hostname()];
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

  isSelected() {
    const { selected } = this.agentData();

    return selected;
  }

  isHighlighted() {
    if (this.isSelected()) return false;

    const { selectedService } = this.props.dashboard;
    if (!selectedService) return false;

    const containerIDs = selectedService.tasks.map(task => task.containerID);
    return containerIDs.some(
      containerID => this.containers()
                         .map(container => container.id)
                         .includes(containerID)
    );
  }

  toggle(ev) {
    const { setSelected } = this.props;
    const { nodes } = this.props;

    setSelected(this.hostname());
  }

  renderChart() {
    const { chartClosed } = this.state;
    const chartData = this.chartData();

    if (chartClosed) {
      return null;
    }

    return (
      <NodeChart
        hostname={this.hostname()}
        cores={this.cores()}
        data={chartData}
        closeCallback={() => this.closeChart()} />
    );
  }

  render() {
    const { minimized, node } = this.props;
    const { ping } = this.agentData() || {};
    const classes = ['node'];
    const tooltip = (
      `<div class="tooltip-inner align-left info-tooltip">
         Hostname: <em>${this.hostname()}</em><br/>
         Docker Engine Version: <em>${this.version()}</em>
       </div>`
    );

    if (ping) classes.push('ping');
    if (this.isHighlighted()) classes.push('highlighted');
    if (this.isSelected()) classes.push('selected');
    return (
      <div id={`node-${node.id}`}
           onClick={(ev) => this.toggle(ev)}
           className={classes.join(' ')}>
        {this.renderChart()}
        {this.icon()}
        {this.chartButton()}
        <h2
          className={'hostname'}
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
  return { dashboard: state.dashboard, nodes: state.nodes, charts: state.charts };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSelected: (hostname) => {
      dispatch(selectService(null));
      dispatch(selectNode(hostname));
    },
  }
}

const Node = connect(select, mapDispatchToProps)(ConnectedNode);
export default Node;
