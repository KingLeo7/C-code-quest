export type Question = {
  id: string; title: string; world: string; type: 'mcq'|'output'|'debug'|'coding';
  difficulty: string; prompt: string; code?: string; options?: string[];
  answer?: string; explanation: string; starter?: string; points: number;
  tests?: {input:string; expected:string}[];
}
export const questions: Question[] = [
 {id:'v1',title:'The Integer Gate',world:'Variable Village',type:'mcq',difficulty:'Beginner',prompt:'Which format specifier is used to print an int with printf?',options:['%c','%d','%f','%s'],answer:'%d',explanation:'%d prints a signed decimal integer.',points:10},
 {id:'v2',title:'Add the Gems',world:'Variable Village',type:'output',difficulty:'Beginner',prompt:'Predict the output of this program.',code:'#include <stdio.h>\nint main(void) {\n  int gems = 7;\n  printf(\"%d\", gems + 5);\n  return 0;\n}',answer:'12',explanation:'7 + 5 evaluates to 12.',points:15},
 {id:'l1',title:'The Broken Bridge',world:'Logic Mountains',type:'debug',difficulty:'Beginner',prompt:'The bridge condition should compare x with 10. Fix the bug.',code:'#include <stdio.h>\nint main(void) {\n  int x = 10;\n  if (x = 10) printf(\"OPEN\");\n  return 0;\n}',answer:'==',explanation:'Use == for comparison. A single = assigns a value.',points:20},
 {id:'l2',title:'Choose the Path',world:'Logic Mountains',type:'output',difficulty:'Beginner',prompt:'What does this program print?',code:'#include <stdio.h>\nint main(void) {\n  int n = 9;\n  if (n % 2 == 0) puts(\"EVEN\");\n  else puts(\"ODD\");\n  return 0;\n}',answer:'ODD',explanation:'9 is not divisible by 2, so the else branch runs.',points:15},
 {id:'f1',title:'Loop Lanterns',world:'Loop Forest',type:'output',difficulty:'Intermediate',prompt:'Predict the output. Include spaces if any.',code:'#include <stdio.h>\nint main(void) {\n  for (int i=1; i<=3; i++) printf(\"%d \", i);\n  return 0;\n}',answer:'1 2 3',explanation:'The loop prints 1, 2 and 3 in order.',points:20},
 {id:'a1',title:'Array Treasure',world:'Array Dungeon',type:'coding',difficulty:'Intermediate',prompt:'Read 5 integers and print their sum. Input contains exactly five integers separated by spaces.',starter:'#include <stdio.h>\nint main(void) {\n    int a[5], sum = 0;\n    // Read five integers and calculate their sum\n    return 0;\n}',explanation:'Use a loop with scanf to read each value and add it to sum.',points:40,tests:[{input:'1 2 3 4 5',expected:'15'},{input:'10 0 -2 7 5',expected:'20'}]},
 {id:'p1',title:'Pointer Portal',world:'Pointer Kingdom',type:'coding',difficulty:'Advanced',prompt:'Read an integer and print its square using a pointer to access the value.',starter:'#include <stdio.h>\nint main(void) {\n    int n;\n    // Read n, create a pointer to n, print its square\n    return 0;\n}',explanation:'Store the address of n in an int pointer and dereference it.',points:60,tests:[{input:'6',expected:'36'},{input:'-4',expected:'16'}]}
]
