import Service from './service';
import * as Icon from 'react-feather';

class Stack extends React.Component {
  services() {
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
    const icon = collapsed ? <Icon.Eye size={'3em'} /> : <Icon.EyeOff size={'3em'} />
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

  renderCollapsed() {
    const { name } = this.props.stack;
    const services = this.services().map(
      service => (
        <Service
          key={service.name}
          collapsed={true}
          service={service}
        />
      )
    );

    services.unshift(this.headerRow());

    return services;
  }

  renderExpanded() {
    const { name } = this.props.stack;
    const { manifest } = this.props;

    return [this.headerRow(), (
      <tr>
        <td colSpan={4}>
          <div className={'stack'}>
            <div className={'services'}>
              {this.services().map(service => (
                <Service
                  collapsed={false}
                  key={service.name}
                  service={service}
                  manifest={manifest}
                />
              ))}
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
