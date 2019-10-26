import { connect } from 'react-redux';
import * as Icon from 'react-feather';

import TaskStats from './task_stats';
import TaskChart from './task_chart';

class ConnectedTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = { chartData: null, chartClosed: true };
  }

  tooltip() {
    const host = `Host: <em>${this.hostname()}</em>`;

    if (!this.slotID()) return host;

    const slot = `Slot: <em>${this.slotID()}</em>`;
    const name = `Container: <em>${this.containerName()}</em>`;
    const digest = `Digest: <em>${this.digest() || '[none]'}</em>`;
    const content = [host, slot, name, digest].join('<br/>');
    return `<div class="info-tooltip">${content}</div>`;
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

  digest() {
    if (!this.props.task.image) {
      return null;
    }

    const { digest } = this.props.task.image;

    return digest;
  }

  slotID() {
    const { slot } = this.props.task;

    return slot;
  }

  when() {
    const { when } = this.props.task;

    return moment(when);
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

  highlightNode(state) {
    const node = this.node();

    if (!node) return false;

    this.setState({ highlight: state });
    $(`#node-${node.id}`).toggleClass('highlight', state);
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
    const that = this;
    const token = Skep.token();
    const { containerID } = this.props.task;
    const params = {
      chartType: 'container',
      requestID: token,
      params: { containerID: containerID }
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
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        className={'badge bg-primary'}>
        {message}
      </div>
    );
  }

  renderChart() {
    const { chartData, chartClosed } = this.state;

    if (chartClosed) {
      return null;
    }

    return (
      <TaskChart
        data={chartData}
        hostname={this.hostname()}
        closeCallback={() => this.closeChart()} />
    );
  }

  render() {
    const { highlight } = this.state;
    const tooltip = this.tooltip();

    return (
      <span className={'task ' + (highlight ? 'highlight' : '')}>
        {this.renderChart()}
        <span className={'box'}>
          <div className={'info-icons'}>
            <Icon.Info
              title={tooltip}
              className={'icon info'}
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
  return { nodes: state.nodes };
}

const Task = connect(select)(ConnectedTask);
export default Task;
