import Chart from 'react-google-charts';

import Messages from './messages';
import Modal from './modal';

class ChartBase extends React.Component {
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
        titleTextStyle: { color: '#aaa' },
        baselineColor: '#555',
        gridlines: {
          color: '#333'
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

  renderChartContent(chart) {
    return (
      <div className={'chart-content'}>
        {chart ? this.chart() : this.loader()}
      </div>
    );
  }

  render() {
    const { chart } = this.props.data || {};
    const { closeCallback } = this.props;
    const className = chart ? 'ready' : 'loading';

    return (
      <Modal
        content={this.renderChartContent(chart)}
        closeCallback={closeCallback}
        wrapperClass={'chart-wrapper'}
        contentClass={`chart ${className}`}
        title={this.title()}
        subtitle={this.subtitle()} />
    );
  }
}

export default ChartBase;
