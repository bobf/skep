import Service from './service';
import * as Icon from 'react-feather';

class Stack extends React.Component {
  constructor(props) {
    super(props);
    this.state = { highlight: {} }
    this._services = {};
  }

  services() {
    return Object.values(this._services).map(service => service.current);
  }

  sortedServices() {
    return this.props.stack.services.sort(
      (left, right) => {
        if (left.ports.length && !right.ports.length) return -1;
        if (!left.ports.length && right.ports.length) return 1;
        if (left.name < right.name) return -1;
        if (left.name > right.name) return 1;
        return 0;
      }
    );
  }

  dashboard() {
    const { dashboard } = this.props;
    return dashboard;
  }

  expand() {
    const { name } = this.props.stack;
    const { dashboard } = this.props;

    dashboard.collapseAll({ except: name });

    return false;
  }

  collapse() {
    const { dashboard } = this.props;
    const { name } = this.props.stack;

    dashboard.collapse(name);

    return false;
  }

  collapseButton() {
    const { name } = this.props.stack;
    const { collapsed } = this.props;
    const callback = collapsed ? () => this.expand() : () => this.collapse();
    const icon = collapsed ? <Icon.Eye className={'icon expand'} /> : <Icon.EyeOff className={'icon expand'} />
    return (
      <button
        type={'button'}
        className={'stack btn btn-info'}
        onClick={callback}>
        {icon}
      </button>
    );
  }

  headerRow() {
    const { name } = this.props.stack;
    const { collapsed } = this.props;
    const className = collapsed ? 'collapsed' : 'expanded';

    return (
      <tr key={`stack-${name}-header-row`} className={`stack header ${className}`}>
        <th colSpan={4} className={'name'}>
          <span className={'name'}>{name}</span>
          {this.collapseButton()}
        </th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    );
  }

  serviceRef(service) {
    this._services[service.name] = this._services[service.name] || React.createRef();
    return this._services[service.name];
  }

  renderService(service, collapsed) {
    const { manifest } = this.props;
    const ref = this.serviceRef(service);
    return (
      <Service
        collapsed={collapsed}
        ref={ref}
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
    const services = this.sortedServices().map(service => this.renderService(service, true));

    services.unshift(this.headerRow());

    return services;
  }

  renderExpanded() {
    const { name } = this.props.stack;
    const { manifest } = this.props;

    return [this.headerRow(), (
      <tr key={`service-row-${name}`}>
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
    const { collapsed } = this.props;

    if (collapsed) {
      return this.renderCollapsed();
    } else {
      return this.renderExpanded();
    }
  }

  render() {
    const { manifest } = this.props;
    return this.renderContent();
  }
}

export default Stack;
