export type AnswerComparisonMode='auto'|'scalar'|'sequence';

const russianPhysicalToLatin:Record<string,string>={
  'й':'q','ц':'w','у':'e','к':'r','е':'t','н':'y','г':'u','ш':'i','щ':'o','з':'p','х':'[','ъ':']',
  'ф':'a','ы':'s','в':'d','а':'f','п':'g','р':'h','о':'j','л':'k','д':'l','ж':';','э':"'",
  'я':'z','ч':'x','с':'c','м':'v','и':'b','т':'n','ь':'m','б':',','ю':'.',
};

const hebrewPhysicalToLatin:Record<string,string>={
  'ק':'e','ר':'r','א':'t','ט':'y','ו':'u','ן':'i','ם':'o','פ':'p',
  'ש':'a','ד':'s','ג':'d','כ':'f','ע':'g','י':'h','ח':'j','ל':'k','ך':'l','ף':';',
  'ז':'z','ס':'x','ב':'c','ה':'v','נ':'b','מ':'n','צ':'m','ת':',','ץ':'.',
};

const cyrillicLookalikes:Record<string,string>={
  'а':'a','в':'b','с':'c','е':'e','к':'k','м':'m','н':'h','о':'o','р':'p','т':'t','у':'y','х':'x',
};

const bidiControls=/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const commonCommas=/[\u060c\uff0c]/g;
const commonDashes=/[\u2010-\u2015\u2212]/g;

function base(value:string){
  return String(value??'')
    .normalize('NFKC')
    .replace(bidiControls,'')
    .replace(commonCommas,',')
    .replace(commonDashes,'-')
    .trim()
    .toLowerCase()
    .replace(/ё/g,'е')
    .replace(/\u00a0/g,' ');
}

function scalar(value:string){
  return base(value)
    .replace(/(\d)\.(\d)/g,'$1,$2')
    .replace(/;/g,',')
    .replace(/[\s]+/g,'');
}

function splitSequence(value:string){
  return base(value).split(/[\s,;|\\]+/).filter(Boolean);
}

function expectedLetterTokens(value:string){
  const tokens=splitSequence(value);
  return tokens.length>1&&tokens.every(token=>/^[a-z]$/i.test(token))?tokens:null;
}

function inputLetterTokens(value:string,expectedLength:number){
  const tokens=splitSequence(value);
  if(tokens.length===expectedLength&&tokens.every(token=>/^\p{L}$/u.test(token)))return tokens;
  if(tokens.length===1&&/^\p{L}+$/u.test(tokens[0])&&Array.from(tokens[0]).length===expectedLength)return Array.from(tokens[0]);
  return null;
}

function latinLetterMatches(input:string,expected:string){
  const actual=base(input);
  const wanted=base(expected);
  if(actual===wanted)return true;
  return russianPhysicalToLatin[actual]===wanted||hebrewPhysicalToLatin[actual]===wanted||cyrillicLookalikes[actual]===wanted;
}

function integerSequence(value:string){
  const tokens=splitSequence(value);
  if(tokens.length<2||!tokens.every(token=>/^[+-]?\d+$/.test(token)))return null;
  return tokens.map(Number);
}

function sameNumbers(a:number[]|null,b:number[]|null){
  return Boolean(a&&b&&a.length===b.length&&a.every((value,index)=>value===b[index]));
}

function measurement(value:string){
  const match=base(value).match(/^([+-]?\d+(?:[.,]\d+)?)\s*([a-zа-я]+)$/i);
  if(!match)return null;
  const number=Number(match[1].replace(',','.'));
  if(!Number.isFinite(number))return null;
  const unit=match[2];
  const unitAliases:Record<string,string>={мм:'mm',mm:'mm',vv:'mm',см:'cm',cm:'cm',cv:'cm'};
  return unitAliases[unit]?{number,unit:unitAliases[unit]}:null;
}

export function answersEquivalent(input:string,expected:string,mode:AnswerComparisonMode='auto'){
  if(!base(input))return false;

  const expectedLetters=expectedLetterTokens(expected);
  if(mode==='auto'&&expectedLetters){
    const actualLetters=inputLetterTokens(input,expectedLetters.length);
    return Boolean(actualLetters&&actualLetters.every((letter,index)=>latinLetterMatches(letter,expectedLetters[index])));
  }

  if(mode==='sequence'){
    const expectedNumbers=integerSequence(expected);
    if(expectedNumbers)return sameNumbers(integerSequence(input),expectedNumbers);
    if(expectedLetters){
      const actualLetters=inputLetterTokens(input,expectedLetters.length);
      return Boolean(actualLetters&&actualLetters.every((letter,index)=>latinLetterMatches(letter,expectedLetters[index])));
    }
    const actual=splitSequence(input).map(scalar);
    const wanted=splitSequence(expected).map(scalar);
    return actual.length===wanted.length&&actual.every((value,index)=>value===wanted[index]);
  }

  const actualMeasurement=measurement(input);
  const expectedMeasurement=measurement(expected);
  if(actualMeasurement&&expectedMeasurement){
    return actualMeasurement.number===expectedMeasurement.number&&actualMeasurement.unit===expectedMeasurement.unit;
  }

  return scalar(input)===scalar(expected);
}
