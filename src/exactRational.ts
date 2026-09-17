export type ExactRational={n:bigint;d:bigint};

const abs=(value:bigint)=>value<0n?-value:value;
const gcd=(a:bigint,b:bigint)=>{let x=abs(a),y=abs(b);while(y!==0n){const r=x%y;x=y;y=r}return x||1n};
const reduce=(n:bigint,d:bigint):ExactRational|null=>{if(d===0n)return null;let numerator=n,denominator=d;if(denominator<0n){numerator=-numerator;denominator=-denominator}const divisor=gcd(numerator,denominator);return{n:numerator/divisor,d:denominator/divisor}};
const normalize=(input:string)=>input.normalize('NFKC').replace(/[−–—]/g,'-').replace(/\u00a0/g,' ').trim().replace(/,/g,'.').replace(/\s+/g,' ');

export function parseExactRational(input:string):ExactRational|null{
  const source=normalize(input);
  if(!source)return null;
  const mixed=source.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if(mixed){
    const wholeText=mixed[1];const denominator=BigInt(mixed[3]);if(denominator===0n)return null;
    const whole=BigInt(wholeText);const part=BigInt(mixed[2]);if(part>=denominator)return null;
    const negative=wholeText.startsWith('-');
    const magnitude=abs(whole)*denominator+part;
    return reduce(negative?-magnitude:magnitude,denominator);
  }
  const fraction=source.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if(fraction)return reduce(BigInt(fraction[1]),BigInt(fraction[2]));
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(source))return null;
  const sign=source.startsWith('-')?-1n:1n;
  const unsigned=source.replace(/^[+-]/,'');
  const[whole='',fractional='']=unsigned.split('.');
  const scale=10n**BigInt(fractional.length);
  const digits=`${whole||'0'}${fractional}`;
  return reduce(sign*BigInt(digits||'0'),scale);
}

export function exactRationalEquals(left:string,right:string){
  const a=parseExactRational(left),b=parseExactRational(right);
  return a!==null&&b!==null&&a.n===b.n&&a.d===b.d;
}
