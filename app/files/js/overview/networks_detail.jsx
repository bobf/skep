import { connect } from 'react-redux';

import OverviewDetail from './overview_detail';
import Messages from '../messages';

class ConnectedNetworksDetail extends OverviewDetail {
  title() {
    return 'Networks';
  }

  activeNetworkIDs() {
    const services = this.services();
    const activeNetworkIDs = services.map(
      service => service.networks.map(network => network.id)
    ).flat();

    return [...new Set(activeNetworkIDs)];
  }

  networks() {
    const { networks } = this.props.swarm.manifest;

    return networks;
  }

  render() {
    const messages = Messages.overview.networks;
    const networks = this.networks();
    const activeNetworkIDs = this.activeNetworkIDs();
    const inactiveCount = networks.map(network => network.id).filter(
      networkID => !activeNetworkIDs.includes(networkID)
    ).length;

    const data = [
      {
        title: 'Total',
        value: networks.length,
      },
      {
        title: 'Attached',
        value: activeNetworkIDs.length,
      },
      {
        title: 'Unattached',
        value: inactiveCount,
        state: inactiveCount ? 'warn' : 'ok',
        message: inactiveCount ? messages.unattached(inactiveCount) : null,
      },
    ];

    return this.renderRows(data);
  }
}

const select = (state) => {
  return { swarm: state.swarm };
};

const NetworksDetail = connect(select)(ConnectedNetworksDetail);
export default NetworksDetail;
