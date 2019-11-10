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

  chunkedRows(rows, chunkSize) {
    // https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-265.php
    return Array.from({ length: Math.ceil(rows.length / chunkSize) }, (v, i) =>
      rows.slice(i * chunkSize, i * chunkSize + chunkSize)
    );
  }

  renderIcon(state, message) {
    const mappedState = {
      ok: 'success',
      warn: 'warning',
      error: 'danger'
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
        return <Icon.AlertOctagon {...attributes} />;
    }
  }

  renderRow(rowData, index) {
    return (
      <div key={`row-data-${index}`} className={'detail-row'}>
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

  renderRowChunk(rows, index) {
    return (
      <div key={`rows-chunk-${index}`} className={'row-chunk'}>
        {rows}
      </div>
    );
  }

  renderRows(data) {
    const rows = data.map((rowData, index) => this.renderRow(rowData, index));
    const chunkedRows = this.chunkedRows(rows, 4);

    return (
      <div className={'detail-rows'}>
      <h3>{this.title()}</h3>
        {chunkedRows.map((rows, index) => this.renderRowChunk(rows, index))}
      </div>
    );
  }
}

export default OverviewDetail;
