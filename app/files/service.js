class Service extends React.Component {
  render() {
    return (
      <div className={'service'}>
        <h2>{this.props.service.name}</h2>
        <div className={'services'}>
          {this.props.service.tasks.map(task => (
            <Task key={task.id} task={task} manifest={this.props.manifest} />
          ))}
        </div>
      </div>
    );
  }
}
