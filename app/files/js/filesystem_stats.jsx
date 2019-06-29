class FilesystemStats {
  constructor(stats) {
    this.stats = stats;
  }

  path() {
    return this.stats.path;
  }

  label() {
    return this.percent();
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
    return numeral(this.available() / this.stats.total).format('0.00%');
  }
}

export default FilesystemStats;
