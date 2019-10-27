import { connect } from 'react-redux';
import React from 'react';
import * as Icon from 'react-feather';

class OverviewDetail extends React.Component {
  services() {
    const { stacks } = this.props.swarm.manifest;
    const services = stacks.map(stack => stack.services).flat();

    return services;
  }

  statistics() {
    const { statistics } = this.props.swarm;

    return statistics;
  }

  renderIcon(state, message) {
    const mappedState = {
      ok: 'success',
      warn: 'warning',
      error: 'error'
    }[state];

    const attributes = {
      'data-toggle': 'tooltip',
      'data-html': 'true',
      'title': message,
      'data-original-title': message,
      'className': `icon text-${mappedState}`
    }

    switch (state) {
      case 'ok':
        return <Icon.CheckCircle {...attributes} />;
      case 'warn':
        return <Icon.AlertTriangle {...attributes} />;
      case 'error':
        return <Icon.CheckCircle {...attributes} />;
    }
  }

  renderRow(rowData) {
    return (
      <div key={rowData.title} className={'detail-row'}>
        <div className={'detail-title'}>
          {rowData.title}
          <span className={'detail-punctuation'}>
            {':'}
          </span>
        </div>
        <div className={'detail-value'}>
          {rowData.value}
        </div>
        <div className={'detail-icon'}>
          {this.renderIcon(rowData.state, rowData.message)}
        </div>
      </div>
    );
  }

  renderRows(data) {
    const rows = data.map(rowData => this.renderRow(rowData));

    return (
      <div className={'detail-rows'}>
      <h3>{this.title()}</h3>
        {rows}
      </div>
    );
  }
}

export default OverviewDetail;
