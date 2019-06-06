import * as Icon from 'react-feather';

class Mapping extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: true };
  }

  className() {
    const { collapsed } = this.state;
    const modalClass = collapsed ? '' : 'modal';
    return `mapping ${this.label().toLowerCase()} ${modalClass} modal-wrapper`;
  }

  expand() {
    const $button = $(`#${this.buttonID()}`);
    const modalTop = $button.offset().top + $button.height() + 10;
    this.setState({ collapsed: false, modalTop: modalTop });
    return false;
  }

  collapse() {
    this.setState({ collapsed: true });
    return false;
  }

  toggle() {
    if (this.isEmpty()) return false;

    const { collapsed } = this.state;
    collapsed ? this.expand() : this.collapse();
    // REVIEW: This feels hacky but, without it, the tooltip does not disappear
    // until the user manually takes focus away from the button.
    $('.environment .btn').blur();
    return false;
  }

  buttonID() {
    const { name } = this.props;
    return `mapping-${name}`;
  }

  isEmpty() {
    return this.valueCount() === 0;
  }

  valueCount() {
    return Object.keys(this.data()).length;
  }

  renderExpandButton(collapsed) {
    const empty = this.isEmpty();
    const className = empty ? 'btn-secondary disabled' : 'btn-primary';
    const tooltip = empty ? `${this.label()} empty` : `${this.valueCount()} value(s)`;
    return (
      <button
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        id={this.buttonID()}
        className={`btn expand mapping ${className} ${this.label().toLowerCase()}`}
        onClick={() => this.toggle()}>
        {this.label()}
        { empty ? (
            <Icon.Slash className={'icon'} size={'1.2em'} />
          ) : (
            collapsed ? (
              <Icon.Eye className={'icon'} size={'1.2em'} />
            ) : (
              <Icon.Eye className={'icon'} size={'1.2em'} />
            )
          )}
      </button>
    );
  }

  renderCollapsed() {
    return null;
  }

  renderExpanded() {
    const { name } = this.props;
    const data = this.data();
    const { collapsed } = this.state;
    const modalClass = collapsed ? '' : 'modal';
    const rows = Object.keys(data).sort().map(
      key => this.renderRow(key, data[key])
    );

    return (
      <div
        className={`modal-content keypairs ${modalClass}`}>
        <h3>{this.label()}</h3>
        <h2>{name}</h2>
        {rows}
      </div>
    )
  }

  render() {
    const { collapsed } = this.state;
    return (
      <div className={'mapping-wrapper'}>
        {this.renderExpandButton(collapsed)}
        <div
          onClick={() => this.toggle()}
          className={this.className()}>
          {collapsed ? this.renderCollapsed() : this.renderExpanded()}
        </div>
      </div>
    );
  }
}

export default Mapping;
