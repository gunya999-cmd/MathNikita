const normalize=(input:string)=>input.normalize('NFKC').replace(/[−–—]/g,'-').trim().replace(/,/g,'.');

export function canonicalDecimal(input:string):string|null{
  let source=normalize(input);
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(source))return null;
  let sign='';
  if(source.startsWith('+')||source.startsWith('-')){sign=source.startsWith('-')?'-':'';source=source.slice(1)}
  let[whole='',fraction='']=source.split('.');
  whole=(whole||'0').replace(/^0+(?=\d)/,'');
  fraction=fraction.replace(/0+$/,'');
  if(whole==='0'&&!fraction)sign='';
  return `${sign}${whole}${fraction?`.${fraction}`:''}`;
}

export function exactDecimalEquals(left:string,right:string){
  const a=canonicalDecimal(left),b=canonicalDecimal(right);
  return a!==null&&b!==null&&a===b;
}
