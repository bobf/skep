import NodeStats from './node_stats';

class Node extends React.Component {
  tasks() {
    return this.services().map(
      service => service.tasks.filter(
        task => task.node_id === this.props.node.id
      )
    ).flat(1)
  }

  services() {
    return this.stacks().map(
      stack => stack.services.filter(
        service => service.tasks.find(
          task => task.node_id === this.props.node.id
        )
      )
    ).flat(1)
  }

  stacks() {
    return this.props.stacks.filter(
      stack => stack.services.filter(
        service => service.tasks.find(
          task => task.node_id === this.props.node.id
        )
      )
    )
  }

  stats() {
    if (!this.state || !this.state.stats) {
      return null;
    }

    return this.state.stats;
  }

  roleClass() {
    if (this.props.node.role === 'manager') {
      return 'primary';
    } else {
      return 'info';
    }
  }

  roleBadge() {
    if (this.props.node.role === 'manager') {
      return (
        <span className={'badge badge-primary'}>
          Manager
        </span>
      );
    } else {
      return (
        <span className={'badge badge-info'}>
          Worker
        </span>
      );
    }
  }

  leaderBadge() {
    if (!this.props.node.leader) {
      return null;
    }

    return (
      <span className={'badge badge-success'}>Leader</span>
    );
  }

  render() {
    return (
      <div id={`node-${this.props.node.id}`} className={'node'}>
        <h2 alt={'Version: ' + this.props.node.version} className={'hostname'}>
          {this.props.node.hostname}
        </h2>

        {this.roleBadge()}
        {this.leaderBadge()}

        <NodeStats
          key={'node_' + this.props.node.id + '_stats'}
          stats={this.stats()}
        />
      </div>
    );
  }
}

export default Node;
