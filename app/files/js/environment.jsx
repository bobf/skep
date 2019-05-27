import * as Icon from 'react-feather';

class Environment extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: true };
  }

  expand() {
    this.setState({ collapsed: false });
    return false;
  }

  collapse() {
    this.setState({ collapsed: true });
    return false;
  }

  toggle() {
    const { collapsed } = this.state;
    collapsed ? this.expand() : this.collapse();
    // REVIEW: This feels hacky but, without it, the tooltip does not disappear
    // until the user manually takes focus away from the button.
    $('.environment .btn').blur();
    return false;
  }

  isEnvironmentEmpty() {
    return this.valueCount() === 0;
  }

  valueCount() {
    const { environment } = this.props;
    return Object.keys(environment).length;
  }


  renderExpandButton(collapsed) {
    const empty = this.isEnvironmentEmpty();
    const className = empty ? 'btn-secondary disabled' : 'btn-primary';
    const tooltip = empty ? 'Environment empty' : `${this.valueCount()} value(s)`;
    return (
      <button
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        className={`btn expand ${className}`}
        onClick={() => this.toggle()}>
        Environment
        { empty ? (
            <Icon.Slash className={'icon'} size={'1em'} />
          ) : (
            collapsed ? (
              <Icon.ChevronDown className={'icon'} size={'1em'} />
            ) : (
              <Icon.ChevronUp className={'icon'} size={'1em'} />
            )
          )}
      </button>
    );
  }

  renderCollapsed() {
    return null;
  }

  renderExpanded() {
    const { environment, name } = this.props;
    const rows = Object.keys(environment).sort().map(
      key => (
        <div key={`env-${name}-${key}`}>
          <span className={'key'}>{key}</span>
          <span className={'syntax'}>{'='}</span>
          <span className={'value'}>{environment[key]}</span>
        </div>
      )
    );

    return (
      <div className={'keypairs'}>
        {rows}
      </div>
    )
  }

  render() {
    const { collapsed } = this.state;
    return (
      <div className={'environment'}>
        {this.renderExpandButton(collapsed)}
        {collapsed ? this.renderCollapsed() : this.renderExpanded()}
      </div>
    );
  }
}

export default Environment;
