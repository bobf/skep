import { connect } from 'react-redux';

import OverviewDetail from './overview_detail';
import Messages from '../messages';

class ConnectedSkepDetail extends OverviewDetail {
  title() {
    return 'Skep';
  }

  render() {
    const { version } = this.statistics().skep;
    const data = [
      {
        title: 'Version',
        value: version
      },
      {
        title: 'Homepage',
        value: (
          <a target={'_blank'} href={Messages.skep.homepage}>
            {Messages.skep.homepage}
          </a>
        )
      },
    ];
    return this.renderRows(data);
  }
}

const select = (state) => {
  return { swarm: state.swarm, nodes: state.nodes };
};

const SkepDetail = connect(select)(ConnectedSkepDetail);
export default SkepDetail;
