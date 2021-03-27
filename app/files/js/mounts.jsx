import React from 'react';
import Mapping from './mapping';

class Mounts extends Mapping {
  data() {
    const { mounts } = this.props;
    return mounts;
  }

  label() {
    return 'Mounts';
  }

  mountType(mount) {
    return (
      <span className={`mount-type ${mount.type} syntax`}>
        [{mount.type}]
      </span>
    );
  }

  readOnlyStatus(mount) {
    const className = mount.readOnly ? 'read-only' : '';
    return (
      <span className={`syntax read-only-status ${className}`}>
        {mount.readOnly ? '[ro]' : null }
      </span>
    );
  }

  renderRow(key, mount) {
    const { name } = this.props;
    return (
      <div key={`${this.label().toLowerCase()}-${name}-${key}`}>
        <span className={'key'}>{mount.source}</span>
        <span className={'syntax'}>{':'}</span>
        <span className={'value'}>{mount.target}</span>
        {this.mountType(mount)}
        {this.readOnlyStatus(mount)}
      </div>
    );
  }
}

export default Mounts;
