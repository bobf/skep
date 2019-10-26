import React from 'react';
import { connect } from 'react-redux';

import Node from './node';

class ConnectedNodeList extends React.Component {
  sortedNodes() {
    const { nodes } = this.props;
    const { nodes: swarmNodes } = this.props.swarm.manifest;
    Object.values(nodes).forEach(
      node => node.manifest = swarmNodes.find(
        swarmNode => swarmNode.hostname === node.hostname
      )
    );

    return Object.values(nodes).sort(
      (left, right) => {
        if (left.manifest.leader) return -1;
        if (right.manifest.leader) return 1;
        const leftManager = left.manifest.role === 'manager';
        const rightManager = right.manifest.role === 'manager';
        if (leftManager  && !rightManager) return -1;
        if (rightManager && !leftManager) return 1;
        if (left.hostname < right.hostname) return -1;
        if (left.hostname > right.hostname) return 1;
        return 0;
      }
    );
  }

  render() {
    const { nodes } = this.props;

    return this.sortedNodes().map(node => (
      <Node
        key={node.hostname}
        node={node}
        minimized={true}
      />
    ));
  }
}

const select = (state) => {
  return { nodes: state.nodes, swarm: state.swarm };
};

const NodeList = connect(select)(ConnectedNodeList);
export default NodeList;
