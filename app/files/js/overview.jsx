import * as Icon from 'react-feather';

import Messages from './messages';

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { focusedSection: 'nodes' };
  }

  close(ev, callback) {
    const { visible } = this.props;
    if (!visible) return false;

    this.setState({ hidden: false });
    this.timeout && clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.setState({ hidden: true }), 500);

    return callback(ev);
  }

  focus(section) {
    this.setState({ focusedSection: section });
  }

  nodeVersionMessage(uniqueVersions) {
    if (uniqueVersions === 1) {
      return Messages.overview.nodes.consistentVersions;
    } else {
      return Messages.overview.nodes.inconsistentVersions(uniqueVersions);
    }
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
        {rows}
      </div>
    );
  }

  renderSkepDetail() {
    const { version } = this.props.statistics.skep;
    const data = [
      {
        title: 'Skep Version',
        value: version
      }
    ];
    return this.renderRows(data);
  }

  renderSwarmDetail() {
    const { name, created, updated } = this.props.statistics.swarm;
    const data = [
      {
        title: 'Swarm Name',
        value: name
      },
      {
        title: 'Created',
        value: moment(created).fromNow()
      },
      {
        title: 'Last Updated',
        value: moment(updated).fromNow(),
        state: 'ok'
      }
    ];
    return this.renderRows(data);
  }

  renderNodesDetail() {
    const {
      leaders,
      managers,
      workers,
      reachableNodes,
      uniqueVersions,
      commonVersion
    } = this.props.statistics.nodes;

    const data = [
      {
        title: 'Leaders',
        value: leaders,
        state: leaders === 1 ? 'ok' : 'warn'
      },
      {
        title: 'Managers',
        value: managers,
        state: managers % 2 === 1 ? 'ok' : 'warn',
        message: managers % 2 === 1 ? null : Messages.overview.nodes.noQuorum
      },
      {
        title: 'Workers',
        value: workers,
        state: reachableNodes === managers + workers ? 'ok' : 'warn'
      },
      {
        title: 'Docker Version',
        value: uniqueVersions === 1 ? commonVersion : '-',
        state: uniqueVersions === 1 ? 'ok' : 'warn',
        message: this.nodeVersionMessage(uniqueVersions)
      }
    ];
    return this.renderRows(data);
  }

  renderServicesDetail() {
    const { global, replicated } = this.props.statistics.services;

    const data = [
      {
        title: 'Global',
        value: global
      },
      {
        title: 'Replicated',
        value: replicated
      }
    ];
    return this.renderRows(data);
  }

  renderContainersDetail() {
    return 'containers';
  }

  renderNetworksDetail() {
    return 'networks';
  }

  renderDetail() {
    const { focusedSection } = this.state;
    const renderer = {
      skep: this.renderSkepDetail,
      swarm: this.renderSwarmDetail,
      nodes: this.renderNodesDetail,
      services: this.renderServicesDetail,
      containers: this.renderContainersDetail,
      networks: this.renderNetworksDetail
    }[focusedSection];

    return renderer.apply(this);
  }

  renderHeader(section, label, count) {
    const { focusedSection } = this.state;
    const hover = (focusedSection === section);
    const classes = [
      'section-header',
      section,
      hover ? 'hover' : ''
    ];

    return (
      <div
        onMouseEnter={() => this.focus(section)}
        key={`overview-header-${section}`}
        className={classes.join(' ')}>
        <span className={'header'}>
          {label}
        </span>
      </div>
    );
  }

  renderSection(section, label, count) {
    const { focusedSection } = this.state;
    const hover = (focusedSection === section);
    const classes = ['section-content', section, hover ? 'hover' : ''];
    return (
      <div
        onMouseEnter={() => this.focus(section)}
        key={`overview-section-${section}`}
        className={classes.join(' ')}>
        <span className={'count'}>
          {count}
        </span>
      </div>
    );
  }

  render() {
    const { statistics, closeCallback, visible } = this.props;
    const { hidden } = this.state;

    if (visible && this.timeout) {
      clearTimeout(this.timeout);
    }

    const sections = [
      ['nodes', 'Nodes', statistics.overview.nodes],
      ['services', 'Services', statistics.overview.services],
      ['containers', 'Containers', statistics.overview.containers],
      ['networks', 'Networks', statistics.overview.networks],
    ]

    const classes = [];
    if (visible) classes.push('visible');
    if (hidden) classes.push('hidden');

    const onMouseLeave = function (ev) {
      this.focus('swarm');

      return this.close(ev, closeCallback);
    }

    return (
      <div
        onMouseLeave={(ev) => onMouseLeave.call(this, ev)}
        className={`overview ${classes.join(' ')}`}>
        <div
          onMouseEnter={() => this.focus('skep')}
          className={'spacer'}>
        </div>
        <div className={'headers'}>
          <span>
            {sections.map(section => this.renderHeader(...section))}
          </span>
        </div>
        <div className={'counts'}>
          <span>
            {sections.map(section => this.renderSection(...section))}
          </span>
        </div>
        <div onMouseEnter={() => this.focus('swarm')} className={'detail'}>
          {this.renderDetail()}
        </div>
      </div>
    );
  }
}

export default Overview;
