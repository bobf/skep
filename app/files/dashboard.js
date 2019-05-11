class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this._nodes = [];
  }

  getNode(hostname) {
    return this._nodes.find(
      node => node.hostname === hostname
    )
  }

  nodes() {
    return this.props.manifest.nodes.map(
      node => this.findOrCreateNode(node)
    );
  }

  findOrCreateNode(props) {
    var found = this._nodes.find(node => node.id === props.id);

    if (found) {
      return found;
    }

    var node = this.node(props);
    this._nodes.push(node);
    return node;
  }

  node(props) {
    var ref = React.createRef();
    return {
      id: props.id,
      hostname: props.hostname,
      ref: ref,
      component: (
        <Node key={props.id} ref={ref} node={props} stacks={this.props.manifest.stacks} />
      )
    }
  }

  render() {
    return (
      <div id={'dashboard'}>
        <div id={'nodes'}>
          <h2>Nodes</h2>
          {this.nodes().map(node => node.component)}
        </div>

        <div id={'stacks'}>
          <h2>Stacks</h2>
          {this.props.manifest.stacks.map(stack => (
            <Stack
              key={'stack_' + stack.name}
              stack={stack}
              manifest={this.props.manifest}
            />
          ))}
        </div>
      </div>
    )
  }
}
