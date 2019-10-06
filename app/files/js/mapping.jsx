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

  toggle(ev) {
    if (this.isEmpty()) return false;
    if (ev.target.closest('.modal-content')) return false;

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

  formattedLabel() {
    const { compact } = this.props;

    if (compact) return this.label().substr(0, 1);

    return this.label();
  }

  icon(empty, collapsed) {
    const { compact } = this.props;

    if (compact) return null;

    if (empty) {
      return (
        <Icon.Slash className={'icon'} size={'1.2em'} />
      );
    }

    if (collapsed) {
      return (
        <Icon.Eye className={'icon'} size={'1.2em'} />
      );
    }

    return (
      <Icon.Eye className={'icon'} size={'1.2em'} />
    );
  }

  tooltip() {
    if (this.isEmpty()) {
      return `<b>${this.label()}</b><br/>(empty)`
    } else {
      return `<b>${this.label()}</b><br/>${this.valueCount()} value(s)`;
    }
  }

  renderExpandButton(collapsed) {
    const empty = this.isEmpty();
    const tooltip = this.tooltip();
    const className = empty ? 'btn-secondary disabled' : 'btn-primary';

    return (
      <button
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        data-html={'true'}
        id={this.buttonID()}
        className={`btn expand mapping ${className} ${this.label().toLowerCase()}`}
        onClick={(ev) => this.toggle(ev)}>
        {this.formattedLabel()}
        {this.icon(empty, collapsed)}
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
        <div className={'viewport'}>
          <h3>{this.label()}</h3>
          <h2>{name}</h2>
          {rows}
        </div>
      </div>
    )
  }

  render() {
    const { collapsed } = this.state;
    const { compact } = this.props;
    return (
      <div className={'mapping-wrapper ' + (compact ? 'compact' : '')}>
        {this.renderExpandButton(collapsed)}
        <div
          onClick={(ev) => this.toggle(ev)}
          className={this.className()}>
          {collapsed ? this.renderCollapsed() : this.renderExpanded()}
        </div>
      </div>
    );
  }
}

export default Mapping;
