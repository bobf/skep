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
import os.path

from . import net_stat
from .test_path import patch_env

import unittest
from unittest import mock


# configuration
NETWORK_INTERFACE = 'eth999'


class TestNetworkStats(unittest.TestCase):

    def setUp(self):
        self.interface = NETWORK_INTERFACE
        patch_env(self)

    def test_rx_tx_bytes(self):
        rx, tx = net_stat.rx_tx_bytes(
            self.interface
        )
        self.assertEqual(rx, 10)
        self.assertEqual(tx, 90)

    def test_rx_tx_bits(self):
        rx, tx = net_stat.rx_tx_bits(
            self.interface
        )
        self.assertEqual(rx, 80)
        self.assertTrue(rx, 240)

    def test_rx_tx_dump(self):
        rx, tx = net_stat.rx_tx_dump(
            self.interface
        )
        self.assertEqual(rx, [10, 20, 30, 40, 50, 60, 70, 80])
        self.assertEqual(tx, [90, 100, 110])

    def test_invalid_net_interface(self):
        self.assertRaises(
            net_stat.NetError,
            net_stat.rx_tx_bytes,
            'eth-BAD'
        )



if __name__ == '__main__':
    test_suite = unittest.TestLoader().loadTestsFromTestCase(TestNetworkStats)
    unittest.TextTestRunner(verbosity=2).run(test_suite)
