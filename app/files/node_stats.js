class NodeStats extends React.Component {
  constructor(props) {
    super(props);
    this.initialize(props);
  }

  initialize(props) {
    const { stats } = props;
    const { memory, cpu, disks, filesystems } = (stats || {});

    this.memory = memory ? new MemoryStats(memory) : null;
    this.cpu = cpu ? new CPUStats(cpu) : null;
    this.disks = this.diskStats(disks);
    this.filesystems = this.filesystemStats(filesystems);
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
            {this.disks.map(disk => this.renderDisk(disk))}
            {this.filesystems.map(filesystem => this.renderFilesystem(filesystem))}
          </tbody>
        </table>
      </div>
    );
  }
}
