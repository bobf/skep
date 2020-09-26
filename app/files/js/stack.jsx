import * as Icon from 'react-feather';
import { connect } from 'react-redux';

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

  tasksSummary() {
    const { services } = this.props.stack;
    const tasks = services.map(service => service.tasks).flat();
    return (
      <span className="stack-overview tasks summary">
        <span>Tasks</span>
        <em>{tasks.length}</em>
      </span>
    );
  }

  servicesSummary() {
    const { services } = this.props.stack;
    return (
      <span className="stack-overview services summary">
        <span>Services</span>
        <em>{services.length}</em>
      </span>
    );
  }

  overviewBadges() {
    const { services } = this.props.stack;
    const { nodes } = this.props.manifest;

    return services.map(
      service => {
        const runningCount = service.tasks.filter(task => task.state === 'running').length;
        const expectedCount = service.replicas === null ? Object.values(nodes).length : service.replicas;
        const level = runningCount === expectedCount ? 'success' : (runningCount === 0 ? 'danger' : 'warning');
        const tooltip = `<div class='align-left'><em><b>${service.name}<b></em><br/>${runningCount}<em>/</em>${expectedCount} <em>replicas running.</em></div>`;
        return (
          <span
            key={`${service.name}-overview-badges`}
            className={`stack-overview badge bg-${level}`}
            data-html={'true'}
            data-original-title={tooltip}
            data-toggle={'tooltip'}>
            {runningCount}
          </span>
        );
      }
    );
  }

  summary() {
    return (
      <div className="stack-summary-wrapper">
        <div className="stack-summary">
          <div className="cell services-summary">{this.servicesSummary()}</div>
          <div className="cell syntax">|</div>
          <div className="cell tasks-summary">{this.tasksSummary()}</div>
          <div className="cell overview-badges">{this.overviewBadges()}</div>
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
