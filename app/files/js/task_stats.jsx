import * as Icon from 'react-feather';

class TaskStats extends React.Component {
  constructor(props) {
    super(props);
    // The values that we consider to represent extremely I/O usage.
    // (Sum of transmitted/received bytes per second). If a container exceeds
    // exceeds these values then the relevant meter will be at 100%.
    this.networkCap = 1024 * 1024 * 10; // 10mb
    this.diskCap = 1024 * 1024 * 10; // 10mb
  }

  period(humanize) {
    const { read: current } = this.props.stats.current;
    const { read: previous } = this.props.stats.previous;
    if (!current || !previous) return null;

    const period = (moment(current) - moment(previous)) / 1000;
    return humanize ? numeral(period).format('0.00') : period;
  }

  cpuUsage() {
    const { averagedCpuStats } = this.props.stats.current;
    if (!averagedCpuStats || isNaN(averagedCpuStats)) return 0;
    return averagedCpuStats;
  }

  memoryUsage() {
    const { memory_stats } = this.props.stats.current;
    if (!memory_stats) return 0;
    return memory_stats.usage;
  }

  memoryLimit() {
    const { memory_stats } = this.props.stats.current;
    if (!memory_stats) return 0;
    return memory_stats.limit;
  }

  networkActivity() {
    const { averagedNetworkStats } = this.props.stats.current;
    if (!averagedNetworkStats) return 0;
    return averagedNetworkStats;
  }

  diskActivity() {
    const { averagedDiskStats } = this.props.stats.current;
    if (!averagedDiskStats) return 0;
    return averagedDiskStats;
  }

  level(usage) {
    const percentage = usage * 100;
    if (percentage < Skep.thresholds.global.success) {
      return 'success';
    } else if (percentage < Skep.thresholds.global.warning) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  progress(title, usage, customTooltip, label) {
    const level = this.level(usage);
    const percentage = numeral(usage).format('0.00%');
    const tooltip = `${title}: ${customTooltip || percentage}`;

    return (
      <div className={'progress position-relative'}
           style={{ height: '2em' }}
           data-original-title={tooltip}
           data-toggle={'tooltip'}>
        <div className={'progress-bar bg-' + level}
             style={{ width: percentage }}>
          <span className={'label'}>
            {label ? label : percentage}
          </span>
        </div>
      </div>
    );
  }

  dataTransferTooltip(activity) {
    if (activity === null) return '[Waiting for analytics]';

    const { statsEnd, statsStart } = this.props.stats.current;
    if (!statsStart) return 'Waiting for metrics';
    const duration = Math.round((statsEnd - statsStart) / 1000);
    const bytes = numeral(activity).format('0.00b');
    return `${bytes} transferred in ${duration} seconds`;
  }

  dataTransferLabel(activity) {
    if (activity === null) return '';
    const { statsEnd, statsStart } = this.props.stats.current;
    const duration = (statsEnd - statsStart) / 1000;
    const bytesPerSecond = numeral(activity / duration).format('0.00b');
    return `${bytesPerSecond}/s`;
  }

  renderCpu() {
    const { previous } = this.props.stats;

    if (!Object.entries(previous).length) {
      return (
        <div className={'cpu'}>
          <Icon.Cpu size={'1em'} className={'icon'} />
          {this.progress('CPU', 0, 'Waiting for metrics', 'waiting')}
        </div>
      );
    }

    const usage = Math.min(this.cpuUsage(), 1);
    const percentage = numeral(usage).format('0.00%');
    const tooltip = `${percentage} of total system CPU usage`;
    const label = percentage;
    return (
      <div className={'cpu'}>
        <Icon.Cpu size={'1em'} className={'icon'} />
        {this.progress('CPU', usage, tooltip, label)}
      </div>
    );
  }

  renderMemory() {
    const ratio = this.memoryUsage() / this.memoryLimit();
    const usageBytes = numeral(this.memoryUsage()).format('0.00b');
    const limitBytes = numeral(this.memoryLimit()).format('0.00b');
    const percentage = numeral(ratio).format('0.00%');
    const tooltip = `${usageBytes} used of ${limitBytes} limit (${percentage})`;
    const label = usageBytes;
    return (
      <div className={'memory'}>
        <Icon.Zap size={'1em'} className={'icon'} />
        {this.progress('RAM', ratio, tooltip, label)}
      </div>
    );
  }

  renderNetwork() {
    const activity = this.networkActivity();
    const tooltip = this.dataTransferTooltip(activity);
    const label = this.dataTransferLabel(activity);
    const { statsEnd, statsStart } = this.props.stats.current;
    const duration = (statsEnd - statsStart) / 1000;
    const bytesPerSecond = activity / duration;
    const usage = Math.min(bytesPerSecond, this.networkCap) / this.networkCap;

    return (
      <div className={'network'}>
        <Icon.Wifi size={'1em'} className={'icon'} />
        {this.progress('Network', usage, tooltip, label)}
      </div>
    );
  }

  renderDisk() {
    const activity = this.diskActivity() / this.period();
    const tooltip = this.dataTransferTooltip(activity);
    const label = this.dataTransferLabel(activity);
    const { statsEnd, statsStart } = this.props.stats.current;
    const duration = (statsEnd - statsStart) / 1000;
    const bytesPerSecond = activity / duration;
    const usage = Math.min(bytesPerSecond, this.diskCap) / this.diskCap;

    return (
      <div className={'network'}>
        <Icon.HardDrive size={'1em'} className={'icon'} />
        {this.progress('Disk', usage, tooltip, label)}
      </div>
    );
  }

  render() {
    const { stats } = this.props;

    if (!Object.entries(stats.current).length) return null;

    return (
      <div className={'task-stats'}>
        {this.renderCpu()}
        {this.renderMemory()}
        {this.renderDisk()}
        {this.renderNetwork()}
      </div>
    )
  }
}

export default TaskStats;
