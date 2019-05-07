class Dashboard extends React.Component {
  getNode(hostname) {
    return this.props.manifest.nodes.find(node => node.hostname == hostname);
  }

  render() {
    return (
      <div id={'dashboard'}>
        <div id={'nodes'}>
          <h2>Nodes</h2>
          {this.props.manifest.nodes.map(node => (
            <Node key={node.id} manifest={node} />
          ))}
        </div>

        <div id={'stacks'}>
          <h2>Stacks</h2>
          {this.props.manifest.stacks.map(stack => (
            <Stack
              key={stack.name}
              stack={stack}
              manifest={this.props.manifest}
            />
          ))}
        </div>
      </div>
    )
  }
}
