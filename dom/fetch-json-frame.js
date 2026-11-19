"use strict";

// 練習用フレームの外側で、この単元が配信する固定ファイルだけを取得する。
const readingFiles = new Set(["data/reading.json", "data/empty.json", "data/other.json", "data/missing.json"]);
const readingFrames = new WeakMap();
const readingRequests = new Map();

function requestReadingFile(path) {
  if (!readingRequests.has(path)) {
    const pending = window.fetch(new URL(path, location.href), {
      cache: "no-store", credentials: "omit", mode: "same-origin", redirect: "error", referrerPolicy: "no-referrer",
    }).then(async response => ({
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: await response.text() || null,
    })).catch(() => { throw TypeError("教材のサーバーに接続できません。"); })
      .finally(() => readingRequests.delete(path));
    readingRequests.set(path, pending);
  }
  return readingRequests.get(path);
}

addEventListener("message", async event => {
  const frame = readingFrames.get(event.source);
  const request = event.data;
  if (!frame?.isConnected || request?.type !== "yomikumu-reading-request"
      || !Number.isSafeInteger(request.id) || !readingFiles.has(request.path)) return;

  let reply;
  try {
    if (location.protocol === "file:") throw Error("この単元はHTTPで開いてください。");
    reply = await requestReadingFile(request.path);
  } catch (error) {
    reply = { error: error.message };
  }
  if (frame.isConnected)
    event.source.postMessage({ type: "yomikumu-reading-response", id: request.id, reply }, "*");
});

function readingExerciseFetch(paths) {
  const files = new Set(paths);
  const waiting = new Map();
  let ready;
  const connected = new Promise(resolve => { ready = resolve; });
  let id = 0;

  addEventListener("message", event => {
    if (event.source !== parent) return;
    if (event.data?.type === "yomikumu-reading-ready") ready();
    if (event.data?.type !== "yomikumu-reading-response") return;
    const finish = waiting.get(event.data.id);
    if (finish) {
      waiting.delete(event.data.id);
      finish(event.data.reply);
    }
  });

  return async function fetch(path) {
    if (!files.has(path)) throw TypeError("この教材にあるデータのファイル名を選んでください。");
    await connected;
    const requestId = ++id;
    const reply = await new Promise(resolve => {
      waiting.set(requestId, resolve);
      parent.postMessage({ type: "yomikumu-reading-request", id: requestId, path }, "*");
    });
    if (reply.error) throw TypeError(reply.error);
    const headers = reply.contentType ? { "Content-Type": reply.contentType } : {};
    return new Response(reply.body, { status: reply.status, headers });
  };
}

function readingFrame(title, html, source, tests, setup) {
  const fetchSetup = "const fetch = (" + readingExerciseFetch.toString() + ")(" +
    JSON.stringify([...readingFiles]) + ");\n";
  const frame = domFrame(title, html, source, tests, fetchSetup + setup);
  frame.addEventListener("load", () => {
    readingFrames.set(frame.contentWindow, frame);
    frame.contentWindow.postMessage({ type: "yomikumu-reading-ready" }, "*");
  }, { once: true });
  return frame;
}
