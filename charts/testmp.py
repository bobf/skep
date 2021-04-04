import time
from pathos.multiprocessing import ProcessPool

def func(_a):
    for x in range(10):
        print(":)))")
        time.sleep(1)

pool = ProcessPool(nodes=4)
_results = pool.amap(func, [None])

time.sleep(10)
