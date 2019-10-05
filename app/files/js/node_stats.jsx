import * as Icon from 'react-feather';

import DiskStats from './disk_stats';
import FilesystemStats from './filesystem_stats';
import MemoryStats from './memory_stats';
import CPUStats from './cpu_stats';
import NetworkStats from './network_stats';

class NodeStats extends React.Component {
  constructor(props) {
    super(props);
    this.initialize(props);
  }

  initialize(props) {
    const { stats } = props;
    const { memory, cpu, networks, disks, filesystems, load } = (stats || {});

    this.memory = memory ? new MemoryStats(memory) : null;
    this.cpu = cpu ? new CPUStats(cpu) : null;
    this.networks = networks ? new NetworkStats (networks) : null;
    this.disks = this.diskStats(disks);
    this.filesystems = this.filesystemStats(filesystems);
    this.load = load;
  }

  diskStats(disks) {
    return (disks || []).map(disk => new DiskStats(disk));
  }

  filesystemStats(filesystems) {
    return (filesystems || []).map(filesystem => new FilesystemStats(filesystem));
  }

  progress(options) {
    const { minimized } = this.props;
    const { percent, level, label, className, tooltip } = options;

    return (
      <div className={'progress position-relative ' + className}
           style={{ height: '2em' }}
           data-title={tooltip}
           data-original-title={tooltip}
           data-html={'true'}
           data-toggle={tooltip ? 'tooltip' : null}>
        <div className={'progress-bar bg-' + level}
             style={{ width: percent }}>
          <span className={'label'}>
            {label}
          </span>
        </div>
      </div>
    );
  }

  renderMemory() {
    if (!this.memory) return null;

    const { minimized } = this.props;

    return this.progress({
      percent: this.memory.percent(),
      tooltip: this.memory.tooltip(),
      label: minimized ? 'RAM' : this.memory.label(),
      level: this.memory.level(),
      className: 'memory'
    });
  }

  renderCPU() {
    if (!this.cpu) return null;

    const { minimized } = this.props;

    return this.progress({
      percent: this.cpu.percent(),
      tooltip: this.cpu.tooltip(),
      label: minimized ? 'CPU' : this.cpu.label(),
      level: this.cpu.level(),
      className: 'cpu'
    });
  }

  loadLevel(index) {
    const load = this.load.averages[index];
    const cores = this.load.cores;
    const percentage = 100 * (load / cores);

    if (percentage < Skep.thresholds.global.success) {
      return 'success';
    } else if (percentage < Skep.thresholds.global.warning) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  renderLoadAverage(index) {
    const title = [
      '1 Minute Load Average',
      '10 Minutes Load Average',
      '15 Minutes Load Average',
    ][index];

    return (
      <span
        title={title}
        data-toggle={'tooltip'}
        className={'badge bg-' + this.loadLevel(index)}>
        {numeral(this.load.averages[index]).format('0.00')}
      </span>
    );
  }

  renderLoad() {
    if (!this.load) return null;

    return (
      <div className={'load'}>
        {this.renderLoadAverage(0)}
        {this.renderLoadAverage(1)}
        {this.renderLoadAverage(2)}
      </div>
    );
  }

  renderDisk(disk) {
    return (
      <tr className='disk-stats'
          key={`disk-stats-${disk.name()}`}>
        <th>
          {disk.name()}
        </th>
        <td>
          <div className={'metrics'}>
            <span className={'label'}>Q:</span>
            <span alt={'I/O Queue'} className={`badge dense bg-${disk.queueLevel()}`}>
              {disk.stats.io.ops}
            </span>

            <span className={'label'}>R:</span>
            <span alt={'Reads'} className={`badge dense bg-${disk.readsLevel()}`}>
              {disk.stats.io.tps.reads}
            </span>

            <span className={'label'}>W:</span>
            <span alt={'Writes'} className={`badge dense bg-${disk.writesLevel()}`}>
              {disk.stats.io.tps.writes}
            </span>
          </div>
        </td>
      </tr>
    );
  }

  renderFilesystem(filesystem) {
    return (
      <tr className='filesystem-stats'
          key={`filesystem-stats-${filesystem.path}`}>
        <th>
          {filesystem.path()}
        </th>
        <td>
          {this.renderFilesystemUsage(filesystem)}
        </td>
      </tr>
    );
  }

  renderFilesystemUsage(filesystem) {
    return this.progress({
      percent: filesystem.percent(),
      label: filesystem.label(),
      level: filesystem.level(),
      className: 'filesystem'
    });
  }

  renderMinimized() {
    return (
      <div className={'node-stats'}>
        {this.diskStatus()}
        <div className={'meter memory'}>
          {this.renderMemory()}
        </div>
        <div className={'meter cpu'}>
          {this.renderCPU()}
        </div>
        <div className={'load-averages'}>
          {this.renderLoad()}
        </div>
      </div>
    );
  }

  renderMaximized() {
    return (
      <div className={'node-stats'}>
        {this.diskStatus()}
        <table>
          <tbody>
            <tr className={'memory'}>
              <th>
                {'RAM'}
              </th>
              <td>
                {this.renderMemory()}
              </td>
            </tr>
            <tr className={'cpu'}>
              <th>
                {'CPU'}
              </th>
              <td>
                {this.renderCPU()}
              </td>
            </tr>
            <tr className={'load'}>
              <th>
                {'Load'}
              </th>
              <td>
                {this.renderLoad()}
              </td>
            </tr>
            {this.disks.map(disk => this.renderDisk(disk))}
            {this.filesystems.map(filesystem => this.renderFilesystem(filesystem))}
          </tbody>
        </table>
      </div>
    );
  }

  diskStatus() {
    const { stats } = this.props;
    const { filesystems } = this.props.stats;
    if (!filesystems) return null;
    const levels = filesystems.map(
      filesystem => new FilesystemStats(filesystem).level()
    );
    const danger = levels.find(level => level === 'danger');
    const warning = levels.find(level => level === 'warning');
    const success = levels.find(level => level === 'success');
    const reducedLevel = danger || warning || success;
    const tooltip = this.diskStatusMessage(reducedLevel);

    return (
      <Icon.HardDrive
        className={`icon disks text-${reducedLevel}`}
        title={tooltip}
        data-original-title={tooltip}
        data-toggle={'tooltip'}
      />
    );
  }

  diskStatusMessage(level) {
    const warnPrefix = 'One or more monitored filesystems are over';
    const okPrefix = 'All monitored filesystems are less than';
    return {
      danger: `${warnPrefix} ${Skep.thresholds.global.warning}% full`,
      warning: `${warnPrefix} ${Skep.thresholds.global.success}% full`,
      success: `${okPrefix} ${Skep.thresholds.global.success}% full`
    }[level];
  }

  render() {
    const { minimized } = this.props;
    const { stats } = this.props;
    if (!stats) return null;

    this.initialize(this.props);

    if (minimized) {
      return this.renderMinimized();
    } else {
      return this.renderMaximized();
    }
  }
}


export default NodeStats;
