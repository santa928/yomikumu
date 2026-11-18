"use strict";
tsChapters.push({
  title:"入力と出力の型が伝わる採点関数",
  intro:"問題の日替わり配点を、同じ採点係に渡します。普通の日と特集の日の結果を比べましょう。",
  demo:["通常の配点を試す","特集の配点を試す"],
  code:n=>'function award(value: number, rule: (n: number) => number): number {\n  return rule(value);\n}\nconsole.log(award(3, n => '+(n?'n * 2':'n')+'));'
});
tsLessons.push({
  id:"signature",chapter:2,title:"関数に渡す数と返す数を書く",
  why:"別の人が採点結果を足し算に使うとき、戻るものが数だと分かると安心です。括弧の中の : number は入力の注釈、閉じ括弧の後ろの : number は戻り値の注釈です。",
  before:"function add(n:number):number { return n + 1; }\nconsole.log(add(2));",after:"function add(n:number):number { return n + 2; }\nconsole.log(add(2));",change:"追加の配点を2に変える",
  question:["戻り値が number の関数の結果を使える場所は？",["文字だけを受ける題名欄","配列の並び","点数に足す数","真偽だけを入れる札"],2,"数を返すのでほかの数と足せます。"],
  prompt:"bonus(n) が受け取った点数に3点を足し、数として返すようにします。0点と5点でも確かめます。",
  template:"function bonus(n: §): § {\n  return n + §;\n}",slots:[["入力の型","number","string"],["返す型","number","string"],["追加点","3",'"3"',"1"]],
  starter:"function bonus(n:number):number {\n  return n;\n}",contract:"const __score:(n:number)=>number = bonus;",contractHint:"数を受け数を返す bonus を用意します。",
  probes:[trial("bonus(0)",3,"0点から3点になるようにします。"),trial("bonus(5)",8,"最初の点に3点を足して返しましょう。")]
},{
  id:"callback",chapter:2,title:"採点の規則を引数として渡す",
  why:"毎日変わる加点規則だけを差し替えます。(n: number) => number は「数を受けて数を返す関数」の型です。渡された関数は rule(n) のようにその場で呼びます。",
  before:"function apply(n:number,rule:(v:number)=>number) {return rule(n);}\nconsole.log(apply(3,v=>v+1));",
  after:"function apply(n:number,rule:(v:number)=>number) {return rule(n);}\nconsole.log(apply(3,v=>v*2));",change:"渡す規則だけを2倍に変える",
  question:["rule は関数。受け取った4点に与えられた規則を使う式は？",["rule + 4","4.rule","rule","rule(4)"],3,"関数名の後ろの括弧に点を入れて呼びます。"],
  prompt:"judge(points,rule) は数と規則を受け、その規則を入力の点に適用します。足し算・掛け算どちらの規則も受けられるようにします。",
  template:"function judge(points:number, rule: §): number {\n  return §;\n}",slots:[["規則の型","(n:number)=>number","number"],["規則を使う式","rule(points)","points+1","points"]],
  starter:"function judge(points:number, rule:(n:number)=>number):number {\n  return points;\n}",contract:"const __judge:(n:number,f:(v:number)=>number)=>number=judge;",contractHint:"judge が点と採点関数を受け、数を返すようにします。",
  probes:[trial("judge(2,n=>n+3)",5,"渡した足し算の規則を呼びます。"),trial("judge(4,n=>n*2)",8,"異なる規則に差し替えても同じ関数を使います。"),trial("judge(0,n=>n+7)",7,"0点にも渡された規則を適用します。")]
},{
  id:"generic",chapter:2,title:"渡した値と同じ型を返す",
  why:"題名なら文字、配点なら数を、元の型のまま次へ渡します。関数名の後ろの <T> は、呼ぶときに決まる型を一つ名付ける印です。入力と戻り値の両方に T を書くと対応が残ります。",
  before:'function keep<T>(v:T):T {return v;}\nconsole.log(keep("星"));',after:'function keep<T>(v:T):T {return v;}\nconsole.log(keep(7));',change:"渡す値を数に変える",
  question:["keep(7) の結果に残る型の種類は？",["配列","数","文字だけ","必ず不明"],1,"呼び出すときの数の型が T に入り、戻り値にも届きます。"],
  prompt:"carry は文字・数など渡した値をそのまま返し、呼び出した側で元の型を保ちます。同じ関数を題名と点数に使います。",
  template:"function carry§(value: §): § {\n  return value;\n}",slots:[["型の名前を用意","<T>","<number>"],["入力の型","T","unknown"],["返す型","T","unknown"]],
  starter:"function carry(value:unknown):unknown { return value; }",contract:'const __carry:<T>(v:T)=>T=carry; const __name:string=carry("水"); const __n:number=carry(3);',contractHint:"同じ型が入出力に結び付くようにします。文字と数の両方が元の型で返ることを検査します。",
  probes:[trial('carry("風")',"風","題名は元の文字のまま返します。"),trial("carry(7)",7,"数を文字に変えずに返します。")]
},{
  id:"readonly",chapter:2,title:"元の問題を残して新版を返す",
  why:"配布済みの一覧を変えず、新しい問題を末尾に加えます。readonly T[] は読むだけの配列、[...items, item] は元の各要素をコピーして最後に一件足した新しい配列です。",
  before:'function newer<T>(items:readonly T[],item:T):T[] {return [...items,item];}\nconsole.log(newer(["谷"],"森"));',
  after:'function newer<T>(items:readonly T[],item:T):T[] {return [...items,item];}\nconsole.log(newer([2],5));',change:"文字の一覧を配点の一覧に変える",
  question:["readonly の入力を保って一件増やす式は？",["items.push(item)","items.pop()","[...items, item]","items = item"],2,"新しい配列の中で展開すると、元の配列を編集せずに済みます。"],
  prompt:"append(items,item) は読み取り専用の題名または点数の一覧を受け、新しい一覧の末尾に一件追加します。空の一覧にも使え、元の要素・件数を保ちます。",
  template:"function append<T>(items: §,item:T): § {\n  return §;\n}",slots:[["入力の配列","readonly T[]","T[]"],["返す配列","T[]","T"],["元を残す追加","[...items,item]","[item]","[item,...items]"]],
  starter:"function append<T>(items:readonly T[],item:T):T[] {\n  return [item];\n}",
  contract:'const __append:<T>(xs:readonly T[],v:T)=>T[]=append; const __labels:string[]=append(["雲"],"星"); const __points:number[]=append([2],5);',
  contractHint:"readonly の一覧を受け、文字なら文字の配列、数なら数の配列を返します。",
  probes:[trial('append([],"海")',["海"],"空の一覧の末尾にも一件を加えます。"),
    trial('append(["庭","月"],"森")',["庭","月","森"],"元の題名を順にコピーして末尾に森を加えます。"),
    trial('(()=>{const xs=[2,5];const out=append(xs,7);return [xs,out,xs!==out]})()',[[2,5],[2,5,7],true],"元の配点を保ち、別の配列を返します。")]
});
