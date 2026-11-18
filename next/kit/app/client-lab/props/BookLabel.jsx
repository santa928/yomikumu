"use client";

export default function BookLabel({ title, copies }) {
  return <section><h1>{title}</h1><p>所蔵 {copies} 冊</p></section>;
}
