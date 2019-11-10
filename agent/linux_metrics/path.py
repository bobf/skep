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


"""
    path - Python Module for providing configurable system paths (with defaults)


    requires:
    - Python 2.6+
    - Linux 2.6+

"""

import os
import os.path

class Path:
    @classmethod
    def proc_stat(cls):
        return cls.join('/proc/stat')

    @classmethod
    def proc_net_dev(cls):
        return cls.join('/proc/net/dev')

    @classmethod
    def proc_meminfo(cls):
        return cls.join('/proc/meminfo')

    @classmethod
    def proc_diskstats(cls):
        return cls.join('/proc/diskstats')

    @classmethod
    def proc_stat(cls):
        return cls.join('/proc/stat')

    @classmethod
    def proc_loadavg(cls):
        return cls.join('/proc/loadavg')

    @classmethod
    def proc_cpuinfo(cls):
        return cls.join('/proc/cpuinfo')

    @classmethod
    def join(cls, path):
        root = os.environ.get('LINUX_METRICS_ROOT_FS', '/')
        return os.path.join(root, path.lstrip('/'))
