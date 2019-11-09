#!/usr/bin/env python
#
#  Copyright (c) 2010-2013 Corey Goldberg (http://goldb.org)
#
#  This file is part of linux-metrics
#
#  License :: OSI Approved :: MIT License:
#      http://www.opensource.org/licenses/mit-license
#
#      Permission is hereby granted, free of charge, to any person obtaining a copy
#      of this software and associated documentation files (the "Software"), to deal
#      in the Software without restriction, including without limitation the rights
#      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#      copies of the Software, and to permit persons to whom the Software is
#      furnished to do so, subject to the following conditions:
#
#      The above copyright notice and this permission notice shall be included in
#      all copies or substantial portions of the Software.
#


import unittest

from . import cpu_stat
from .test_path import patch_env


class TestCPUStats(unittest.TestCase):

    def setUp(self):
        self.sample_duration = .1  # secs
        patch_env(self)

    def test_cpu_info(self):
        values = cpu_stat.cpu_info()
        self.assertTrue(len(values) > 0, values)

    def test_cpu_percent_idle(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['idle']
        self.assertEqual(value, None)

    def test_cpu_percent_iowait(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['iowait']
        self.assertEqual(value, None)

    def test_cpu_percent_irq(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['irq']
        self.assertEqual(value, None)

    def test_cpu_percent_nice(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['nice']
        self.assertEqual(value, None)

    def test_cpu_percent_softirq(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['softirq']
        self.assertEqual(value, None)

    def test_cpu_percent_system(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['system']
        self.assertEqual(value, None)

    def test_cpu_percent_user(self):
        value = cpu_stat.cpu_percents(self.sample_duration)['user']
        self.assertEqual(value, None)

    def test_cpu_percents(self):
        values = cpu_stat.cpu_percents(self.sample_duration)
        self.assertEqual(values, [])

    def test_cpu_percents(self):
        cpu_stat.cpu_percents(self.sample_duration)

    def test_cpu_times(self):
        values = cpu_stat.cpu_times()
        self.assertEqual(values, [1, 2, 3, 4, 5, 6, 7, 8, 9])

    def test_procs_blocked(self):
        value = cpu_stat.procs_blocked()
        self.assertEqual(value, 33)

    def test_procs_running(self):
        value = cpu_stat.procs_running()
        self.assertEqual(value, 50)

    def test_load_avg(self):
        values = cpu_stat.load_avg()
        self.assertEqual(values, [1, 2, 3])



if __name__ == '__main__':
    test_suite = unittest.TestLoader().loadTestsFromTestCase(TestCPUStats)
    unittest.TextTestRunner(verbosity=2).run(test_suite)
