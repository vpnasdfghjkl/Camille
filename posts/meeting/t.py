import heapq
from typing import List
class Solution:
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