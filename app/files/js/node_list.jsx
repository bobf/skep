import React from 'react';
import { connect } from 'react-redux';

import Node from './node';

class ConnectedNodeList extends React.Component {
  sortedNodes() {
    const { nodes } = this.props;
    const { nodes: swarmNodes } = this.props.swarm.manifest;
    Object.values(swarmNodes).forEach(
      swarmNode => {
        const node = Object.values(nodes).find(
          node => node.hostname === swarmNode.hostname
        );
        if (node) {
          // Avoid data-mangling later by providing convenient access points:
          swarmNode.source = node;
        }
      }
    );

    return Object.values(swarmNodes).sort(
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
