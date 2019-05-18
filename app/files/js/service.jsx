import Task from './task';
import Environment from './environment';

class Service extends React.Component {
  constructor(props) {
    super(props);
    this.state = { highlight: false };
  }

  updateStatus() {
    const { updated, updating } = this.props.service;

    if (updating) {
      return (
        <span
          title={'Update in progress'}
          className={'updating'}
          data-toggle={'tooltip'}>
        </span>
      );
    }

    return (
      <span
        title={`Updated ${moment(updated).fromNow()}`}
        data-toggle={'tooltip'}
        className={'updated'}>
        &#10003;
      </span>
    );
  }

  renderPortsExpanded() {
    const { ports, id } = this.props.service;

    return ports.map(
      mapping => (
        <div
          key={`service-${id}-${mapping.published}-${mapping.target}`}
          className={'ports'}>
          <span
            data-toggle={'tooltip'}
            title={'Published Port'}
            className={'published port'}>
            {':'}
            {mapping.published}
          </span>
          <span className={'published arrow'}>
            &#8615;
          </span>
          <span
            data-toggle={'tooltip'}
            title={'Target Port'}
            className={'target port'}>
            {':'}
            {mapping.target}
          </span>
          <span className={'target arrow'}>
            &#8613;
          </span>
        </div>
      )
    );
  }

  runningCount() {
    const { tasks } = this.props.service;
    return tasks.filter(task => task.state === 'running').length;
  }

  level() {
    const { tasks } = this.props.service;
    const running = this.runningCount();
    const total = tasks.length;

    switch (running) {
      case 0:
        return 'danger'
      case total:
        return 'success'
      default:
        return 'warning'
    }
  }

  statusSymbol() {
    switch (this.level()) {
      case 'danger':
        return '';
      case 'success':
        return '✓';
      case 'warning':
        return '✗';
    }
  }

  countBadge() {
    const { tasks } = this.props.service;

    return (
      <span
        title={`${this.runningCount()} / ${tasks.length} replicas running ${this.statusSymbol()}`}
        className={`badge bg-${this.level()}`}
        data-toggle={'tooltip'}>
        {tasks.length}
      </span>
    );
  }

  renderPortsCollapsed() {
    const { service } = this.props;

    return service.ports.map((mapping, idx) => (
      <span
        className={'ports'}
        key={`ports-${service.name}-${mapping.published}-${mapping.target}`}>
        <span className={'published'}>{mapping.published}</span>
        {':'}
        <span className={'target'}>{mapping.target}</span>
        {idx + 1 < service.ports.length ? <br /> : null}
      </span>
      )
    );
  }

  highlightNodes(highlight) {
    const $nodes = $(this.nodesSelector());

    if (highlight) {
      $nodes.addClass('highlight');
      this.setState({ highlight: true });
    } else {
      $nodes.removeClass('highlight');
      this.setState({ highlight: false });
    }

    return false;
  }

  nodesSelector() {
    const { tasks } = this.props.service;
    return tasks.map(task => `#node-${task.node_id}`).join(', ');
  }

  renderCollapsed() {
    const { service } = this.props;

    return (
      <tr
        onMouseEnter={() => this.highlightNodes(true)}
        onMouseLeave={() => this.highlightNodes(false)}
        key={`service-collapsed-${service.name}`}
        className={`service collapsed ${this.state.highlight ? 'highlight' : ''}`}>
        <th className={'service-name'}>
          {this.updateStatus()}
          {service.name}
          {this.countBadge()}
        </th>
        <td className={'image'}>
          <span>{service.image.id}:{service.image.tag}</span>
        </td>
        <td className={'ports'}>{this.renderPortsCollapsed()}</td>
     </tr>
    );
  }

  renderExpanded() {
    const { name, image, environment } = this.props.service;

    return (
      <div className={'service'}>
        <h2>
          {this.updateStatus()}
          <span className={'title'}>{name}</span>
          <span className={'tag'}>
            {`[${image.id}:${image.tag}]`}
          </span>
          {this.renderPortsExpanded()}
        </h2>

        <Environment name={name} environment={environment} />

        <div className={'tasks'}>
          {this.props.service.tasks.map(task => (
            <Task
              key={task.id}
              task={task}
              manifest={this.props.manifest}
            />
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { collapsed } = this.props;

    return collapsed ? this.renderCollapsed() : this.renderExpanded();
  }
}

export default Service;
