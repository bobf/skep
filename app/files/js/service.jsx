import Task from './task';
import Environment from './environment';
import Mounts from './mounts';

import * as Icon from 'react-feather';

class Service extends React.Component {
  constructor(props) {
    super(props);
    this.state = { highlight: false };
  }

  highlight(highlight, className) {
    this.setState({ highlight: highlight, highlightClass: className });
  }

  updateStatus() {
    const { updated, updating } = this.props.service;

    if (updating) {
      const tooltip = 'Update in progress';
      return (
        <span
          title={tooltip}
          className={'updating'}
          data-original-title={tooltip}
          data-toggle={'tooltip'}>
        </span>
      );
    }

    const tooltip = `Updated ${moment(updated).fromNow()}`;
    return (
      <span
        title={tooltip}
        data-original-title={tooltip}
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
    const tooltip = `${this.runningCount()} / ${tasks.length} replicas running ${this.statusSymbol()}`;

    return (
      <span
        className={`badge bg-${this.level()}`}
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}>
        {this.runningCount()}
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

  highlightRelated(highlight) {
    this.highlightNodes(highlight);
    this.highlightNetworkedServices(highlight);
    this.highlight(highlight);

    return false;
  }

  highlightNodes(highlight) {
    const $nodes = $(this.nodesSelector());

    if (highlight) {
      // move to Node
      $('.node').removeClass('highlight');
      $nodes.addClass('highlight');
    } else {
      // move to Node
      $('.node').removeClass('highlight');
    }
  }

  highlightNetworkedServices(highlight) {
    const { stack } = this.props;
    this.networkedServices().forEach(
      service => service.highlight(highlight, 'networked')
    );
  }

  name() {
    const { name } = this.props.service;
    return name;
  }

  networks() {
    const { networks } = this.props.service;
    return networks;
  }

  networkedServices() {
    const { stack } = this.props;
    return stack
           .dashboard()
           .services()
           .filter(service => this.isNetworkedService(service));
  }

  isNetworkedService(service) {
    const { networks, name } = this.props.service;
    if (service.name() === name) return false;

    const networkIds = new Set(networks.map(network => network.id));
    const serviceNetworkIds = service.networks().map(network => network.id);
    const intersect = serviceNetworkIds.filter(id => networkIds.has(id));

    return intersect.length > 0;
  }

  nodesSelector() {
    const { tasks } = this.props.service;
    return tasks.map(task => `#node-${task.nodeID}`).join(', ');
  }

  toggle() {
    const { highlight } = this.state;
    const { stack } = this.props;
    if (!highlight) {
      stack.dashboard().services().map(
        service => service.highlight(false)
      );
    }

    this.highlight(!highlight);
    this.highlightRelated(!highlight);
    return false;
  }

  renderCollapsed() {
    const { service } = this.props;
    const { highlight } = this.state;
    const highlightClass = highlight ? `highlight ${this.state.highlightClass}` : '';

    return (
      <tr
        onClick={() => this.toggle()}
        key={`service-collapsed-${service.name}`}
        className={`service collapsed ${highlightClass}`}>
        <th className={'service-name'}>
          <span className={'network-icon'}>
            <Icon.Wifi size={'1.4em'} />
          </span>
          {this.updateStatus()}
          {service.name}
          {this.countBadge()}
        </th>
        <td className={'image'}>
          <span>{service.image.id}:{service.image.tag}</span>
        </td>
        <td className={'ports'}>
          {this.renderPortsCollapsed()}
        </td>
     </tr>
    );
  }

  renderExpanded() {
    const { name, image, environment, mounts } = this.props.service;
    const { stack } = this.props;
    const dashboard = stack.dashboard();

    return (
      <div className={'service'}>
        <h2>
          {this.updateStatus()}
          <span className={'title'}>{name}</span>
          <Environment name={name} dashboard={dashboard} environment={environment} />
          <Mounts name={name} mounts={mounts} />
          <span className={'tag'}>
            {`[${image.id}:${image.tag}]`}
          </span>

          {this.renderPortsExpanded()}
        </h2>

        <div className={'tasks'}>
          {this.props.service.tasks.map(task => (
            <Task
              key={task.id}
              task={task}
              stack={stack}
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
