import React from 'react';
import * as Icon from 'react-feather';

import Node from './node';
import Stack from './stack';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this._nodes = [];
    this.state = {
      stacksExpanded: true
    };
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
        if (left.ref.current && left.ref.current.leader()) return -1;
        if (right.ref.current && right.ref.current.leader()) return 1;
        if (left.ref.current && left.ref.current.manager()) return -1;
        if (right.ref.current && right.ref.current.manager()) return 1;
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

  renderManifestMissing() {
    return (
      <div className={'error'}>
        {'Waiting for data'}
      </div>
    );
  }

  toggleStacks() {
    const visible = $("#stacks").is(':visible');

    if (visible) {
      $('.node').addClass('grid');
      $('#nodes').animate({ width: '90%' }, 1000, 'swing',
                          () => $('#stacks').fadeOut());
      this.setState({ stacksExpanded: false });
    } else {
      $('#stacks').show();
      $('#nodes').animate({ width: '20em' }, 1000, 'swing',
                          () => $('.node').removeClass('grid'));
      this.setState({ stacksExpanded: true });
    }
  }

  render() {
    if (!this.state.manifest) return this.renderManifestMissing();

    return (
      <div id={'dashboard'}>
        <div className={'section'} id={'nodes'}>
          <div className={'section-content'}>
            {this.nodes().map(node => node.component)}
          </div>
        </div>

        <button
          onClick={() => this.toggleStacks()}
          className={'toggle-section btn btn-secondary'}>
          {this.state.stacksExpanded ? <Icon.ChevronsRight/> : <Icon.ChevronsLeft/>}
        </button>

        <div id={'stacks'} className={'section'}>
          <div className={'section-content'}>
            <table>
              <tbody>
                {this.state.manifest.stacks.map(stack => (
                  <Stack
                    key={'stack_' + stack.name}
                    stack={stack}
                    manifest={this.state.manifest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard;
