import React from 'react';
import ChartBase from './chart_base';
import { requestNodeChart } from './redux/models/charts';

class NodeChart extends ChartBase {
  requestChart(period) {
    const { hostname } = this.props;
    return requestNodeChart(hostname, period);
  }

  title() {
    return 'Node Activity';
  }

  subtitle() {
    const { data } = this.props;
    if (!data || !data.meta) return null;

    const { id: hostname } = data.meta;

    return hostname;
  }

  chartOptions() {
    const { cores } = this.props;

    return {
      series: {
        0: { targetAxisIndex: 0 },
        1: { targetAxisIndex: 1 },
        2: { targetAxisIndex: 1 }
      },
      vAxes: {
        0: {
          minValue: 1,
          maxValue: cores,
          format: '',
          textStyle: { color: '#999' },
          titleTextStyle: { color: '#aaa' },
          title: 'Load',
          gridlines: {
            color: '#333'
          }
        },
        1: {
          minValue: 1,
          maxValue: 1,
          format: 'percent',
          title: 'CPU / RAM %',
          titleTextStyle: { color: '#aaa' },
          textStyle: { color: '#999' },
          gridlines: {
            color: '#333'
          }
        }
      }
    }
  }
}

export default NodeChart;
