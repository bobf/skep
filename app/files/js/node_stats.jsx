import * as Icon from 'react-feather';

import CPUStats from './cpu_stats';
import DiskStats from './disk_stats';
import FilesystemStats from './filesystem_stats';
import MemoryStats from './memory_stats';
import Messages from './messages';
import NetworkStats from './network_stats';

class NodeStats extends React.Component {
  constructor(props) {
    super(props);
    this.initialize(props);
  }

  initialize(stats) {
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
           style={{ height: minimized ? '2em' : '2.5em' }}
           data-original-title={tooltip}
           data-html={'true'}
           data-placement="bottom"
           data-boundary="window"
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

  renderSwap() {
    if (!this.memory) return null;

    const { minimized } = this.props;

    return this.progress({
      percent: this.memory.swapPercent(),
      tooltip: this.memory.swapTooltip(),
      label: minimized ? 'Swap' : `${this.memory.swapUsage()} / ${this.memory.swapTotal()}`,
      level: this.memory.swapLevel(),
      className: 'swap'
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
      Messages.node.stats.loadAverage.oneMinute,
      Messages.node.stats.loadAverage.tenMinutes,
      Messages.node.stats.loadAverage.fifteenMinutes,
    ][index];

    return (
      <span
        title={title}
        data-toggle={'tooltip'}
        data-html={'true'}
        data-placement="bottom"
        data-container="body"
        data-boundary="window"
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
      tooltip: filesystem.tooltip(),
      className: 'filesystem'
    });
  }

  renderMinimized() {
    return (
      <div className={'node-stats'}>
        <div className="disks-group">
          {this.diskStatus()}
        </div>
        <div className="meters">
          <div className={'meter memory'}>
            {this.renderMemory()}
          </div>
          <div className={'meter swap'}>
            {this.renderSwap()}
          </div>
          <div className={'meter cpu'}>
            {this.renderCPU()}
          </div>
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
        <div className="disks-group">
          {this.diskStatus()}
        </div>
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
            <tr className={'swap'}>
              <th>
                {'Swap'}
              </th>
              <td>
                {this.renderSwap()}
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
    const { nodeID, minimized } = this.props;
    const { filesystems } = this.props.stats;
    if (!filesystems) return null;

    return filesystems.map(
      filesystem => {
        const stats = new FilesystemStats(filesystem);
        return (
          <Icon.HardDrive
            key={`${nodeID}-${filesystem.path}`}
            className={`icon disks text-${stats.level()}`}
            data-html={'true'}
            data-placement="right"
            data-boundary="window"
            data-original-title={stats.tooltip()}
            data-toggle={'tooltip'}
          />
        )
      }
    );
  }

  diskStatusMessage(level) {
    const warnPrefix = 'One or more monitored filesystems are over';
    const okPrefix = 'All monitored filesystems are less than';
    return {
      danger: `${warnPrefix} <em>${Skep.thresholds.global.warning}%</em> full`,
      warning: `${warnPrefix} <em>${Skep.thresholds.global.success}%</em> full`,
      success: `${okPrefix} <em>${Skep.thresholds.global.success}%</em> full`
    }[level];
  }

  render() {
    const { minimized } = this.props;
    const { stats } = this.props;
    if (!stats) return null;

    this.initialize(stats);

    if (minimized) {
      return this.renderMinimized();
    } else {
      return this.renderMaximized();
    }
  }
}


export default NodeStats;
