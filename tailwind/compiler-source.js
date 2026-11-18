import { compile } from "tailwindcss";
import theme from "tailwindcss/theme.css";
import reset from "tailwindcss/preflight.css";

// 新しいクラスを書くたび、本物のコンパイラにその候補を渡す。
// 名前順に左右される競合も、配信時と同じ Tailwind の規則で決まる。
window.readingStyles = async function (candidates, customTheme = "") {
  const source = [theme, customTheme, `@layer reset {${reset}}`, "@tailwind utilities;"].join("\n");
  const compiler = await compile(source);
  return compiler.build([...new Set(candidates)]);
};
