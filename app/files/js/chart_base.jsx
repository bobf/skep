import moment from 'moment';
import React from 'react';
import Chart from 'react-google-charts';

import Messages from './messages';
import Modal from './modal';
import store from './redux/store';
import { requestNodeChart, requestContainerChart, NO_DATA } from './redux/models/charts';

class ChartBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: true, periodDefault: 3600 };
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

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    const { data: prevData } = prevProps;
    if (data !== prevData) {
      this.setState({ loading: false });
    }
  }


  periodChange(ev) {
    this.setState({ loading: true, periodDefault: ev.target.value });
    store.dispatch(this.requestChart(ev.target.value));
  }

  renderNoData() {
    return (
      <div className={'no-data'}>
        {Messages.chart.noData}
      </div>
    );
  }

  renderLoading() {
    return (
      <div className={'loader'}>
        {Messages.chart.loading}
      </div>
    );
  }

  chart() {
    const { loading, periodDefault } = this.state;
    const { chart, period } = this.props.data;

    if (chart === NO_DATA) return this.renderNoData();
    if (loading) return this.renderLoading();

    return (
      <div className={'chart-view'}>
        <div className={'period-menu'}>
          <span className={'period-title'}>Time Period:</span>
          <select
            className={'custom-select'}
            defaultValue={periodDefault}
            onChange={(ev) => this.periodChange(ev)}>
            <option value={3600}>1 hour</option>
            <option value={86400}>1 day</option>
            <option value={604800}>1 week</option>
          </select>
        </div>
        <Chart
          width={'60em'}
          height={'28em'}
          chartType={'AreaChart'}
          data={chart}
          options={this.options()}
        />
      </div>
    );
  }

  renderError() {
    return (
      <div>
        {Messages.chart.error}
      </div>
    );
  }

  renderChartContent(chart) {
    return (
      <div className={'chart-content'}>
        {chart ? this.chart() : this.renderLoading()}
      </div>
    );
  }

  render() {
    const { chart, error } = this.props.data || {};
    const { closeCallback } = this.props;
    const className = chart ? 'ready' : (error ? 'error' : 'loading');
    const content = error ? this.renderError() : this.renderChartContent(chart);

    return (
      <Modal
        content={content}
        closeCallback={closeCallback}
        wrapperClass={'chart-wrapper'}
        contentClass={`chart ${className}`}
        title={this.title()}
        subtitle={this.subtitle()} />
    );
  }
}

export default ChartBase;
