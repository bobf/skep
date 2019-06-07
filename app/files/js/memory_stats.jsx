class MemoryStats {
  constructor(stats) {
    this.stats = stats;
    this.stats.unavailable = this.stats.total - this.stats.available;
  }

  label() {
    const labels = [
      '<b>RAM</b>',
      `Available: ${this.formatNumber(this.stats.available)}`,
      `Total: ${this.formatNumber(this.stats.total)}`,
      `Cache: ${this.formatNumber(this.stats.cached)}`,
      `Active: ${this.formatNumber(this.stats.active)}`,
      `Free: ${this.formatNumber(this.stats.free)}`,
      `Swap (total): ${this.formatNumber(this.stats.swap_total)}`,
      `Swap (free): ${this.formatNumber(this.stats.swap_free)}`
    ];

    return labels.join('<br/>');
  }

  level() {
    const percent = 100 * (this.stats.unavailable / this.stats.total);

    if (percent < 50) {
      return 'success';
    } else if (percent < 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(this.unavailable / this.stats.total).format('0.00%');
  }

  formatNumber(number) {
    return numeral(number).format('0.00b');
  }
}

export default MemoryStats;
