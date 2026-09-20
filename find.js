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
    var W = 1020, H = 860, CX = W / 2, CY = H / 2;
    var FS_T = 13, FS_I = 13;

    var use = {};
    CURRICULUM.forEach(function (it) {
      (it.tags || []).forEach(function (t) { use[t] = (use[t] || 0) + 1; });
    });
    var tags = Object.keys(use).filter(function (t) { return use[t] >= minUse; })
                     .sort(function (a, b) { return use[b] - use[a]; });

    var nodes = [], edges = [];
    var RX = 408, RY = 356;

    tags.forEach(function (t, i) {
      var a = (i / tags.length) * Math.PI * 2 - Math.PI / 2;
      var w = textW(t, FS_T) + 26;
      nodes.push({ id: "t:" + t, kind: "tag", label: t, n: use[t],
                   w: w, h: 30, fixed: true,
                   x: CX + Math.cos(a) * RX, y: CY + Math.sin(a) * RY });
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
                   track: it.track, w: textW(label, FS_I) + 24, h: 30, fixed: false,
                   x: sx / mine.length + (it.id.charCodeAt(2) % 7) - 3,
                   y: sy / mine.length + (it.id.charCodeAt(1) % 7) - 3 });
      mine.forEach(function (t) { edges.push([it.id, "t:" + t]); });
    });

    /* 네모끼리 겹치면 밀어낸다 — 태그는 고정, 항목만 움직인다 */
    var GAP = 12;
    for (var pass = 0; pass < 900; pass++) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var A = nodes[i], B = nodes[j];
          if (A.fixed && B.fixed) continue;
          var dx = B.x - A.x, dy = B.y - A.y;
          var ox = (A.w + B.w) / 2 + GAP - Math.abs(dx);
          var oy = (A.h + B.h) / 2 + GAP - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;          /* 안 겹침 */
          /* 덜 밀어도 되는 축으로 뗀다 */
          if (ox / (A.w + B.w) < oy / (A.h + B.h)) {
            var mx = (dx >= 0 ? 1 : -1) * ox / 2;
            if (!A.fixed) A.x -= mx; if (!B.fixed) B.x += mx;
          } else {
            var my = (dy >= 0 ? 1 : -1) * oy / 2;
            if (!A.fixed) A.y -= my; if (!B.fixed) B.y += my;
          }
        }
      }
      nodes.forEach(function (v) {
        if (v.fixed) return;
        v.x = Math.max(v.w / 2 + 6, Math.min(W - v.w / 2 - 6, v.x));
        v.y = Math.max(v.h / 2 + 6, Math.min(H - v.h / 2 - 6, v.y));
      });
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
        : pill(v, "gn t" + v.track, "#" + v.id, v.title);
    });
    h += "</svg>";
    return h;
  }

  return { buildIndex: buildIndex, search: search, relatedItems: relatedItems, graphSVG: graphSVG };
})();
