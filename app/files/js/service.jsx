import Task from './task';

class Service extends React.Component {
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

  countBadge() {
    const { tasks } = this.props.service;

    return (
      <span
        title={`${tasks.length} replica(s)`}
        className={'badge bg-primary'}
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

  environment() {
    const { environment, name } = this.props.service;
    const env = [];
    for (const [key, value] of Object.entries(environment)) {
      env.push(
        <div
          key={`env-${name}-${key}`}
          className={'keypair'}>
          <span className={'key'}>{key}</span>
          <span className={'syntax'}>{'='}</span>
          <span className={'value'}>{value}</span>
        </div>
      );
    }

    return env;
  }

  renderCollapsed() {
    const { service } = this.props;

    return (
      <tr
        key={`service-collapsed-${service.name}`}
        className={'service collapsed'}>
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
    const { name, image } = this.props.service;

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

        <div className={'environment'}>
          {this.environment()}
        </div>

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
