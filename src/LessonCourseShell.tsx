import { LessonCourseShellV2 } from './LessonCourseShellV2';
import { LessonRewardOverlay } from './PythagorasEconomy';

export function LessonCourseShell(){
  return <>
    <LessonCourseShellV2/>
    <LessonRewardOverlay/>
  </>;
}
