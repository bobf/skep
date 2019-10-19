import Chart from 'react-google-charts';

import Messages from './messages';

class ChartBase extends React.Component {
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

  options() {
    const { period } = this.props.data;
    const periodHuman = moment.duration(period, 'seconds').humanize(false);
    const baseOptions = {
      title: '',
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
          color: '#555'
        }
      },
      chartArea: { width: '85%', height: '70%' }
    };

    return Object.assign({}, baseOptions, this.chartOptions());
  }


  chart() {
    const { chart, period } = this.props.data;

    if (!chart[1]) {
      return (
        <div className={'no-data'}>
          {Messages.chart.noData}
        </div>
      )
    }

    return (
      <Chart
        width={'60em'}
        height={'30em'}
        chartType={'AreaChart'}
        data={chart}
        options={this.options()}
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
              <h5>{this.title()}</h5>
              <div className={'subtitle'}>
                {this.subtitle()}
              </div>
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

export default ChartBase;
