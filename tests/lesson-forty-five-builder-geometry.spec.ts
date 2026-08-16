import {expect,test} from '@playwright/test';

test('lesson 45 builder geometry has a simple perimeter order and a crossing counterexample',()=>{const p={A:[105,225],B:[85,75],C:[320,42],D:[570,110],E:[505,240]} as const;const o=(a:readonly number[],b:readonly number[],c:readonly number[])=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const cross=(a:readonly number[],b:readonly number[],c:readonly number[],d:readonly number[])=>o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;expect(cross(p.A,p.C,p.B,p.D)).toBeTruthy();expect(cross(p.A,p.B,p.C,p.D)).toBeFalsy()});
