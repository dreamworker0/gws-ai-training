/* 검색 · 관계도 · 관련 항목 추천
   ------------------------------------------------------------------
   app.js 가 쓰는 보조 기능입니다. 데이터는 data.js 에서만 옵니다.

   · buildIndex()  — 항목·슬라이드·영상·문서·강의 정리를 한 색인으로
   · search(q)     — 갈래별로 묶어 돌려줍니다
   · relatedItems()— 태그가 겹치는 항목 (많이 겹칠수록 위로)
   · graphSVG()    — 태그와 항목을 잇는 관계도 (외부 라이브러리 없음)
   ================================================================== */

var Find = (function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ""); }

  /* ── 색인 ─────────────────────────────────────── */
  var INDEX = [];

  function push(kind, label, sub, hash, text) {
    INDEX.push({ kind: kind, label: label, sub: sub, hash: hash, hay: norm(label + " " + sub + " " + (text || "")) });
  }

  function buildIndex() {
    if (INDEX.length) return INDEX;

    CURRICULUM.forEach(function (it) {
      var body = it.blurb + " " + (it.tags || []).join(" ");
      (it.lesson || []).forEach(function (l) {
        body += " " + l.h + " " + l.p + " " + (l.after || "") + " " + (l.said || "");
      });
      (it.notes || []).forEach(function (n) { body += " " + n; });
      push("항목", it.title, it.track + it.no + " · " + (it.tags || []).join(" · "), "#" + it.id, body);

      (it.videos || []).forEach(function (v) {
        push("영상", v.t, it.title, "#" + it.id, it.title);
      });
      (it.docs || []).forEach(function (d) {
        push("문서", d.t, it.title, "#" + it.id, it.title);
      });
    });

    /* 슬라이드 — 제목이 붙은 것만 (그림뿐인 쪽은 찾을 말이 없습니다) */
    Object.keys(SLIDE_TITLES).forEach(function (ref) {
      var p = ref.split(":");
      var deck = DECKS.filter(function (d) { return d.id === p[0]; })[0];
      push("자료", SLIDE_TITLES[ref], (deck ? deck.title : p[0]) + " " + p[1] + "쪽",
           "#slide-" + p[0] + "-" + p[1], "");
    });

    return INDEX;
  }

  function search(q) {
    var k = norm(q);
    if (k.length < 1) return [];
    buildIndex();
    var hit = [];
    for (var i = 0; i < INDEX.length; i++) {
      var e = INDEX[i];
      var at = e.hay.indexOf(k);
      if (at < 0) continue;
      /* 제목 앞쪽에 걸린 것을 위로 */
      hit.push({ e: e, score: (norm(e.label).indexOf(k) === 0 ? 0 : 1) * 1000 + at });
    }
    hit.sort(function (a, b) { return a.score - b.score; });
    return hit.slice(0, 40).map(function (h) { return h.e; });
  }

  /* ── 관련 항목 ────────────────────────────────── */
  function relatedItems(it, n) {
    var mine = it.tags || [];
    if (!mine.length) return [];
    return CURRICULUM
      .filter(function (o) { return o.id !== it.id; })
      .map(function (o) {
        var shared = (o.tags || []).filter(function (t) { return mine.indexOf(t) > -1; });
        return { it: o, shared: shared };
      })
      .filter(function (r) { return r.shared.length > 0; })
      .sort(function (a, b) { return b.shared.length - a.shared.length; })
      .slice(0, n || 4);
  }

  /* ── 관계도 ───────────────────────────────────── */
  /* 자주 쓰인 태그를 원 위에 놓고, 항목을 제 태그들의 가운데로 당깁니다.
     힘 계산을 몇 번만 돌려 서로 겹치지 않게 밀어냅니다. */
  function graphSVG(minUse) {
    minUse = minUse || 2;
    var W = 900, H = 640, CX = W / 2, CY = H / 2;

    var use = {};
    CURRICULUM.forEach(function (it) {
      (it.tags || []).forEach(function (t) { use[t] = (use[t] || 0) + 1; });
    });
    var tags = Object.keys(use).filter(function (t) { return use[t] >= minUse; })
                     .sort(function (a, b) { return use[b] - use[a]; });

    var nodes = [], edges = [];
    var R = 262;
    tags.forEach(function (t, i) {
      var a = (i / tags.length) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ id: "t:" + t, kind: "tag", label: t, n: use[t],
                   x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R, fixed: true });
    });

    CURRICULUM.forEach(function (it) {
      var mine = (it.tags || []).filter(function (t) { return tags.indexOf(t) > -1; });
      if (!mine.length) return;
      var sx = 0, sy = 0;
      mine.forEach(function (t) {
        var tn = nodes.filter(function (v) { return v.id === "t:" + t; })[0];
        sx += tn.x; sy += tn.y;
      });
      var node = { id: it.id, kind: "item", label: it.track + it.no, title: it.title,
                   track: it.track, x: sx / mine.length, y: sy / mine.length, fixed: false };
      nodes.push(node);
      mine.forEach(function (t) { edges.push([it.id, "t:" + t]); });
    });

    /* 겹침 풀기 */
    var items = nodes.filter(function (v) { return !v.fixed; });
    for (var pass = 0; pass < 260; pass++) {
      for (var i = 0; i < items.length; i++) {
        for (var j = i + 1; j < items.length; j++) {
          var A = items[i], B = items[j];
          var dx = B.x - A.x, dy = B.y - A.y;
          var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          var want = 52;
          if (d < want) {
            var push2 = (want - d) / 2 / d;
            A.x -= dx * push2; A.y -= dy * push2;
            B.x += dx * push2; B.y += dy * push2;
          }
        }
        /* 화면 밖으로 나가지 않게 */
        items[i].x = Math.max(60, Math.min(W - 60, items[i].x));
        items[i].y = Math.max(46, Math.min(H - 46, items[i].y));
      }
    }

    var byId = {};
    nodes.forEach(function (v) { byId[v.id] = v; });

    var h = '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" class="graph" ' +
            'role="img" aria-label="주제 관계도">';
    edges.forEach(function (e) {
      var A = byId[e[0]], B = byId[e[1]];
      h += '<line x1="' + A.x.toFixed(1) + '" y1="' + A.y.toFixed(1) +
           '" x2="' + B.x.toFixed(1) + '" y2="' + B.y.toFixed(1) + '" class="ge"/>';
    });
    nodes.forEach(function (v) {
      if (v.kind === "tag") {
        h += '<g class="gt"><circle cx="' + v.x.toFixed(1) + '" cy="' + v.y.toFixed(1) +
             '" r="' + (13 + Math.min(v.n, 8)) + '"/>' +
             '<text x="' + v.x.toFixed(1) + '" y="' + (v.y + 4).toFixed(1) + '">' + esc(v.label) + "</text></g>";
      } else {
        h += '<a href="#' + v.id + '" class="gn t' + v.track + '">' +
             '<circle cx="' + v.x.toFixed(1) + '" cy="' + v.y.toFixed(1) + '" r="17"/>' +
             '<text x="' + v.x.toFixed(1) + '" y="' + (v.y + 4).toFixed(1) + '">' + esc(v.label) + "</text>" +
             "<title>" + esc(v.title) + "</title></a>";
      }
    });
    h += "</svg>";
    return h;
  }

  return { buildIndex: buildIndex, search: search, relatedItems: relatedItems, graphSVG: graphSVG };
})();
