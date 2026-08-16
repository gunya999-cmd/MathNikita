import {expect,test} from '@playwright/test';

test('lesson 45 diagonal formula examples are exact',()=>{for(const [n,expected] of [[5,5],[6,9],[7,14],[8,20],[9,27],[10,35],[11,44],[12,54]] as const)expect(n*(n-3)/2).toBe(expected)});
