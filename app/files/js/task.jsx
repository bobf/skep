import * as Icon from 'react-feather';

import TaskStats from './task_stats';

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  tooltip() {
    const host = `<strong>Host:</strong> ${this.hostname()}`;

    if (!this.slotID()) return host;

    const slot = `<strong>Slot:</strong> ${this.slotID()}`;
    const name = `<strong>Container:</strong> ${this.containerName()}`;
    const digest = `<strong>Digest:</strong> ${this.digest()}`;
    const content = [host, slot, name, digest].join('<br/>');
    return `<div class="task-tooltip">${content}</div>`;
  }

  containerName() {
    const { containerID } = this.props.task;
    const node = this.node();

    if (!node) return "[waiting]";

    const taskContainer = node.containers().find(
      container => container.id === containerID
    );

    return taskContainer && taskContainer.name;
  }

  hostname() {
    const node = this.node();

    return node && node.hostname() || "[waiting]";
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
    const dashboard = stack.dashboard();
    const nodes = dashboard.nodes();

    return nodes.find(
      node => node.hasContainer(containerID)
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
    const nodeStats = this.nodeStats();
    const current = this.containerStats(nodeStats.current);
    const previous = this.containerStats(nodeStats.previous);
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

  render() {
    const { highlight } = this.state;
    const tooltip = this.tooltip();

    return (
      <span className={'task ' + (highlight ? 'highlight' : '')}>
        <span className={'box'}>
          <Icon.Server
            size={'1em'}
            title={tooltip}
            data-toggle={'tooltip'}
            data-container={'body'}
            data-html={'true'}
            data-original-title={tooltip} />
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

export default Task;
