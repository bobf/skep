import Service from './service';

class Stack extends React.Component {
  render() {
    return (
      <div className={'stack'}>
        <h2 className='stack'>{this.props.stack.name}</h2>
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

export default Stack;
