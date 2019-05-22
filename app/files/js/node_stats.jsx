import DiskStats from './disk_stats';
import FilesystemStats from './filesystem_stats';
import MemoryStats from './memory_stats';
import NetworkStats from './network_stats';
import CPUStats from './cpu_stats';

class NodeStats extends React.Component {
  constructor(props) {
    super(props);
    this.initialize(props);
  }

  initialize(props) {
    const { stats } = props;
    const { memory, cpu, disks, filesystems, load, networks } = (stats || {});

    this.memory = memory ? new MemoryStats(memory) : null;
    this.cpu = cpu ? new CPUStats(cpu) : null;
    this.networks = this.collection(networks, NetworkStats);
    this.disks = this.collection(disks, DiskStats);
    this.filesystems = this.collection(filesystems, FilesystemStats);
    this.load = load; // Load is just an array; we don't abstract it.
  }

  collection(array, factory) {
    if (!array) return [];

    return array.map(item => new factory(item));
  }

  progress(options) {
    const { minimized } = this.props;
    const { percent, level, label, className } = options;
    const tooltip = minimized ? label : null;

    return (
      <div className={'progress position-relative ' + className}
           style={{ height: '2em' }}
           title={tooltip}
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
      tooltip: minimized ? this.memory.label() : null,
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

  renderNetwork(network) {
    return (
      <tr className='network-stats'
          key={`network-stats-${network.interface}`}>
        <th>
          {filesystem.path()}
        </th>
        <td>
          {this.renderFilesystemUsage(filesystem)}
        </td>
      </tr>
    );
  }

  renderMinimized() {
    return (
      <div className={'node-stats'}>
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
            {this.networks.map(network => this.renderNetwork(network))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { minimized } = this.props;

    this.initialize(this.props);

    if (minimized) {
      return this.renderMinimized();
    } else {
      return this.renderMaximized();
    }
  }
}


export default NodeStats;
