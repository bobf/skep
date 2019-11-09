import * as Icon from 'react-feather';

import Modal from './modal';

class Mapping extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  className() {
    const { visible } = this.state;
    return `mapping ${this.label().toLowerCase()}`;
  }

  buttonID() {
    const { serviceName } = this.props;
    return `mapping-${serviceName}`;
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

  icon(empty, visible) {
    const { compact } = this.props;

    if (compact) return null;

    if (empty) {
      return (
        <Icon.Slash className={'icon'} size={'1.2em'} />
      );
    }

    if (visible) {
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

  toggleMapping(ev, visible) {
    if (this.isEmpty()) {
      ev.stopPropagation();

      return false;
    }

    this.setState({ visible: visible });

    if (!visible) {
      // REVIEW: This feels hacky but, without it, the tooltip does not
      // disappear until the user manually takes focus away from the button.
      $('.environment .btn').blur();
    }

    return false;
  }

  renderExpandButton(visible) {
    const empty = this.isEmpty();
    const tooltip = this.tooltip();
    const className = empty ? 'btn-secondary disabled' : 'btn-primary';

    return (
      <button
        data-original-title={tooltip}
        data-toggle={'tooltip'}
        data-html={'true'}
        id={this.buttonID()}
        className={`btn expand mapping ${className} ${this.label().toLowerCase()}`}
        onClick={(ev) => this.toggleMapping(ev, true)}>
        {this.formattedLabel()}
        {this.icon(empty, visible)}
      </button>
    );
  }

  renderHidden() {
    return null;
  }

  renderVisible() {
    const { serviceName } = this.props;
    const data = this.data();
    const rows = Object.keys(data).sort().map(
      key => this.renderRow(key, data[key])
    );

    return (
      <Modal
        content={rows}
        contentClass={'mapping keypairs'}
        wrapperClass={'mapping'}
        title={this.label()}
        subtitle={serviceName}
        closeCallback={() => this.toggleMapping(false)}
      />
    );
  }

  render() {
    const { visible } = this.state;
    const { compact } = this.props;
    return (
      <div className={'mapping-wrapper ' + (compact ? 'compact' : '')}>
        {this.renderExpandButton(visible)}
        <div className={this.className()}>
          {visible ? this.renderVisible() : this.renderHidden()}
        </div>
      </div>
    );
  }
}

export default Mapping;
