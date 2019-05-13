import React from 'react';

import Node from './node';
import Stack from './stack';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this._nodes = [];
    this.state = {};
  }

  getNode(hostname) {
    return this._nodes.find(
      node => node.hostname === hostname
    )
  }

  nodes() {
    return this.state.manifest.nodes.map(
      node => this.findOrCreateNode(node)
    ).sort(
      (left, right) => {
        if (left.leader()) return -1;
        if (right.leader()) return 1;
        if (left.manager()) return -1;
        if (right.manager()) return 1;
        if (left.hostname < right.hostname) return -1;
        if (left.hostname > right.hostname) return 1;
        return 0;
      }
    );
  }

  findOrCreateNode(state) {
    var found = this._nodes.find(node => node.id === state.id);

    if (found) {
      return found;
    }

    var node = this.node(state);
    this._nodes.push(node);
    return node;
  }

  node(state) {
    var ref = React.createRef();
    return {
      id: state.id,
      hostname: state.hostname,
      ref: ref,
      component: (
        <Node
          key={state.id}
          ref={ref}
          node={state}
          stacks={this.state.manifest.stacks}
        />
      )
    }
  }

  toggle(id) {
    $(`#${id}`).toggle();
  }

  renderToggleButton(id) {
    return (
      <span className={'toggle'}>
        <input
          type={'checkbox'}
          onClick={() => this.toggle(id)}
          name={`toggle-${id}`}
          defaultChecked={true}>
        </input>
        <label
          htmlFor={`toggle-${id}`}>
          {id}
        </label>
      </span>
    );
  }

  renderManifestMissing() {
    return (
      <div className={'error'}>
        {'Waiting for data'}
      </div>
    );
  }

  render() {
    if (!this.state.manifest) return this.renderManifestMissing();

    return (
      <div id={'dashboard'}>
        <div id={'section-toggles'}>
          {this.renderToggleButton('nodes')}
          {this.renderToggleButton('stacks')}
        </div>

        <div id={'nodes'}>
          <h2 className={'section-header'}>Nodes</h2>
          {this.nodes().map(node => node.component)}
        </div>

        <div id={'stacks'}>
          <h2 className={'section-header'}>Stacks</h2>
          {this.state.manifest.stacks.map(stack => (
            <Stack
              key={'stack_' + stack.name}
              stack={stack}
              manifest={this.state.manifest}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default Dashboard;
