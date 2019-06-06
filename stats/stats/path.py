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
