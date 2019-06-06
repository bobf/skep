from stats.path import Path

mapping = {
    'MemFree': 'free',
    'MemTotal': 'total',
    'MemAvailable': 'available',
    'Active': 'active',
    'Cached': 'cached',
    'SwapTotal': 'swap_total',
    'SwapFree': 'swap_free'
}

def stats():
    lines = open(Path.proc_meminfo()).readlines()
    print(lines)
    results = {}
    for key, value in mapping.items():
        for line in lines:
            if line.startswith(key + ': '):
                results[value] = int(line.split()[1]) * 1024
    return results
