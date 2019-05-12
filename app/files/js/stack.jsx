import Service from './service';

class Stack extends React.Component {
  services() {
    return this.props.stack.services.sort(
      (left, right) => {
        console.log(left, right);
        if (left.ports.length && !right.ports.length) return -1;
        if (!left.ports.length && right.ports.length) return 1;
        if (left.name < right.name) return -1;
        if (left.name > right.name) return 1;
        return 0;
      }
    );
  }

  render() {
    return (
      <div className={'stack'}>
        <h2 className='stack'>{this.props.stack.name}</h2>
        <div className={'services'}>
          {this.services().map(service => (
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
