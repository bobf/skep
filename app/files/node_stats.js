class NodeStats extends React.Component {
  constructor(props) {
    super(props);
    this.initialize(props);
  }

  initialize(props) {
    const { stats } = props;
    const { memory, cpu } = (stats || {});

    this.memory = memory ? new MemoryStats(memory) : null;
    this.cpu = cpu ? new CPUStats(cpu) : null;
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
          </tbody>
        </table>
      </div>
    );
  }
}
