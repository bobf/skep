class Stack extends React.Component {
  render() {
    return (
      <div className={'stack'}>
        <h2>{this.props.stack.name}</h2>
        <div className={'services'}>
          {this.props.stack.services.map(service => (
            <Service
              key={service.name}
              service={service}
              manifest={this.props.manifest}
            />
          ))}
        </div>
      </div>
    );
  }
}
