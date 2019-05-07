class Task extends React.Component {
  node() {
    return this.props.manifest.nodes.find(
      node => node.id == this.props.task.node_id
    ).hostname;
  }

  render() {
    return (
      <div className={'task'}>
        <h3>{this.node()}</h3>
      </div>
    );
  }
}

