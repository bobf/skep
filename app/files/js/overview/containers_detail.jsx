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
        if (task.message !== task.state) {
          states[task.message] = states[task.message] || [];
          states[task.message].push(task);
        }
      }
    );

    return states;
  }

  rowData(state, tasks) {
    return {
      title: state,
      value: tasks.length,
      state: this.containerState(state),
    };
  }

  containerState(state) {
    if (['running', 'started'].includes(state)) return 'ok';
    if (['rejected'].includes(state)) return 'error';

    return null;
  }

  render() {
    const containers = this.containers();
    const tasksByState = this.tasksByState();
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
    const stateData = Object.entries(tasksByState).map(keypair => this.rowData(...keypair));

    return this.renderRows(data.concat(stateData));
  }
}

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes };
};

const ContainersDetail = connect(select)(ConnectedContainersDetail);
export default ContainersDetail;
