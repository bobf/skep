import * as Icon from 'react-feather';
import Chart from 'react-google-charts';

class TaskChart extends React.Component {
  constructor(props) {
    super(props);
  }

  loader() {
    return (
      <div className={'chart loading'}>
        Loading Chart
      </div>
    );
  }

  render() {
    const { chart, period } = this.props.data;
    const { closeCallback } = this.props;
    const periodHuman = moment.duration(period, 'seconds').humanize(false);
    const style = {
      zIndex: 9999999999,
      position: 'absolute',
      display: 'flex',
      maxWidth: 900
    };

    return (
      <div onClick={closeCallback} className={'modal-content chart'} style={style}>
        <div className={'close-icon'}>
          <Icon.XCircle className={'text-danger'} />
        </div>
        <Chart
          width={'30em'}
          height={'20em'}
          chartType={'AreaChart'}
          loader={this.loader()}
          data={chart}
          options={{
            title: 'Container Resource Usage',
            titleTextStyle: { color: '#dedede', fontWeight: 'bold' },
            backgroundColor: 'transparent',
            legend: {
              textStyle: {
                color: '#999'
              }
            },
            hAxis: {
              textPosition: 'none',
              title: `Period: ${periodHuman}`,
              titleTextStyle: { color: '#eee' },
              baselineColor: '#999',
              gridlines: {
                color: '#999'
              },
            },
            vAxis: {
              minValue: 1,
              format: 'percent',
              textStyle: { color: '#999' }
            },
            chartArea: { width: '50%', height: '70%' },
          }}
        />
      </div>
    );
  }
}

export default TaskChart;
