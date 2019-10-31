import React from 'react';
import { connect } from 'react-redux';

import Node from './node';

class ConnectedNodeList extends React.Component {
  sortedNodes() {
    const { nodes } = this.props;
    const { nodes: swarmNodes } = this.props.swarm.manifest;

    return swarmNodes.sort(
      (left, right) => {
        if (left.leader) return -1;
        if (right.leader) return 1;
        const leftManager = left.role === 'manager';
        const rightManager = right.role === 'manager';
        if (leftManager  && !rightManager) return -1;
        if (rightManager && !leftManager) return 1;
        if (left.hostname < right.hostname) return -1;
        if (left.hostname > right.hostname) return 1;
        return 0;
      }
    );
  }

  render() {
    const { minimized } = this.props;

    return this.sortedNodes().map(node => (
      <Node
        key={node.hostname}
        node={node}
        minimized={minimized}
      />
    ));
  }
}

const select = (state) => {
  return { nodes: state.nodes, swarm: state.swarm };
};

const NodeList = connect(select)(ConnectedNodeList);
export default NodeList;
