import React from 'react';
import * as Icon from 'react-feather';
import { connect } from 'react-redux';
import $ from 'jquery';

import { selectStack } from './redux/models/dashboard';
import Service from './service';

class ConnectedStack extends React.Component {
  constructor(props) {
    super(props);
    this.state = { highlight: {} }
    this._services = {};
  }

  isExpanded() {
    const { selectedStack } = this.props.dashboard;
    const { name } = this.props.stack;

    return selectedStack === name;
  }

  services() {
    return Object.values(this._services).map(service => service.current);
  }

  sortedServices() {
    return this.props.stack.services.sort(
      (left, right) => {
        if (left.name < right.name) return -1;
        if (left.name > right.name) return 1;
        return 0;
      }
    );
  }

  expand() {
    const { name } = this.props.stack;
    const { setExpandedStack } = this.props;

    setExpandedStack(name);

    return false;
  }

  collapse() {
    const { setExpandedStack } = this.props;

    setExpandedStack(null);

    return false;
  }

  collapseIcon(expanded) {
    if (expanded) return <Icon.ChevronUp className={'icon expand'} />

    return <Icon.ChevronDown className={'icon expand'} />
  }

  collapseButton() {
    const { name } = this.props.stack;
    const expanded = this.isExpanded();
    const callback = expanded ? () => this.collapse() : () => this.expand();
    const icon = this.collapseIcon(expanded);
    return (
      <button
        type={'button'}
        className={'stack btn btn-primary'}
        onClick={callback}>
        {icon}
      </button>
    );
  }

  overviewBadge() {
    const { services, name } = this.props.stack;
    const { nodes } = this.props.manifest;

    const getRunningCount = (service) => service.tasks.filter(task => task.state === 'running').length;
    const getExpectedCount = (service) => service.replicas === null ? Object.values(nodes).length : service.replicas;
    const getServiceLevel = (service) => {
      const runningCount = getRunningCount(service);
      return runningCount === getExpectedCount(service) ? 2 : (runningCount === 0 ? 0 : 1);
    };

    const serviceLevels = ['danger', 'warning', 'success'];

    const summary = services.map(
      service => {
        const level = serviceLevels[getServiceLevel(service)];
        return `<div class='service-overview align-left'><em><span class="text-${level}">&#11042; </span><b>${service.name}<b></em>: ${getRunningCount(service)}<em>/</em>${getExpectedCount(service)} <em>replicas running.</em></div>`;
      }
    ).join("\n");

    const stackLevel = serviceLevels[services.reduce(
      (level, service) => {
        const serviceLevel = getServiceLevel(service);
        return Math.min(serviceLevel, level);
      },
    2)];

    return (
      <span
        key={`${name}-overview-badges`}
        className={`stack-overview badge bg-${stackLevel}`}
        data-html={'true'}
        data-original-title={summary}
        data-toggle={'tooltip'}>
        {services.reduce((count, service) => count + service.tasks.length, 0)}
      </span>
    );
  }

  summary() {
    return (
      <div className="stack-summary-wrapper">
        <div className="stack-summary">
          <div className="cell overview-badges">{this.overviewBadge()}</div>
        </div>
      </div>
    );
  }

  headerRow() {
    const { name } = this.props.stack;
    const { fullyCollapsed, dashboard } = this.props;
    const showSummary = fullyCollapsed && !this.isExpanded();
    const classes = ['collapsed'];
    const darken = dashboard.selectedStack && !this.isExpanded() && fullyCollapsed;
    if (darken) classes.push('darken');

    return (
      <tr key={`stack-${name}-header-row`} className={`stack header ${classes.join(' ')}`}>
        <th colSpan={4} className={'name'}>
          {darken ? <div className="overlay"></div> : null}
          <span className={'name'}>{name}</span>
          {this.collapseButton()}
          {showSummary ? this.summary() : null}
        </th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    );
  }

  renderService(service, collapsed) {
    const { manifest } = this.props;
    return (
      <Service
        collapsed={collapsed}
        key={service.name}
        service={service}
        stack={this}
        manifest={manifest}
        highlight={this.state.highlight[service.name]}
      />
    );
  }

  renderCollapsed() {
    const { name } = this.props.stack;
    const { fullyCollapsed } = this.props;
    if (fullyCollapsed) return [this.headerRow()];

    const services = this.sortedServices().map(service => this.renderService(service, true));

    services.unshift(this.headerRow());

    return services;
  }

  renderExpanded() {
    const { name } = this.props.stack;
    const { manifest } = this.props;

    return [this.headerRow(), (
      <tr key={`service-row-${name}`} className={'expanded'}>
        <td colSpan={4}>
          <div className={'stack'}>
            <div className={'services'}>
              {this.sortedServices().map(service => this.renderService(service, false))}
            </div>
          </div>
        </td>
      </tr>
    )];
  }

  renderContent() {
    if (this.isExpanded()) {
      return this.renderExpanded();
    } else {
      return this.renderCollapsed();
    }
  }

  render() {
    const { manifest } = this.props;
    return this.renderContent();
  }
}

const select = (state) => {
  return { dashboard: state.dashboard };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setExpandedStack: stackName => dispatch(selectStack(stackName))
  };
};

const Stack = connect(select, mapDispatchToProps)(ConnectedStack);
export default Stack;
