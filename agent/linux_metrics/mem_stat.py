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
    mem_stat - Python Module for Memory Stats on Linux
    
    requires:
    - Python 2.6+
    - Linux 2.6+
    
"""

from .path import Path


mapping = {
    'MemFree', 'free',
    'MemTotal': 'total',
    'MemAvailable': 'available',
    'Active': 'active',
    'Cached': 'cached',
    'SwapTotal': 'swap_total',
    'SwapFree': 'swap_free'
}

def mem_stats():
    lines = open(Path.proc_meminfo()).readlines()
    results = {}
    for key, value in mapping.items():
        for line in lines:
            if line.startswith(key + ': '):
                results[value] = int(line.split()[1]) * 1024
    return results
