# Lesson 148 source notes

## Route

Lesson 148 continues §37 «Проценты. Нахождение процентов от числа» and is lesson 3 of 4 in this paragraph. Multiple 175-lesson Merzlyak KTPs agree on the lesson-148 route: №1072, №1074, №1076. Lesson 149 finishes §37; lesson 150 starts §38 «Нахождение числа по его процентам».

Route cross-checks:
- https://infourok.ru/ktp-merzlyak-ag-matematika-s-domashney-rabotoy-3679872.html
- https://infourok.ru/rabochaya-programma-klassa-po-matematike-merzlyak-3851104.html
- https://nsportal.ru/shkola/matematika/library/2019/02/17/rabochaya-programma-5-6-klass-k-uchebniku-a-g-merzlyak

## Exact textbook tasks

### №1072

«Илья Муромец, победив Соловья-разбойника, нашел в его логове 80 пудов золота и серебра. Золото составляло 45% сокровищ. Сколько пудов серебра нашел Илья Муромец?»

Answer: 44 пуда. Silver is 55% of the treasure; 80·0.55=44.

Verification: https://otvetkin.info/reshebniki/5-klass/matematika/merzlyak/nomer-1072

### №1074

«В магазин поступило 200 банок варенья. 24% этого количества составляли банки с клубничным вареньем, 32% — с малиновым, а остальное — с вишневым. Сколько банок вишневого варенья поступило в магазин?»

Answer: 88 банок. Strawberry and raspberry total 56%, so cherry is 44%; 200·0.44=88.

Verification: https://reshalka.com/uchebniki/5-klass/matematika/merzlyak/1074

### №1076

«В 2005 г. потребление яиц в Российской Федерации составляло 250 штук на душу населения. В 2008 г. потребление яиц на душу населения составило 101,6% по отношению к 2005 г. Каким было потребление яиц на душу населения в 2008 г.?»

Answer: 254 штуки. 101.6%=1.016; 250·1.016=254.

Verification: https://otvetkin.info/reshebniki/5-klass/matematika/merzlyak/nomer-1076

## Product contract

- 7 theory stages + 20 practice stages + summary = 28 stages.
- Exactly 50 checked responses.
- First three practice tasks preserve the verified textbook anchors №1072, №1074, №1076.
- Remaining practice reinforces complement to 100%, multiple percentage parts, direct percentage-of-number calculations, increases/decreases, fractional percentages and percentages above 100%.
- Lesson 148 deliberately does not introduce finding the whole from a known percentage; that belongs to §38.
- Main player uses string-based canonical decimal equality without floating tolerance.
- Mandatory completion practice uses `exact-decimal` validation.
- Progress persists under `mathnikita-lesson-148-progress-v1`.
- Chromium flow covers exact acceptance, near-wrong rejection and persistence.
- iPad/WebKit test covers multi-input layout and horizontal overflow.
