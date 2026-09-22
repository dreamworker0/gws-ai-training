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

  var GROUP_OF = {};
  (typeof GROUPS !== "undefined" ? GROUPS : []).forEach(function (g) {
    g.items.forEach(function (id) { GROUP_OF[id] = g; });
  });

  function buildIndex() {
    if (INDEX.length) return INDEX;

    CURRICULUM.forEach(function (it) {
      var body = it.blurb + " " + (it.tags || []).join(" ");
      (it.lesson || []).forEach(function (l) {
        body += " " + l.h + " " + l.p + " " + (l.after || "") + " " + (l.said || "");
      });
      (it.notes || []).forEach(function (n) { body += " " + n; });
      var g = GROUP_OF[it.id];
      push("항목", it.title,
           (g ? g.title + " · " : "") + (it.tags || []).join(" · "),
           "#" + it.id, body + " " + (g ? g.title : ""));

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

  /* ── 관계도 ───────────────────────────────────────
     A6·B7 같은 기호는 아무도 못 알아봅니다. 그래서 **이름을 그대로** 씁니다.
     글자 길이만큼 넓어지는 알약 모양이라, 겹침도 네모끼리 밀어내 풉니다. */

  /* 한글은 넓고 영문·숫자는 좁습니다. 대략의 글자 폭을 잽니다. */
  function textW(s, size) {
    var w = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      w += (c > 0x2000) ? size : (c === 32 ? size * 0.3 : size * 0.55);
    }
    return w;
  }

  function graphSVG(minUse) {
    minUse = minUse || 2;
    var W = 1060, H = 940, CX = W / 2, CY = H / 2;
    var FS_T = 13, FS_I = 13;

    var use = {};
    CURRICULUM.forEach(function (it) {
      (it.tags || []).forEach(function (t) { use[t] = (use[t] || 0) + 1; });
    });
    var tags = Object.keys(use).filter(function (t) { return use[t] >= minUse; })
                     .sort(function (a, b) { return use[b] - use[a]; });

    var nodes = [], edges = [];
    var RX = 398, RY = 330;

    tags.forEach(function (t, i) {
      var a = (i / tags.length) * Math.PI * 2 - Math.PI / 2;
      var w = textW(t, FS_T) + 26;
      var tx = CX + Math.cos(a) * RX, ty = CY + Math.sin(a) * RY;
      /* 태그를 못 박아 두면 태그와 겹친 항목이 빠져나갈 길이 없습니다.
         움직이게 두되 아래에서 제자리(ax, ay)로 당겨 고리 모양은 지킵니다. */
      nodes.push({ id: "t:" + t, kind: "tag", label: t, n: use[t],
                   w: w, h: 30, fixed: false, anchor: true,
                   ax: tx, ay: ty, x: tx, y: ty });
    });

    CURRICULUM.forEach(function (it) {
      var mine = (it.tags || []).filter(function (t) { return tags.indexOf(t) > -1; });
      if (!mine.length) return;
      var sx = 0, sy = 0;
      mine.forEach(function (t) {
        var tn = nodes.filter(function (v) { return v.id === "t:" + t; })[0];
        sx += tn.x; sy += tn.y;
      });
      var label = it.short || it.title;
      nodes.push({ id: it.id, kind: "item", label: label, title: it.title,
                   group: (GROUP_OF[it.id] || {}).id || "x",
                   w: textW(label, FS_I) + 24, h: 30, fixed: false,
                   cx0: sx / mine.length, cy0: sy / mine.length });
      mine.forEach(function (t) { edges.push([it.id, "t:" + t]); });
    });

    /* 같은 태그를 쓰는 항목들은 중심점이 거의 같습니다. 그대로 두면 한 점에 겹쳐
       시작해서 밀어내기로도 잘 안 풀립니다. 같은 자리에 몇이 몰렸는지 세어
       원을 그리며 부채꼴로 펼쳐 놓습니다. 순서는 id 라 언제나 같은 그림이 나옵니다. */
    var bucket = {};
    nodes.forEach(function (v) {
      if (v.cx0 === undefined) return;
      var k = Math.round(v.cx0 / 40) + "," + Math.round(v.cy0 / 40);
      (bucket[k] = bucket[k] || []).push(v);
    });
    Object.keys(bucket).forEach(function (k) {
      var g = bucket[k].sort(function (a, b) { return a.id < b.id ? -1 : 1; });
      if (g.length === 1) { g[0].x = g[0].cx0; g[0].y = g[0].cy0; return; }
      var R = 26 + g.length * 9;
      g.forEach(function (v, i) {
        var a = (i / g.length) * Math.PI * 2;
        v.x = v.cx0 + Math.cos(a) * R;
        v.y = v.cy0 + Math.sin(a) * R * 0.7;
      });
    });

    /* 네모끼리 겹치면 밀어낸다 — 태그는 고정, 항목만 움직인다 */
    var GAP = 12;

    /* 가두면서 옮기고, 실제로 움직인 거리를 돌려줍니다.
       벽에 닿아 못 움직였다면 0 이 나옵니다. */
    function shove(v, dx, dy) {
      if (v.fixed) return 0;
      var x0 = v.x, y0 = v.y;
      v.x = Math.max(v.w / 2 + 6, Math.min(W - v.w / 2 - 6, v.x + dx));
      v.y = Math.max(v.h / 2 + 6, Math.min(H - v.h / 2 - 6, v.y + dy));
      return Math.abs(v.x - x0) + Math.abs(v.y - y0);
    }

    for (var pass = 0; pass < 900; pass++) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var A = nodes[i], B = nodes[j];
          if (A.fixed && B.fixed) continue;
          var dx = B.x - A.x, dy = B.y - A.y;
          var ox = (A.w + B.w) / 2 + GAP - Math.abs(dx);
          var oy = (A.h + B.h) / 2 + GAP - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;          /* 안 겹침 */

          /* 덜 밀어도 되는 축으로 뗍니다. 그 축이 벽에 막히면 다른 축으로 다시 뗍니다 —
             막힌 채로 두면 두 알약이 영영 겹쳐 있게 됩니다(2026-09-21 실제 증상). */
          var axes = (ox / (A.w + B.w) < oy / (A.h + B.h)) ? ["x", "y"] : ["y", "x"];
          for (var k = 0; k < axes.length; k++) {
            var horiz = axes[k] === "x";
            var need = (horiz ? ox : oy);
            var dir = (horiz ? (dx >= 0 ? 1 : -1) : (dy >= 0 ? 1 : -1));
            var half = need / 2;
            var movedA = shove(A, horiz ? -dir * half : 0, horiz ? 0 : -dir * half);
            var movedB = shove(B, horiz ? dir * half : 0, horiz ? 0 : dir * half);
            /* 한쪽이 벽에 막혔으면 그 몫을 짝에게 넘깁니다 */
            if (movedA < half - 0.01) {
              var rest = half - movedA;
              movedB += shove(B, horiz ? dir * rest : 0, horiz ? 0 : dir * rest);
            } else if (movedB < half - 0.01) {
              var rest2 = half - movedB;
              movedA += shove(A, horiz ? -dir * rest2 : 0, horiz ? 0 : -dir * rest2);
            }
            if (movedA + movedB > 0.01) break;   /* 이 축으로 풀렸습니다 */
          }
        }
      }
      /* 태그를 제자리로 당겨 고리 모양을 지킵니다. 다만 끝까지 당기면 마지막에
         다시 겹쳐 버리므로, 뒤쪽 3분의 1에서는 당기기를 놓고 겹침만 풉니다. */
      if (pass < 600) {
        nodes.forEach(function (v) {
          if (!v.anchor) return;
          v.x += (v.ax - v.x) * 0.12;
          v.y += (v.ay - v.y) * 0.12;
        });
      }
    }

    var byId = {};
    nodes.forEach(function (v) { byId[v.id] = v; });

    function pill(v, cls, href, title) {
      var x = (v.x - v.w / 2).toFixed(1), y = (v.y - v.h / 2).toFixed(1);
      var s = (href ? '<a href="' + href + '" class="' + cls + '">' : '<g class="' + cls + '">');
      s += '<rect x="' + x + '" y="' + y + '" width="' + v.w.toFixed(1) +
           '" height="' + v.h + '" rx="15"/>';
      s += '<text x="' + v.x.toFixed(1) + '" y="' + (v.y + 4.5).toFixed(1) + '">' + esc(v.label) + "</text>";
      if (title) s += "<title>" + esc(title) + "</title>";
      s += (href ? "</a>" : "</g>");
      return s;
    }

    var h = '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" class="graph" ' +
            'role="img" aria-label="주제 관계도 — 주제와 목차 항목을 잇는 그림">';
    edges.forEach(function (e) {
      var A = byId[e[0]], B = byId[e[1]];
      h += '<line x1="' + A.x.toFixed(1) + '" y1="' + A.y.toFixed(1) +
           '" x2="' + B.x.toFixed(1) + '" y2="' + B.y.toFixed(1) + '" class="ge"/>';
    });
    nodes.forEach(function (v) {
      h += (v.kind === "tag")
        ? pill(v, "gt", null, v.n + "개 항목이 이 주제에 걸립니다")
        : pill(v, "gn g-" + v.group, "#" + v.id, v.title);
    });
    h += "</svg>";
    return h;
  }

  return { buildIndex: buildIndex, search: search, relatedItems: relatedItems, graphSVG: graphSVG };
})();
