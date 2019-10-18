import * as Icon from 'react-feather';
import Chart from 'react-google-charts';

class TaskChart extends React.Component {
  constructor(props) {
    super(props);
  }

  close(ev, callback) {
    if (ev.target.closest('.modal-content')) return false;

    return callback();
  }

  loader() {
    return (
      <div className={'loading'}>
        Loading...
      </div>
    );
  }

  chart() {
    const { chart, period } = this.props.data;
    const periodHuman = moment.duration(period, 'seconds').humanize(false);

    return (
      <Chart
        width={'60em'}
        height={'30em'}
        chartType={'AreaChart'}
        data={chart}
        options={{
          title: '',
          titleTextStyle: { color: '#dedede', fontWeight: 'bold' },
          backgroundColor: 'transparent',
          legend: {
            textStyle: {
              color: '#999'
            }
          },
          series: {
            0: { targetAxisIndex: 0 },
            1: { targetAxisIndex: 0 },
            2: { targetAxisIndex: 1 },
            3: { targetAxisIndex: 1 }
          },
          vAxes: {
            0: {
              minValue: 1,
              format: 'percent',
              textStyle: { color: '#999' }
            },
            1: {
              minValue: 1,
              format: 'short',
              textStyle: { color: '#999' },
              titleTextStyle: { color: '#eee' },
              title: 'Bytes per second'
            }
          },
          hAxis: {
            textPosition: 'none',
            title: `Period: ${periodHuman}`,
            titleTextStyle: { color: '#eee' },
            baselineColor: '#999',
            gridlines: {
              color: '#555'
            },
          },
          chartArea: { width: '85%', height: '70%' }
        }}
      />
    );
  }

  render() {
    const { chart } = this.props.data || {};
    const { closeCallback } = this.props;
    const className = chart ? 'ready' : 'loading';

    return (
      <div onClick={(ev) => this.close(ev, closeCallback)} className={'modal-wrapper modal'}>
        <div className={`modal-content chart ${className}`}>
          <div className={'viewport'}>
            <div className={'header'}>
              <h5>Container Resource Usage</h5>
            </div>
          </div>
          <div className={'chart-content'}>
            {chart ? this.chart() : this.loader()}
          </div>
        </div>
      </div>
    );
  }
}

export default TaskChart;
