import ChartBase from './chart_base';
import { requestContainerChart } from './redux/models/charts';

class TaskChart extends ChartBase {
  requestChart(period) {
    const { containerID } = this.props;
    return requestContainerChart(containerID, period);
  }

  title() {
    return 'Container Activity';
  }

  subtitle() {
    const { data, hostname } = this.props;
    if (!data) return null;

    const { id: containerID } = data.meta;

    return (
      <div>
        <span className={'container-id'}>
          {containerID.substring(0, 8)}
        </span>
        <span className={'punctuation'}>
          {'@'}
        </span>
        <span className={'hostname'}>
          {hostname}
        </span>
      </div>
    );
  }

  chartOptions() {
    return {
      series: {
        0: { targetAxisIndex: 0 },
        1: { targetAxisIndex: 0 },
        2: { targetAxisIndex: 1 },
        3: { targetAxisIndex: 1 }
      },
      vAxes: {
        0: {
          // 10kb/s minimum to compress low-activity data
          minValue: 10000,
          format: 'short',
          textStyle: { color: '#999' },
          titleTextStyle: { color: '#aaa' },
          title: 'Network / Disk bps',
          gridlines: {
            color: '#333'
          }
        },
        1: {
          minValue: 1,
          format: 'percent',
          titleTextStyle: { color: '#aaa' },
          title: 'CPU / RAM %',
          textStyle: { color: '#999' },
          gridlines: {
            color: '#333'
          }
        }
      }
    }
  }
}

export default TaskChart;
