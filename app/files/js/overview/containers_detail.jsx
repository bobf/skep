import { connect } from 'react-redux';

import OverviewDetail from './overview_detail';
import Messages from '../messages';


class ConnectedContainersDetail extends OverviewDetail {
  title() {
    return 'Containers';
  }

  tasks() {
    const services = this.services();
    const tasks = services.map(service => service.tasks).flat();

    return tasks;
  }

  containers() {
    const { nodes } = this.props;

    return Object.values(nodes).map(node => node.containers).flat();
  }

  tasksByState() {
    const tasks = this.tasks();
    const states = {};
    tasks.forEach(
      task => {
        states[task.state] = states[task.state] || [];
        states[task.state].push(task);
      }
    );

    return states;
  }

  render() {
    const containers = this.containers();
    const tasks = this.tasksByState();
    const { containers: swarmCount } = this.props.swarm.statistics.overview;
    const count = containers.length;
    const valid = swarmCount === count;
    const { containers: messages } = Messages.overview;
    const data = [
      {
        title: 'Total',
        value: count,
        state: valid ? 'ok' : 'warn',
        message: valid ? messages.valid(count) : messages.invalid(count, swarmCount)
      }
    ];
    const row = (state, tasks) => {
      return {
        title: state,
        value: tasks.length,
        state: state === 'running' ? 'ok' : null,
      };
    };

    Object.entries(tasks).forEach(keypair => data.push(row(...keypair)));

    return this.renderRows(data);
  }
}

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes };
};

const ContainersDetail = connect(select)(ConnectedContainersDetail);
export default ContainersDetail;
