class Node extends React.Component {
  render() {
    return (
      <div className={'node'}>
        <h2>{this.props.manifest.hostname}</h2>
        <h3>{this.props.manifest.role}</h3>
        <h3>{this.props.manifest.version}</h3>
      </div>
    );
  }
}
