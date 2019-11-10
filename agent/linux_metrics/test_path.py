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

import os

import unittest
from unittest import mock

from .path import Path

def patch_env(test_case):
    fs = os.path.join(os.path.dirname(__file__), 'test_filesystem')
    patcher = mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': fs })
    patcher.start()
    test_case.addCleanup(patcher.stop)

class TestPath(unittest.TestCase):

    def setUp(self):
        pass

    def test_proc_stat_default(self):
        self.assertEqual(Path.proc_stat(), '/proc/stat')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_stat_from_env(self):
        self.assertEqual(Path.proc_stat(), '/myfs/proc/stat')

    def test_proc_net_dev_default(self):
        self.assertEqual(Path.proc_net_dev(), '/proc/net/dev')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_proc_net_dev_from_env(self):
        self.assertEqual(Path.proc_net_dev(), '/myfs/proc/net/dev')

    def test_proc_meminfo_default(self):
        self.assertEqual(Path.proc_meminfo(), '/proc/meminfo')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_proc_meminfo_from_env(self):
        self.assertEqual(Path.proc_meminfo(), '/myfs/proc/meminfo')

    def test_proc_diskstats_default(self):
        self.assertEqual(Path.proc_diskstats(), '/proc/diskstats')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_proc_diskstats_from_env(self):
        self.assertEqual(Path.proc_diskstats(), '/myfs/proc/diskstats')

    def test_proc_stat_default(self):
        self.assertEqual(Path.proc_stat(), '/proc/stat')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_proc_stat_from_env(self):
        self.assertEqual(Path.proc_stat(), '/myfs/proc/stat')

    def test_proc_loadavg_default(self):
        self.assertEqual(Path.proc_loadavg(), '/proc/loadavg')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_proc_loadavg_from_env(self):
        self.assertEqual(Path.proc_loadavg(), '/myfs/proc/loadavg')

    def test_proc_cpuinfo_default(self):
        self.assertEqual(Path.proc_cpuinfo(), '/proc/cpuinfo')

    @mock.patch.dict(os.environ, { 'LINUX_METRICS_ROOT_FS': '/myfs' })
    def test_proc_cpuinfo_from_env(self):
        self.assertEqual(Path.proc_cpuinfo(), '/myfs/proc/cpuinfo')

if __name__ == '__main__':
    test_suite = unittest.TestLoader().loadTestsFromTestCase(TestPath)
    unittest.TextTestRunner(verbosity=2).run(test_suite)
