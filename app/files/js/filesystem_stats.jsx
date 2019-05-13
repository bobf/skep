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
    const percent = 100 * (this.available() / this.stats.total);

    if (percent < 60) {
      return 'success';
    } else if (percent < 80) {
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
