class MemoryStats {
  constructor(stats) {
    this.stats = stats;
  }

  label() {
    const free = this.formatNumber(this.stats.total - this.free());
    const total = this.formatNumber(this.stats.total);

    return `${free} / ${total}`;
  }

  level() {
    const percent = 100 * (this.stats.used / this.stats.total);

    if (percent < 50) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(this.stats.used / this.stats.total).format('0.00%');
  }

  free() {
    return this.stats.total - this.stats.used;
  }

  formatNumber(number) {
    return numeral(number).format('0.00b');
  }
}

export default MemoryStats;
