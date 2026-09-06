import type { ReactNode } from 'react';
import type { LessonOpeningData } from './LessonOpening';
import { lessonNinetyOneOpening } from './LessonNinetyOneOpening';
import { FractionConceptPlayer } from './FractionConceptPlayer';
import { lessonNinetyTwoOpening } from './LessonNinetyTwoOpening';
import { FractionOfNumberPlayer } from './FractionOfNumberPlayer';
import { lessonNinetyThreeOpening } from './LessonNinetyThreeOpening';
import { FractionWholeFromPartPlayer } from './FractionWholeFromPartPlayer';
import { lessonNinetyFourOpening } from './LessonNinetyFourOpening';
import { FractionCompositeProblemsPlayer } from './FractionCompositeProblemsPlayer';
import { lessonNinetyFiveOpening } from './LessonNinetyFiveOpening';
import { FractionSynthesisPlayer } from './FractionSynthesisPlayer';
import { lessonNinetySixOpening } from './LessonNinetySixOpening';
import { FractionComparisonFoundationsPlayer } from './FractionComparisonFoundationsPlayer';
import { lessonNinetySevenOpening } from './LessonNinetySevenOpening';
import { FractionComparisonOrderingPlayer } from './FractionComparisonOrderingPlayer';
import { lessonNinetyEightOpening } from './LessonNinetyEightOpening';
import { FractionComparisonSynthesisPlayer } from './FractionComparisonSynthesisPlayer';
import { lessonNinetyNineOpening } from './LessonNinetyNineOpening';
import { SameDenominatorFractionOperationsPlayer } from './SameDenominatorFractionOperationsPlayer';
import { lessonOneHundredOpening } from './LessonOneHundredOpening';
import { SameDenominatorFractionSynthesisPlayer } from './SameDenominatorFractionSynthesisPlayer';
import { lessonOneHundredOneOpening } from './LessonOneHundredOneOpening';
import { FractionDivisionConnectionPlayer } from './FractionDivisionConnectionPlayer';
import { lessonOneHundredTwoOpening } from './LessonOneHundredTwoOpening';
import { MixedNumberFoundationsPlayer } from './MixedNumberFoundationsPlayer';
import { lessonOneHundredThreeOpening } from './LessonOneHundredThreeOpening';
import { MixedNumberOperationsPlayer } from './MixedNumberOperationsPlayer';
import { lessonOneHundredFourOpening } from './LessonOneHundredFourOpening';
import { MixedNumberPracticePlayer } from './MixedNumberPracticePlayer';

export const LATEST_READY_LESSON=104;

const lateOpenings:Record<number,LessonOpeningData>={
  91:lessonNinetyOneOpening,
  92:lessonNinetyTwoOpening,
  93:lessonNinetyThreeOpening,
  94:lessonNinetyFourOpening,
  95:lessonNinetyFiveOpening,
  96:lessonNinetySixOpening,
  97:lessonNinetySevenOpening,
  98:lessonNinetyEightOpening,
  99:lessonNinetyNineOpening,
  100:lessonOneHundredOpening,
  101:lessonOneHundredOneOpening,
  102:lessonOneHundredTwoOpening,
  103:lessonOneHundredThreeOpening,
  104:lessonOneHundredFourOpening,
};

export function lateOpeningForLesson(lessonNumber:number):LessonOpeningData|null{return lateOpenings[lessonNumber]??null}

export function lateRuntimeForLesson(lessonNumber:number):ReactNode|null{
  switch(lessonNumber){
    case 104:return <MixedNumberPracticePlayer key="lesson-104"/>;
    case 103:return <MixedNumberOperationsPlayer key="lesson-103"/>;
    case 102:return <MixedNumberFoundationsPlayer key="lesson-102"/>;
    case 101:return <FractionDivisionConnectionPlayer key="lesson-101"/>;
    case 100:return <SameDenominatorFractionSynthesisPlayer key="lesson-100"/>;
    case 99:return <SameDenominatorFractionOperationsPlayer key="lesson-99"/>;
    case 98:return <FractionComparisonSynthesisPlayer key="lesson-98"/>;
    case 97:return <FractionComparisonOrderingPlayer key="lesson-97"/>;
    case 96:return <FractionComparisonFoundationsPlayer key="lesson-96"/>;
    case 95:return <FractionSynthesisPlayer key="lesson-95"/>;
    case 94:return <FractionCompositeProblemsPlayer key="lesson-94"/>;
    case 93:return <FractionWholeFromPartPlayer key="lesson-93"/>;
    case 92:return <FractionOfNumberPlayer key="lesson-92"/>;
    case 91:return <FractionConceptPlayer key="lesson-91"/>;
    default:return null;
  }
}
