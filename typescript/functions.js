"use strict";
tsChapters.push({
  title:"関数に渡す値と、返す値に型を付ける",
  intro:"関数に何を渡せて何が返るかを、型で表します。見本の award は点数と計算方法を受け取ります。計算方法は、別の関数として渡します。3 点をそのまま返す場合と、2 倍にする場合を比べましょう。",
  demo:["3点をそのまま返す","3点を2倍にする"],
  code:n=>'function award(value: number, rule: (n: number) => number): number {\n  return rule(value);\n}\nconsole.log(award(3, n => '+(n?'n * 2':'n')+'));'
});
tsLessons.push({
  id:"signature",chapter:2,title:"引数と戻り値の型を書く",
  why:"add は数値を受け取り、加点した結果を数値で返します。括弧の中の : number は入力の注釈、閉じ括弧の後ろの : number は戻り値の注釈です。",
  before:"function add(n:number):number { return n + 1; }\nconsole.log(add(2));",after:"function add(n:number):number { return n + 2; }\nconsole.log(add(2));",change:"足す点数を2点に変える",
  question:["戻り値が number の関数の結果を使える場所は？",["文字列型の変数に代入する","配列として要素を取り出す","ほかの点数と足し算する","真偽値型の変数に代入する"],2,"数を返すのでほかの数と足せます。"],
  prompt:"bonus(n) が受け取った点数に3点を足し、数として返すようにします。0点と5点でも確かめます。",
  template:"function bonus(n: §): § {\n  return n + §;\n}",slots:[["入力の型","number","string"],["返す型","number","string"],["追加点","3",'"3"',"1"]],
  starter:"function bonus(n:number):number {\n  return n;\n}",contract:"const __score:(n:number)=>number = bonus;",contractHint:"数を受け数を返す bonus を用意します。",
  probes:[trial("bonus(0)",3,"0点から3点になるようにします。"),trial("bonus(5)",8,"最初の点に3点を足して返しましょう。")]
},{
  id:"callback",chapter:2,title:"別の関数を引数として渡す（コールバック）",
  why:"apply の第2引数を変えると、同じ 3 点でも加点の方法を変えられます。(n: number) => number は「数を受けて数を返す関数」の型です。渡された関数は rule(n) のようにその場で呼びます。",
  before:"function apply(n:number,rule:(v:number)=>number) {return rule(n);}\nconsole.log(apply(3,v=>v+1));",
  after:"function apply(n:number,rule:(v:number)=>number) {return rule(n);}\nconsole.log(apply(3,v=>v*2));",change:"渡す規則だけを2倍に変える",
  question:["関数 rule を呼び出し、4 点を渡す式は？",["rule + 4","4.rule","rule","rule(4)"],3,"関数名の後ろの括弧に点を入れて呼びます。"],
  prompt:"judge(points, rule) を作ります。points は元の点数、rule は点数を受け取って計算結果を返す関数です。例のように、足し算の関数を渡しても、掛け算の関数を渡しても、その関数で計算した結果を返してください。",
  template:"function judge(points:number, rule: §): number {\n  return §;\n}",slots:[["規則の型","(n:number)=>number","number"],["規則を使う式","rule(points)","points+1","points"]],
  starter:"function judge(points:number, rule:(n:number)=>number):number {\n  return points;\n}",contract:"const __judge:(n:number,f:(v:number)=>number)=>number=judge;",contractHint:"judge が点と採点関数を受け、数を返すようにします。",
  probes:[trial("judge(2,n=>n+3)",5,"渡した足し算の規則を呼びます。"),trial("judge(4,n=>n*2)",8,"異なる規則に差し替えても同じ関数を使います。"),trial("judge(0,n=>n+7)",7,"0点にも渡された規則を適用します。")]
},{
  id:"generic",chapter:2,title:"渡した値と同じ型を保って返す（ジェネリクス）",
  why:"題名なら文字、配点なら数を、元の型のまま次へ渡します。関数名の後ろの <T> は、呼ぶときに決まる型を一つ名付ける印です。引数と戻り値の型をどちらも T にすると、文字列を渡せば文字列、数値を渡せば数値が返ることを表せます。",
  before:'function keep<T>(v:T):T {return v;}\nconsole.log(keep("星"));',after:'function keep<T>(v:T):T {return v;}\nconsole.log(keep(7));',change:"渡す値を数に変える",
  question:["keep(7) の結果に残る型の種類は？",["配列","数","文字だけ","必ず不明"],1,"渡した値の型を戻り値にも使うので、7 を渡すと数値が返ります。"],
  prompt:"carry は文字・数など渡した値をそのまま返し、呼び出した側で元の型を保ちます。同じ関数を題名と点数に使います。",
  template:"function carry§(value: §): § {\n  return value;\n}",slots:[["型の名前を用意","<T>","<number>"],["入力の型","T","unknown"],["返す型","T","unknown"]],
  starter:"function carry(value:unknown):unknown { return value; }",contract:'const __carry:<T>(v:T)=>T=carry; const __name:string=carry("水"); const __n:number=carry(3);',contractHint:"同じ型が入出力に結び付くようにします。文字と数の両方が元の型で返ることを検査します。",
  probes:[trial('carry("風")',"風","題名は元の文字のまま返します。"),trial("carry(7)",7,"数を文字に変えずに返します。")]
},{
  id:"readonly",chapter:2,title:"読み取り専用の配列を変えずに、新しい配列を作る",
  why:"受け取った配列を残したまま、末尾に要素を一つ加えた配列を返します。readonly T[] は読むだけの配列、[...items, item] は元の各要素をコピーして最後に一件足した新しい配列です。",
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
