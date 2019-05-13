import DiskStats from './disk_stats';
import FilesystemStats from './filesystem_stats';
import MemoryStats from './memory_stats';
import CPUStats from './cpu_stats';

class NodeStats extends React.Component {
  constructor(props) {
    super(props);
    this.initialize(props);
  }

  initialize(props) {
    const { stats } = props;
    const { memory, cpu, disks, filesystems, load } = (stats || {});

    this.memory = memory ? new MemoryStats(memory) : null;
    this.cpu = cpu ? new CPUStats(cpu) : null;
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
    const { percent, level, label, className } = options;

    return (
      <div className={'progress position-relative ' + className}
           style={{ height: '2em' }}>
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

    return this.progress({
      percent: this.memory.percent(),
      label: this.memory.label(),
      level: this.memory.level(),
      className: 'memory'
    });
  }

  renderCPU() {
    if (!this.cpu) return null;

    return this.progress({
      percent: this.cpu.percent(),
      label: this.cpu.label(),
      level: this.cpu.level(),
      className: 'cpu'
    });
  }

  loadLevel(index) {
    const load = this.load.averages[index];
    const cores = this.load.cores;
    const percent = 100 * (load / cores);

    if (percent < 50) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  renderLoadAverage(index) {
    return (
      <span className={'badge bg-' + this.loadLevel(index)}>
        {numeral(this.load.averages[index]).format('0.00')}
      </span>
    );
  }

  renderLoad() {
    if (!this.load) return null;

    return (
      <div className={'load'}>
        {this.renderLoadAverage(2)}
        {this.renderLoadAverage(1)}
        {this.renderLoadAverage(0)}
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
          <span className={'label'}>Q:</span>
          <span alt={'I/O Queue'} className={`badge bg-${disk.queueLevel()}`}>
            {disk.stats.io.ops}
          </span>

          <span className={'label'}>R:</span>
          <span alt={'Reads'} className={`badge bg-${disk.readsLevel()}`}>
            {disk.stats.io.tps.reads}
          </span>

          <span className={'label'}>W:</span>
          <span alt={'Writes'} className={`badge bg-${disk.writesLevel()}`}>
            {disk.stats.io.tps.writes}
          </span>
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

  render() {
    this.initialize(this.props);

    return (
      <div className={'node-stats'}>
        <table>
          <tbody>
            <tr>
              <th>
                {'RAM'}
              </th>
              <td>
                {this.renderMemory()}
              </td>
            </tr>
            <tr>
              <th>
                {'CPU'}
              </th>
              <td>
                {this.renderCPU()}
              </td>
            </tr>
            <tr>
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
}

export default NodeStats;
