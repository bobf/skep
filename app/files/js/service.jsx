import Task from './task';
import Environment from './environment';
import Mounts from './mounts';
import Messages from './messages';

import { selectService } from './redux/models/dashboard';
import { selectNode } from './redux/models/node';

import { connect } from 'react-redux';
import * as Icon from 'react-feather';

class ConnectedService extends React.Component {
  constructor(props) {
    super(props);
  }

  replicas() {
    const { replicas } = this.props.service;
    const { nodes } = this.props.swarm.manifest;

    if (replicas !== null) return replicas;

    return nodes && Object.values(nodes).length;
  }

  imageMismatch() {
    const { image } = this.props.service;

    return this.tasks().some(
      task => task.image && image ? task.image.digest !== image.digest : false
    );
  }

  unknownDigest() {
    const { image } = this.props.service;

    if (image && image.digest) return false;

    return true;
  }

  shortDigest() {
    const { image } = this.props.service;

    if (image && image.digest) {
      return image.digest.substring(0, 16);
    }

    return '[unknown]';
  }

  stateIconWarning(message) {
    return (
      <span
        title={message}
        className={'service-icon text-warning update-warning'}
        data-toggle={'tooltip'}
        data-html={'true'}
        data-original-title={message}>
        <Icon.AlertTriangle className={'icon'} />
      </span>
    );
  }

  stateIconUpdating(message) {
    return (
      <span
        title={message}
        data-original-title={message}
        className={'service-icon updating'}
        data-html={'true'}
        data-toggle={'tooltip'}>
        <Icon.RefreshCw className={'icon'} />
      </span>
    );
  }

  stateIconPaused(renderMessage) {
    const { stateMessage } = this.props.service;
    const message = renderMessage(stateMessage);
    return (
      <span
        title={message}
        className={'service-icon text-danger'}
        data-toggle={'tooltip'}
        data-html={'true'}
        data-original-title={message}>
        <Icon.PauseCircle className={'icon'} />
      </span>
    );
  }

  stateIconError(renderMessage) {
    const { state } = this.props.service;
    const message = renderMessage(state);
    return (
      <span
        title={message}
        className={'service-icon text-danger'}
        data-toggle={'tooltip'}
        data-html={'true'}
        data-original-title={message}>
        <Icon.AlertOctagon className={'icon'} />
      </span>
    );
  }

  stateIconComplete(renderMessage) {
    const { updated, created } = this.props.service;
    const time = updated || created;
    const message = renderMessage(moment(time).fromNow(), this.shortDigest());

    return (
      <span
        title={message}
        className={'service-icon text-success'}
        data-toggle={'tooltip'}
        data-html={'true'}
        data-original-title={message}>
        <Icon.CheckCircle className={'icon'} />
      </span>
    );
  }

  stateIcon(type, messageDescriptor) {
    const message = Messages.service.state[messageDescriptor];
    switch (type) {
      case 'updating': return this.stateIconUpdating(message);
      case 'paused': return this.stateIconPaused(message);
      case 'warning': return this.stateIconWarning(message);
      case 'success': return this.stateIconComplete(message);
      case 'error': return this.stateIconError(message);
    }
  }

  updateStatus() {
    const { updated, image, state, updating } = this.props.service;
    const messages = Messages.service.state;

    if (!updating) {
      if (this.imageMismatch()) return this.stateIcon('warning', 'inconsistentImages');
      if (this.unknownDigest()) return this.stateIcon('warning', 'unknownDigest');
    }

    switch (state) {
      case 'rollback_started': return this.stateIcon('updating', 'rollbackStarted');
      case 'rollback_paused': return this.stateIcon('paused', 'rollbackPaused');
      case 'rollback_completed': return this.stateIcon('success', 'rollbackComplete');
      case 'updating': return this.stateIcon('updating', 'updateStarted');
      case 'paused': return this.stateIcon('paused', 'updatePaused');
      case 'completed': return this.stateIcon('success', 'updateComplete');
      case null: return this.stateIcon('success', 'noUpdate');
    }

    return this.stateIcon(this.stateIcon('error', 'unrecognized'));
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
            {mapping.published}
          </span>
          <span className={'punctuation'}>
            {':'}
          </span>
          <span
            data-toggle={'tooltip'}
            title={'Target Port'}
            className={'target port'}>
            {mapping.target}
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
    const { tasks, errors } = this.props.service;
    const running = this.runningCount();
    const total = this.replicas();

    if (errors.length) {
      return 'danger';
    }

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
    const { tasks, errors } = this.props.service;
    const message = Messages.service.replicas.tooltip(
      this.replicas(), this.runningCount(), this.statusSymbol()
    );
    const tooltip = [message];
    if (errors.length) tooltip.push(Messages.service.replicas.errors(errors));

    return (
      <span
        className={`badge bg-${this.level()}`}
        data-html={'true'}
        data-original-title={`<div class='align-left'>${tooltip.join('<br/>')}</div>`}
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
        <span
          data-toggle={'tooltip'}
          title={'Published Port'}
          className={'published'}>
          {mapping.published}
        </span>
        <span className={'punctuation'}>
          {':'}
        </span>
        <span
          data-toggle={'tooltip'}
          title={'Target Port'}
          className={'target'}>{mapping.target}</span>
        {idx + 1 < service.ports.length ? <br /> : null}
      </span>
      )
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

  isHighlighted() {
    const { nodes } = this.props;
    const node = Object.values(nodes).find(node => node.selected);
    if (!node) return false;

    const { tasks } = this.props.service;
    const selectedContainerIDs = new Set(node.containers.map(container => container.id));
    const intersect = tasks.filter(task => selectedContainerIDs.has(task.containerID));

    return intersect.length > 0;
  }

  isSelected() {
    const { selectedService } = this.props.dashboard;
    if (!selectedService) return false;

    const { id } = this.props.service;

    return selectedService.id === id;
  }

  commonNetworks() {
    const { selectedService } = this.props.dashboard;
    const { networks, id } = this.props.service;
    if (!selectedService) return [];
    if (this.isSelected()) return [];

    const { stacks } = this.props.swarm.manifest;
    const service = stacks.map(stack => stack.services)
                          .flat()
                          .find(service => service.id === selectedService.id);
    if (!service) return []; // should never happen ?

    const networkIds = new Set(networks.map(network => network.id));
    const serviceNetworkIds = service.networks.map(network => network.id);
    const intersect = serviceNetworkIds.filter(id => networkIds.has(id));

    return intersect;
  }

  networkLabel(network) {
    return (
      `<span class="nowrap">
         <span class='network-name'>${network.name}</span>
         <span class='punctuation'>&nbsp;[</span>
         <span class='network-id'>${network.id.substring(6)}</span>
         <span class='punctuation'>]</span>
       </span>`
    );
  }

  networkNames(networkIDs) {
    if (!networkIDs.length) return [];

    const idSet = new Set(networkIDs);
    const { networks } = this.props.swarm.manifest;
    return networks.filter(network => idSet.has(network.id))
                   .map(network => this.networkLabel(network));
  }

  nodesSelector() {
    const { tasks } = this.props.service;
    return tasks.map(task => `#node-${task.nodeID}`).join(', ');
  }

  tasks() {
    const { tasks } = this.props.service;

    return tasks;
  }

  toggle(ev) {
    if (['A', 'SPAN'].includes(ev.target.tagName)) return false;

    const { service, setSelected } = this.props;

    setSelected(this.isSelected() ? null : service);

    return false;
  }

  modeIcon(mode) {
    switch (mode) {
      case 'global':
        return Icon.Globe;
      case 'replicated':
        return Icon.Copy;
    }
  }

  renderMode() {
    const { mode } = this.props.service;
    const icon = this.modeIcon(mode);
    const title = `Deployment mode: <em>${mode}</em>`;

    return React.createElement(
      icon,
      {
        title: title,
        'data-toggle': 'tooltip',
        'data-html': 'true',
        className: 'mode-icon'
      }
    );
  }

  nameLink() {
    const { service } = this.props;

    if (!service.nameURL) return (
      <span className={'service-name'}>
        {service.name}
      </span>
    );

    return (
      <a className={'service-name'} href={service.nameURL} target={'_blank'}>
        {service.name}
      </a>
    );
  }

  imageLabel() {
    const { organization, repository, tag } = this.props.service.image;
    return (
      <span className={'image-label'}>
        <span className={'organization'}>
          {organization}
        </span>
        <span className={'punctuation'}>
          {'/'}
        </span>
        <span className={'repository'}>
          {repository}
        </span>
        <span className={'punctuation'}>
          {':'}
        </span>
        <span className={'tag'}>
          {tag}
        </span>
      </span>
    );
  }

  imageLink() {
    const { imageURL } = this.props.service;

    if (!imageURL) return (
      <span className={'image'}>
        {this.imageLabel()}
      </span>
    );

    return (
      <a className={'image'} href={imageURL} target={'_blank'}>
        {this.imageLabel()}
      </a>
    );
  }

  renderCollapsed() {
    const { name, environment, mounts, updating } = this.props.service;
    const { stack, service, dashboard } = this.props;
    const classes = ['service', 'collapsed'];
    const networks = this.commonNetworks();
    const networkMessage = Messages.service.networks(this.networkNames(networks));
    const networkTooltip = `<div class="tooltip-inner align-left">${networkMessage}</div>`

    if (this.isSelected()) classes.push('selected');
    if (this.isHighlighted()) classes.push('highlighted');
    if (updating) classes.push('updating');
    if (networks.length) classes.push('networked');

    return (
      <tr
        onClick={(ev) => this.toggle(ev)}
        key={`service-collapsed-${service.name}`}
        className={classes.join(' ')}>
        <th className={'service-title'}>
          <span
            className={'network-icon'}
            data-title={networkTooltip}
            data-html={'true'}
            data-original-title={networkTooltip}
            data-toggle={'tooltip'}>
            <Icon.Wifi size={'1.4em'} />
          </span>
          {this.countBadge()}
          {this.renderMode()}
          <span>
            {this.nameLink()}
          </span>
        </th>
        <td>
          <Environment compact={true} serviceName={name} environment={environment} />
          <Mounts compact={true} serviceName={name} mounts={mounts} />
          {this.updateStatus()}
          <span className={'image-id'}>{this.imageLink()}</span>
        </td>
        <td className={'ports'}>
          {this.renderPortsCollapsed()}
        </td>
     </tr>
    );
  }

  renderExpanded() {
    const { name, image, environment, mounts, updating } = this.props.service;
    const { stack } = this.props;

    return (
      <div className={'service ' + (updating ? 'updating' : '')}>
        <div className={'service-badges'}>
          {this.countBadge()}
          {this.renderMode()}
        </div>
        <h2>
          <span className={'title'}>{this.nameLink()}</span>
        </h2>

        <div className={'buttons'}>
          <Environment serviceName={name} environment={environment} />
          <Mounts serviceName={name} mounts={mounts} />
          <div className={'image-wrapper'}>
            {this.updateStatus()}
            {this.imageLink()}
          </div>
          {this.renderPortsExpanded()}
        </div>

        <div className={'tasks'}>
          {this.tasks().map(task => (
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

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes, dashboard: state.dashboard };
};

const mapDispatchToProps = dispatch => {
  return {
    setSelected: serviceName => {
      dispatch(selectNode(null));
      dispatch(selectService(serviceName));
    },
  };
};

const Service = connect(select, mapDispatchToProps)(ConnectedService);
export default Service;
