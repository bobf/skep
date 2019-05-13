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
      <span className={`badge bg-${this.level()}`}>
        {state}
      </span>
    );
  }

  renderMessage () {
    const { message } = this.props.task;
    return (
      <span className={'badge bg-primary'}>
        {message}
      </span>
    );
  }


  render() {
    const { highlight } = this.state;

    return (
      <span
        className={'task ' + (highlight ? 'highlight' : null)}
        onMouseEnter={() => this.highlightNode(true)}
        onMouseLeave={() => this.highlightNode(false)}>
        {<Icon.Server />}
        <h3>
          {this.node().hostname}
        </h3>
        {this.renderState()}
        {this.renderMessage()}
      </span>
    );
  }
}

export default Task;
