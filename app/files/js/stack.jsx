import Service from './service';
import * as Icon from 'react-feather';

class Stack extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: true };
  }

  componentDidUpdate(_, prevState, __) {
    if (prevState.collapsed !== this.state.collapsed) {
    }
  }

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
    this.setState({ collapsed: false });
    return false;
  }

  collapse() {
    this.setState({ collapsed: true });
    return false;
  }

  renderPortsCollapsed(service) {
    return service.ports.map((mapping, idx) => (
      <span
        key={`ports-${service.name}-${mapping.published}-${mapping.target}`}>
        <span className={'published'}>{mapping.published}</span>
        {':'}
        <span className={'target'}>{mapping.target}</span>
        {idx + 1 < service.ports.length ? <br /> : null}
      </span>
      )
    );
  }

  collapseButton() {
    const { name } = this.props.stack;
    const { collapsed } = this.state;
    const callback = collapsed ? () => this.expand() : () => this.collapse();
    const icon = collapsed ? <Icon.Eye size={18} /> : <Icon.EyeOff size={18} />
    return (
      <button
        type={'button'}
        className={'stack btn btn-info'}
        onClick={callback}>
        {icon}
      </button>
    );
  }

  renderCollapsed() {
    const { name } = this.props.stack;
    const { manifest } = this.props;

    return (
      <div className={'collapsed'}>
        <table>
          <tbody>
            {this.services().map((service, idx) => (
             <tr key={`service-collapsed-${service.name}`} className={'service'}>
               <th className={'name'}>
                 {idx === 0 ? this.collapseButton() : null}
                 {idx === 0 ? name : null }
               </th>
               <td className={'image'}>
                 <span>{service.image.id}:{service.image.tag}</span>
               </td>
               <td className={'ports'}>{this.renderPortsCollapsed(service)}</td>
               <th className={'service-name'}>{service.name}</th>
              </tr>
             ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderExpanded() {
    const { name } = this.props.stack;
    const { manifest } = this.props;

    return (
      <div>
        {this.collapseButton()}
        <h2 className={'name'}>{name}</h2>
        <div className={'services'}>
          {this.services().map(service => (
            <Service
              key={service.name}
              service={service}
              manifest={manifest}
            />
          ))}
        </div>
      </div>
    );
  }

  renderContent() {
    const { collapsed } = this.state;

    if (collapsed) {
      return this.renderCollapsed();
    } else {
      return this.renderExpanded();
    }
  }

  render() {
    const { manifest } = this.props;
    const content = this.renderContent();

    return (
      <div className={'stack'}>
        {content}
      </div>
    );
  }
}

export default Stack;
