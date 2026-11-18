"use strict";
const {verifyDom} = require("./dom-check.cjs");
const assert=require("node:assert/strict");
const pair='const Card=p=><article><h2>{p.title}</h2><p>{p.children}</p></article>;\n';
verifyDom("components",[
 [null,'const App = () => React.createElement("h2",null,"雨の小道");'],
 [null,'const Tile=()=><article><h2>紙の星</h2></article>;const App=()=><Tile/>;'],
 [null,'const Heading=({title})=><h2>{title}</h2>;const App=()=><Heading title="月面"/>;'],
 [null,pair+'const App=()=><><Card title="朝の砂浜"/><Card title="坂の灯り"/></>;'],
 [null,pair+'const App=()=><><Card title="朝の砂浜">海辺の写真</Card><Card title="坂の灯り">夜の版画</Card></>;'],
 [null,'// @file WorkCard.jsx\nexport default p=><article><h2>{p.title}</h2><p>{p.children}</p></article>;\n// @file App.jsx\nimport Tile from "./WorkCard";\nexport default function Gallery(){return <main>{[["水面の月","鉛筆の習作"],["冬の庭","小さな水彩"]].map(([name,note])=><Tile key={name} title={name}>{note}</Tile>)}</main>}'],
],async frame=>{
 await frame.getByRole("heading",{name:"朝の砂浜"}).waitFor();
 await frame.getByRole("button").click();
 assert.equal(await frame.getByRole("heading").textContent(),"坂の灯り");
},"react").catch(e=>{console.error(e);process.exitCode=1;});
