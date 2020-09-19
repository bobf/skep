class FilesystemStats {
  constructor(stats) {
    this.stats = stats;
  }

  tooltip() {
    return (
      `<div class='filesystem-tooltip'>
        Path: <em>${this.path()}</em>
        <br/>
        Usage: <em class="text-${this.level()}">${this.percent()}</em>
        <span class='syntax'>(</span>${this.usage()}<span class='syntax'>)</span>
      </div>`
    );
  }

  path() {
    return this.stats.path;
  }

  label() {
    return this.percent();
  }

  usage() {
    return `<em class='disk-usage free'>${numeral(this.stats.free).format('0.00b')}</em>
            <span class="syntax">/</span>
            <em class='disk-usage total'>${numeral(this.stats.total).format('0.00b')}</em>`;
  }

  available() {
    return this.stats.total - this.stats.free;
  }

  level() {
    const percentage = 100 * (this.available() / this.stats.total);

    if (percentage < Skep.thresholds.global.success) {
      return 'success';
    } else if (percentage < Skep.thresholds.global.warning) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    if (this.available() === 0 && this.stats.total === 0) return '100%';
    return numeral(this.available() / this.stats.total).format('0.00%');
  }
}

export default FilesystemStats;
