from typing import List
class Solution:
    def singleNonDuplicate(self, nums: List[int]) -> int:
        i, j = 0, len(nums) - 1
        while i <= j:
            # if i == j :
            #     return nums[i]
            mid_idx = (i + j) // 2
            mid_v = nums[mid_idx]
            right_v, left_v = None, None
            if mid_idx + 1 < len(nums):
                right_v = nums[mid_idx + 1]
            if mid_idx - 1 >= 0:
                left_v = nums[mid_idx - 1]
            if right_v == None or left_v == None:
                return mid_v
            else:
                if mid_v == right_v:
                    if (j +  1 - mid_idx) % 2 == 0:
                        j = mid_idx - 1
                    else:
                        i = mid_idx
                elif mid_v == left_v:
                    if (j - mid_idx) % 2 == 0:
                        j = mid_idx
                    else:
                        i = mid_idx + 1
                else:
                    return mid_v
                
s = Solution()
print(s.singleNonDuplicate([0,1,1]))