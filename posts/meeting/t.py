import heapq
from typing import List
from math import inf

class Solution:
<<<<<<< HEAD
    def smallestRange(self, nums: List[List[int]]) -> List[int]:

        
        for i in range(len(nums)):
            for j in range(len(nums[i])):
                nums[i][j] = (nums[i][j], i)
        # for i in range(len(nums)):
        #     all_list.extend(nums[i])
        all_sorted = list(heapq.merge(*nums))
        # comp = []
        # for i in range(len(nums)):
        #     comp.append((0, len(nums[i])))
        # while 

        print(all_sorted)
        i, j = 0, len(nums)
        ret = []
        std_w_set = set([i for i in range(len(nums))])
        cur_len = 10e5
        cur_ret = None
        while j <= len(all_sorted):
            cur_w_set = set([all_sorted[m][1] for m in range(i, j)])
            if cur_w_set == std_w_set:
                if all_sorted[j-1][0] - all_sorted[i][0] < cur_len:
                    cur_len = all_sorted[j-1][0] - all_sorted[i][0]
                    cur_ret = [all_sorted[i][0], all_sorted[j-1][0]]
                elif all_sorted[j-1][0] - all_sorted[i][0] == cur_len:
                    if all_sorted[i][0] < cur_ret[0]:
                        cur_ret = [all_sorted[i][0], all_sorted[j-1][0]]
                # ret.append((all_sorted[j-1][0] - all_sorted[i][0],all_sorted[i][0]))
                if j - i == len(nums):
                    i += 1
                    j += 1
                else:
                    i += 1
            elif cur_w_set < std_w_set:
                j += 1
       
        return cur_ret
        
s = Solution()
print(s.smallestRange([[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]))
=======
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        g = [[inf for _ in range(n)] for _ in range(n)]  # 邻接矩阵
        for x, y, d in times:
            g[x - 1][y - 1] = d

        dis = [inf] * n
        ans = dis[k - 1] = 0
        done = [False] * n
        while True:
            x = -1
            for i, ok in enumerate(done):
                if not ok and (x < 0 or dis[i] < dis[x]):
                    x = i
            if x < 0:
                return ans  # 最后一次算出的最短路就是最大的
            if dis[x] == inf:  # 有节点无法到达
                return -1
            ans = dis[x]  # 求出的最短路会越来越大
            done[x] = True  # 最短路长度已确定（无法变得更小）
            for y, d in enumerate(g[x]):
                # 更新 x 的邻居的最短路
                dis[y] = min(dis[y], dis[x] + d)

s = Solution()
print(s.networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2))  # 2
>>>>>>> 5448e2c1ac6d38cb827659091f725658ae7c3b0c
