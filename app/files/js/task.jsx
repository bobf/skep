import * as Icon from 'react-feather';

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  node() {
    return this.props.manifest.nodes.find(
      node => node.id == this.props.task.node_id
    );
  }

  highlightNode(state) {
    const node = this.node();

    if (!node) return false;

    this.setState({ highlight: state });
    $(`#node-${node.id}`).toggleClass('highlight', state);
  }

  level() {
    const { state } = this.props.task;

    switch (state) {
      case 'running':
        return 'success';
      default:
        return 'secondary';
    }
  }

  renderState() {
    const { state } = this.props.task;

    return (
      <div className={`badge bg-${this.level()}`}>
        {state}
      </div>
    );
  }

  renderMessage () {
    const { message, when } = this.props.task;
    return (
      <div
        data-toggle={'tooltip'}
        title={moment(when).fromNow()}
        className={'badge bg-primary'}>
        {message}
      </div>
    );
  }


  render() {
    const { highlight } = this.state;

    return (
      <span
        className={'task ' + (highlight ? 'highlight' : '')}
        onMouseEnter={() => this.highlightNode(true)}
        onMouseLeave={() => this.highlightNode(false)}>
        <span className="border">
          {<Icon.Server size={'2.4em'} />}
          <h3 title={this.node().hostname}>
          </h3>
          <div className={'badges'}>
            {this.renderState()}
            {this.renderMessage()}
          </div>
        </span>
      </span>
    );
  }
}

export default Task;
