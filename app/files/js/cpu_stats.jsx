import React from 'react';
import numeral from 'numeral';

class CPUStats {
  constructor(stats) {
    this.stats = stats;
  }

  tooltip() {
    return `<b>CPU</b><br/><span class='text-${this.level()}'>${this.percent()}</span>`;
  }

  label() {
    return `CPU: ${this.percent()}`;
  }

  level() {
    const percent = 100 - this.stats.cpu_usage.idle;

    if (percent < 75) {
      return 'success';
    } else if (percent < 90) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  percent() {
    return numeral(100 - this.stats.cpu_usage.idle).format('0.00') + '%';
  }
}

export default CPUStats;
