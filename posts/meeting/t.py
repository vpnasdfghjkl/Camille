class Solution(object):
    def spiralOrder(self, matrix):
        """
        :type matrix: List[List[int]]
        :rtype: List[int]
        """
        ret = []
        def bound_loop(matrix, start_r, start_l, end_r, end_l):
            the_loop_rec = []
            if start_r == end_r:
                for i in range(start_l, end_l + 1):
                    the_loop_rec.append(matrix[start_r][i])
                return the_loop_rec

            if start_l == end_l:
                for i in range(start_r, end_r + 1):
                    the_loop_rec.append(matrix[i][start_l])
                return the_loop_rec

            for j in range(start_l, end_l):
                the_loop_rec.append(matrix[start_r][j])

            for i in range(start_r, end_r):
                the_loop_rec.append(matrix[i][end_l])
            for k in range(end_l, start_l, -1):
                the_loop_rec.append(matrix[end_r][k])
            for l in range(end_r, start_r, -1):
                the_loop_rec.append(matrix[l][start_l])
            return the_loop_rec

        import math
        num_loop = math.ceil(min(len(matrix[0]), len(matrix)) / 2)
        
        for i in range(int(num_loop)):
            this_loop_rec = bound_loop(matrix, i, i, len(matrix) - i - 1, len(matrix[0]) -i - 1)
            ret.extend(this_loop_rec)
        
        return ret
    
matrix = [[1,2,3],[4,5,6],[7,8,9]]
s = Solution()
# s.spiralOrder(matrix)
print(s.spiralOrder(matrix))