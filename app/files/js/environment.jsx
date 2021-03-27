import React from 'react';
import Mapping from './mapping';

class Environment extends Mapping {
  data() {
    const { environment } = this.props;
    return environment;
  }

  label() {
    return 'Environment';
  }

  renderRow(key, value) {
    const { name } = this.props;
    return (
      <div key={`${this.label().toLowerCase()}-${name}-${key}`}>
        <span className={'key'}>{key}</span>
        <span className={'syntax'}>{'='}</span>
        <span className={'value'}>{value}</span>
      </div>
    );
  }
}

export default Environment;
