import React from 'react';
import { connect } from 'react-redux';

import OverviewDetail from './overview_detail';
import Messages from '../messages';

class ConnectedNodesDetail extends OverviewDetail {
  title() {
    return 'Nodes';
  }

  nodeVersionMessage(uniqueVersions) {
    if (uniqueVersions === 1) {
      return Messages.overview.nodes.consistentVersions;
    } else {
      return Messages.overview.nodes.inconsistentVersions(uniqueVersions);
    }
  }

  render() {
    const {
      leaders,
      managers,
      workers,
      reachableNodes,
      uniqueVersions,
      commonVersion
    } = this.statistics().nodes;

    const data = [
      {
        title: 'Leaders',
        value: leaders,
        state: leaders === 1 ? 'ok' : 'warn'
      },
      {
        title: 'Managers',
        value: managers,
        state: managers % 2 === 1 ? 'ok' : 'warn',
        message: managers % 2 === 1 ? null : Messages.overview.nodes.noQuorum
      },
      {
        title: 'Workers',
        value: workers,
        state: reachableNodes === managers + workers ? 'ok' : 'warn'
      },
      {
        title: 'Docker Version',
        value: uniqueVersions === 1 ? commonVersion : '-',
        state: uniqueVersions === 1 ? 'ok' : 'warn',
        message: this.nodeVersionMessage(uniqueVersions)
      }
    ];
    return this.renderRows(data);
  }
}

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes };
};

const NodesDetail = connect(select)(ConnectedNodesDetail);
export default NodesDetail;
