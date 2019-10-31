import { connect } from 'react-redux';

import OverviewDetail from './overview_detail';
import Messages from '../messages';

class ConnectedSwarmDetail extends OverviewDetail {
  title() {
    return 'Swarm';
  }

  render() {
    const { name, created, updated } = this.statistics().swarm;
    const data = [
      {
        title: 'Swarm Name',
        value: name
      },
      {
        title: 'Created',
        value: moment(created).fromNow()
      },
      {
        title: 'Last Updated',
        value: moment(updated).fromNow(),
        state: 'ok'
      }
    ];

    return this.renderRows(data);
  }

}

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes };
};

const SwarmDetail = connect(select)(ConnectedSwarmDetail);
export default SwarmDetail;
