import React from 'react';
import { connect } from 'react-redux';
import * as Icon from 'react-feather';

import ContainersDetail from './overview/containers_detail';
import NetworksDetail from './overview/networks_detail';
import NodesDetail from './overview/nodes_detail';
import ServicesDetail from './overview/services_detail';
import SkepDetail from './overview/skep_detail';
import SwarmDetail from './overview/swarm_detail';
import Messages from './messages';

class ConnectedOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedSection: null,
      selectedSection: null,
      hidden: true
    };
  }

  statistics() {
    const { statistics } = this.props.swarm;

    return statistics;
  }

  services() {
    const { stacks } = this.props.swarm.manifest;
    const services = stacks.map(stack => stack.services).flat();

    return services;
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

  select(section) {
    const { selectedSection } = this.state;

    if (section === selectedSection) {
      this.setState({ selectedSection: null });
    } else {
      this.setState({ selectedSection: section });
    }
  }

  isSectionSelected(section) {
    const { selectedSection, focusedSection } = this.state;

    if (selectedSection) return selectedSection === section;
    if (focusedSection === section) return true;

    return false;
  }

  renderDetail() {
    const { focusedSection, selectedSection } = this.state;
    const section = selectedSection ? selectedSection : focusedSection;
    const renderer = {
      swarm: () => React.createElement(SwarmDetail),
      skep: () => React.createElement(SkepDetail),
      services: () => React.createElement(ServicesDetail),
      nodes: () => React.createElement(NodesDetail),
      networks: () => React.createElement(NetworksDetail),
      containers: () => React.createElement(ContainersDetail),
    }[section || 'swarm'];

    return renderer();
  }

  renderHeader(section, label, count) {
    const { selectedSection } = this.state;
    const hover = this.isSectionSelected(section);
    const classes = ['section-header', section];
    if (hover) classes.push('hover');
    if (selectedSection === section) classes.push('selected');

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
    const { selectedSection } = this.state;
    const hover = this.isSectionSelected(section);
    const classes = ['section-content', section]

    if (hover) classes.push('hover');
    if (section === 'skep' && hover) classes.push('bounce-logo');
    if (selectedSection === section) classes.push('selected');

    return (
      <div
        onMouseEnter={() => this.focus(section)}
        onClick={() => this.select(section)}
        key={`overview-section-${section}`}
        className={classes.join(' ')}>
        <span className={'count'}>
          {count}
        </span>
      </div>
    );
  }

  render() {
    const { statistics } = this.props.swarm;
    if (!statistics) return null;

    const { closeCallback, visible } = this.props;
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
    if (this.isSectionSelected('skep')) classes.push('bounce-logo');


    const onMouseLeave = function (ev) {
      const dataToggle = ev.target.attributes['data-toggle'];
      if (dataToggle && dataToggle.value === 'tooltip') return false;
      this.focus('swarm');
      return this.close(ev, closeCallback);
    }

    return (
      <div
        onMouseLeave={(ev) => onMouseLeave.call(this, ev)}
        className={`overview ${classes.join(' ')}`}>
        <div
          onClick={() => this.select('skep')}
          onMouseEnter={() => this.focus('skep')}
          className={`spacer`}>
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
        <div onMouseEnter={() => this.focus()} className={'detail'}>
          {this.renderDetail()}
        </div>
      </div>
    );
  }
}

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes };
};
const Overview = connect(select)(ConnectedOverview);
export default Overview;
