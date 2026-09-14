# Lesson 144 certification contract

Production certification requires:

1. source/workload tests green;
2. strict exact-decimal regression green;
3. Chromium flow green;
4. iPad/WebKit layout green;
5. catalog count: 175 total, 136 interactive, 144 enabled, 8 control-ready;
6. lesson 145 disabled;
7. PR review threads resolved;
8. squash merge at the exact tested head SHA;
9. Cloudflare production build success for the resulting merge SHA;
10. `/api/version` reports that exact merge SHA.
