import { connect } from 'react-redux';
import * as Icon from 'react-feather';

import Messages from './messages';
import TaskStats from './task_stats';
import TaskChart from './task_chart';

import store from './redux/store';
import { requestContainerChart } from './redux/models/charts';

class ConnectedTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = { chartData: null, chartClosed: true };
  }

  tooltip() {
    const error = this.formattedErrors();
    const host = `Host: <em>${this.hostname()}</em>`;

    if (!this.slotID()) return error;

    const upToDate = `Status: <em>${Messages.task.upToDate(this.isUpToDate())}</em>`;
    const slot = `Slot: <em>${this.slotID()}</em>`;
    const name = `Container: <em>${this.containerName()}</em>`;
    const digest = `Digest: <em>${this.digest(true)}</em>`;
    const content = [slot, name, digest, upToDate, error].filter(item => item).join('<br/>');
    return `<div class="align-left info-tooltip">${content}</div>`;
  }

  formattedErrors() {
    const { errors } = this.props.task;
    if (!errors.length) return null;

    const errorLines = errors.map(error => Messages.task.error(error)).join('<br/>');

    return `Errors:<br/><div class='errors'>${errorLines}</div>`;
  }

  containerName() {
    const { containerID } = this.props.task;
    const node = this.node();

    if (!node) return "[waiting]";

    const taskContainer = node.containers.find(
      container => container.id === containerID
    );

    return taskContainer && taskContainer.name;
  }

  hostname() {
    const node = this.node();

    return node && node.hostname || "[waiting]";
  }

  digest(human) {
    const { digest } = this.props.task.image;

    if (!digest) return human ? '[waiting]' : null;

    return human ? digest.substring(0, 16) : digest;
  }

  slotID() {
    const { slot } = this.props.task;

    return slot;
  }

  isUpToDate() {
    const { upToDate } = this.props.task;

    return upToDate;
  }

  when() {
    const { when } = this.props.task;

    return moment(when);
  }

  isHighlighted() {
    const { nodes } = this.props;
    const node = Object.values(nodes).find(node => node.selected);
    if (!node) return false;

    const { containerID } = this.props.task;
    const { containers } = node;

    return containers.map(container => container.id).includes(containerID);
  }

  node() {
    const { containerID } = this.props.task;
    const { stack } = this.props;
    const { nodes } = this.props;

    return Object.values(nodes).find(
      node => node.containers.map(container => container.id).includes(containerID)
    );
  }

  nodeStats() {
    const node = this.node();
    if (!node) return {};
    return node.stats();
  }

  containerStats(nodeStats) {
    const { containerID } = this.props.task;

    if (!nodeStats) return null;

    return (nodeStats.containers || []).find(
      container => container.id === containerID
    );
  }

  stats() {
    const node = this.node() || {};
    const current = this.containerStats(node);
    const previous = this.containerStats(node.previous);
    return { current: current || {}, previous: previous || {} };
  }

  level() {
    const { state } = this.props.task;

    switch (state) {
      case 'running':
        return 'success';
      default:
        return 'secondary';
    }
  }

  loadChart() {
    const { containerID } = this.props.task;

    this.setState({ chartClosed: false });
    store.dispatch(requestContainerChart(containerID));
  }

  closeChart() {
    this.setState({ chartData: null, chartClosed: true });
  }

  chartData() {
    const { containerID } = this.props.task;
    const { container } = this.props.charts;

    return container[containerID];
  }

  renderState() {
    const { state } = this.props.task;

    return (
      <div className={`badge bg-${this.level()}`}>
        {state}
      </div>
    );
  }

  renderMessage() {
    const { message, when } = this.props.task;
    const tooltip = this.when().fromNow();
    return (
      <div
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        className={'badge bg-primary'}>
        {message}
      </div>
    );
  }

  renderChart() {
    const { containerID } = this.props.task;
    const { chartData, chartClosed } = this.state;

    if (chartClosed) {
      return null;
    }

    return (
      <TaskChart
        data={this.chartData()}
        containerID={containerID}
        hostname={this.hostname()}
        closeCallback={() => this.closeChart()} />
    );
  }

  render() {
    const tooltip = this.tooltip();
    const classes = ['task'];
    const isUpToDate = this.isUpToDate();
    const { errors } = this.props.task;
    const { updating } = this.props;

    if (this.isHighlighted()) classes.push('highlighted');
    if (!isUpToDate) classes.push('out-of-sync');
    if (updating && isUpToDate) classes.push('synced');
    const iconClass = errors.length ? 'text-danger' : (isUpToDate ? '' : 'text-warning');

    return (
      <span className={classes.join(' ')}>
        {this.renderChart()}
        <span className={'box'}>
          <div className={'info-icons'}>
            <Icon.Info
              className={`icon info ${iconClass}`}
              data-toggle={'tooltip'}
              data-container={'body'}
              data-html={'true'}
              data-original-title={tooltip} />
            <br />
            <Icon.BarChart2
              title={'View activity'}
              data-toggle={'tooltip'}
              onClick={() => this.loadChart()}
              className={'icon chart-button'}
            />
          </div>
          <div className={'badges'}>
            {this.renderState()}
            {this.renderMessage()}
          </div>
          <TaskStats stats={this.stats()} />
        </span>
      </span>
    );
  }
}

const select = (state) => {
  return { nodes: state.nodes, charts: state.charts };
}

const Task = connect(select)(ConnectedTask);
export default Task;
