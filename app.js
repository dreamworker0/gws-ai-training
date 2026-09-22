/* GWS & AI 교육 아카이브 — 화면 그리기
   데이터는 전부 data.js 에 있습니다. 내용을 바꾸실 때는 이 파일이 아니라
   data.js 를 고치세요. */

(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* **굵게** 와 줄바꿈만 살려 둡니다. 나머지는 그대로 글자로 보입니다. */
  function rich(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function installImageFallbacks(root) {
    (root || document).querySelectorAll("img").forEach(function (img) {
      if (img.dataset.fallbackReady) return;
      img.dataset.fallbackReady = "true";
      function handleError() {
        if (!img.isConnected) return;
        var fallback = document.createElement("span");
        fallback.className = "media-fallback";
        fallback.textContent = img.id === "hero-image"
          ? "GWS & AI 교육 아카이브"
          : (img.alt || "이미지를 불러오지 못했습니다");
        img.classList.add("is-missing");
        img.replaceWith(fallback);
      }
      img.addEventListener("error", handleError, { once: true });
      if (img.complete && img.naturalWidth === 0) handleError();
    });
  }

  var TRACK_NAME = {
    S: "먼저 보기",
    A: "A트랙 · 구글 워크스페이스 기초",
    B: "B트랙 · 에이전트 기반 업무 자동화",
  };
  var HIDDEN = {};
  (typeof SLIDE_HIDDEN !== "undefined" ? SLIDE_HIDDEN : []).forEach(function (r) { HIDDEN[r] = 1; });
  var INLINE_SLIDES = 8;   /* 항목 페이지에 바로 보이는 장수 */

  /* ── 머리말 ─────────────────────────────────────── */
  $("site-title").textContent = META.title;
  $("site-sub").textContent = META.tagline;
  $("foot-lecturer").textContent = META.lecturer;
  $("foot-updated").textContent = META.updated;

  /* ═══ 발표자료 공통 ═══════════════════════════════
     슬라이드 한 장은 "덱id:쪽번호" 로 가리킵니다. 예) "smart:12" */

  var DECK = {};
  DECKS.forEach(function (d) { DECK[d.id] = d; });

  function parseRef(ref) {
    var p = String(ref).split(":");
    return { deck: p[0], n: parseInt(p[1], 10) };
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function thumbSrc(r) { return "img/slides/" + r.deck + "/thumb/p" + pad(r.n) + ".jpg"; }
  function bigSrc(r) { return "img/slides/" + r.deck + "/p" + pad(r.n) + ".jpg"; }
  function slideHash(ref) { return "#slide-" + String(ref).replace(":", "-"); }
  function slideTitle(ref) { return SLIDE_TITLES[ref] || ""; }

  function slideTile(ref) {
    var r = parseRef(ref);
    var t = slideTitle(ref);
    var deckName = DECK[r.deck] ? DECK[r.deck].title : r.deck;
    return '<a class="sl" href="' + slideHash(ref) + '">' +
      '<img loading="lazy" src="' + thumbSrc(r) + '" alt="' + esc(deckName) + " " + r.n + '쪽">' +
      '<span class="sl-cap"><b>' + r.n + "</b>" + (t ? " " + esc(t) : "") + "</span></a>";
  }

  var totalPages = DECKS.reduce(function (a, d) { return a + d.pages; }, 0);
  $("slide-count-note").textContent =
    "자료 " + DECKS.length + "종 · 모두 " + totalPages + "쪽";

  /* ── 질문하기 ───────────────────────────────────
     주소는 data.js 에 나눠 두었고 여기서 이어 붙입니다. */
  function mailHref(topic) {
    var to = CONTACT.user + "@" + CONTACT.host;
    var subj = CONTACT.subjectPrefix + (topic ? " " + topic : "");
    var NL = String.fromCharCode(10);
    var isEducationInquiry = topic === "교육 문의";
    var body = isEducationInquiry
      ? "드림워크 교육을 함께 준비하기 위해 아래 내용을 알려 주세요." + NL + NL +
        "· 기관명:" + NL +
        "· 참여 대상과 인원:" + NL +
        "· 기대하는 변화 또는 다루고 싶은 주제:" + NL +
        "· 희망 일정:" + NL
      : topic
      ? "복습하다 막힌 것을 적어 주세요." + NL + NL +
        "· 어느 주제: " + topic + NL +
        "· 어디까지 해보셨는지:" + NL +
        "· 무엇이 안 되는지:" + NL
      : "";
    return "mailto:" + to + "?subject=" + encodeURIComponent(subj) +
           (body ? "&body=" + encodeURIComponent(body) : "");
  }

  function askBox(topic, note, heading, label) {
    return '<div class="ask"><div><b>' + esc(heading || (topic ? "이 주제가 막히시나요?" : "복습하다 막히셨나요?")) +
      "</b><span>" + esc(note) + "</span></div>" +
      '<a class="askbtn" href="' + mailHref(topic) + '">' + esc(label || CONTACT.label) + " →</a></div>";
  }

  /* ── 목차 ───────────────────────────────────────── */
  function itemRow(it) {
    var flags = [];
    var sl = ITEM_SLIDES[it.id] || [];
    if (it.lesson && it.lesson.length) flags.push('<span class="chip done">강의 정리</span>');
    if (sl.length) flags.push('<span class="chip sld">자료 ' + sl.length + "</span>");
    if (it.status === "own") flags.push('<span class="chip own">현장 실습</span>');
    if (it.videos.length) flags.push('<span class="chip vid">영상 ' + it.videos.length + "</span>");

    return '<li><a class="item ' + it.track.toLowerCase() + '" href="#' + it.id + '">' +
      '<span class="num">' + it.no + "</span>" +
      '<span class="ti"><b>' + esc(it.title) + "</b><small>" + esc(it.blurb) + "</small></span>" +
      '<span class="flags">' + flags.join("") + "</span>" +
      "</a></li>";
  }

  function findItem(id) {
    return CURRICULUM.filter(function (x) { return x.id === id; })[0];
  }

  function renderAbout(about) {
    return '<div class="about-copy"><p class="eyebrow">' + esc(about.name) + '</p>' +
      '<h2 id="education-title">현장의 작은 변화부터 시작합니다.</h2>' +
      '<p>' + esc(about.description) + '</p><p class="educator">' + esc(about.educator) + '</p></div>';
  }

  var trackS = CURRICULUM.filter(function (i) { return i.track === "S"; });
  var trackA = CURRICULUM.filter(function (i) { return i.track === "A"; });
  var trackB = CURRICULUM.filter(function (i) { return i.track === "B"; });
  if ($("track-s")) {
    $("track-s").innerHTML = trackS.map(itemRow).join("");
    if (!trackS.length) $("track-s-wrap").hidden = true;
  }
  $("track-a").innerHTML = trackA.map(itemRow).join("");
  $("track-b").innerHTML = trackB.map(itemRow).join("");
  if ($("education-about")) {
    $("education-about").innerHTML = renderAbout(ABOUT_DREAMWORK);
  }

  /* ── FAQ ────────────────────────────────────────── */
  $("faq-list").innerHTML = FAQ.map(function (f) {
    return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
  }).join("");
  if ($("ask-home")) {
    $("ask-home").innerHTML = askBox("", "여기에 없는 것이 궁금하시면 강사님께 바로 물어보셔도 됩니다.");
  }
  if ($("ask-education")) {
    $("ask-education").innerHTML = askBox(
      "교육 문의",
      "기관의 상황과 참여자를 알려 주시면 알맞은 교육 흐름을 함께 살펴봅니다.",
      "교육을 함께 준비하시나요?",
      "교육 문의하기"
    );
  }

  /* ── 항목 페이지 ────────────────────────────────── */
  var home = $("home");
  var page = $("itempage");
  var deck = $("slidespage");
  var graph = $("graphpage");

  function renderItem(it) {
    var h = "";
    h += '<p class="kicker">' + TRACK_NAME[it.track] + " · " + it.no + "번</p>";
    h += "<h2 class='item-title'>" + esc(it.title) + "</h2>";
    h += '<p class="lede">' + esc(it.blurb) + "</p>";
    if (it.tags && it.tags.length) {
      h += '<p class="tags">' + it.tags.map(function (t) {
        return '<a class="tg" href="#graph">' + esc(t) + "</a>";
      }).join("") + "</p>";
    }

    /* 발표자료 — 이 주제에 해당하는 슬라이드 */
    var sl = ITEM_SLIDES[it.id] || [];
    if (sl.length) {
      h += "<h3>발표자료</h3>";
      h += '<div class="deck">' + sl.slice(0, INLINE_SLIDES).map(slideTile).join("") + "</div>";
      if (sl.length > INLINE_SLIDES) {
        h += '<p class="more"><a href="#slides-' + it.id + '">이 주제 자료 ' +
             sl.length + "쪽 모두 보기 →</a></p>";
      }
    }

    if (it.lesson && it.lesson.length) {
      h += "<h3>강의에서 다룬 내용</h3>";
      it.lesson.forEach(function (s) {
        h += "<section class='ls'>";
        h += "<h4>" + rich(s.h) + "</h4>";
        h += "<p>" + rich(s.p) + "</p>";
        /* svg 는 data.js 안에서 우리가 직접 쓴 것이므로 그대로 넣습니다 */
        if (s.svg) h += '<figure class="fig">' + s.svg + "</figure>";
        if (s.after) h += "<p>" + rich(s.after) + "</p>";
        if (s.said) h += '<blockquote class="said">“' + esc(s.said) + "”</blockquote>";
        h += "</section>";
      });
    }

    if (it.notes && it.notes.length) {
      h += "<h3>강사님이 하신 말씀</h3><div class='note-box'><ul>";
      it.notes.forEach(function (n) { h += "<li>" + rich(n) + "</li>"; });
      h += "</ul></div>";
    }

    h += "<h3>영상으로 보기</h3>";
    if (it.videos && it.videos.length) {
      h += '<div class="vids">';
      it.videos.forEach(function (v) {
        h += '<a class="vid" href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">' +
             '<span class="thumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + esc(v.id) + '/mqdefault.jpg">' +
             '<span class="video-play" aria-hidden="true">▶</span></span>' +
             '<span class="video-copy"><strong>' + esc(v.t) + '</strong>' +
             '<span class="video-meta">' + esc(v.channel) + ' · ' + esc(v.date.replace(/-/g, ".")) +
             '</span></span></a>';
      });
      h += "</div>";
    } else {
      h += '<p class="empty">' + (it.status === "own"
        ? "이 항목은 강사님 현장 실습이 중심입니다."
        : "최근 2년 안에 공개된 추천 영상을 준비하고 있습니다.") + '</p>';
    }

    if (it.docs && it.docs.length) {
      h += "<h3>공식 문서</h3><ul class='docs'>";
      it.docs.forEach(function (d) {
        h += '<li><a href="' + esc(d.u) + '" target="_blank" rel="noopener">' + esc(d.t) + "</a></li>";
      });
      h += "</ul>";
    }

    /* 관련 항목 — 태그가 겹치는 것 */
    var rel = Find.relatedItems(it, 4);
    if (rel.length) {
      h += "<h3>함께 복습하면 좋은 것</h3>";
      h += '<div class="rels">';
      rel.forEach(function (r) {
        var nv = (r.it.videos || []).length;
        h += '<a class="rel" href="#' + r.it.id + '">' +
             '<b>' + esc(r.it.title) + "</b>" +
             '<span class="rel-why">' + r.shared.map(esc).join(" · ") + "</span>" +
             '<span class="rel-meta">' + (nv ? "영상 " + nv + "편 · " : "") +
             ((ITEM_SLIDES[r.it.id] || []).length ? "자료 " + ITEM_SLIDES[r.it.id].length + "쪽" : "") +
             "</span></a>";
      });
      h += "</div>";
    }

    if ((!it.lesson || !it.lesson.length) && !sl.length) {
      h += '<p class="empty" style="margin-top:26px">이 항목의 강의 정리는 아직 준비 중입니다. 회차가 끝나는 대로 채워집니다.</p>';
    }

    h += askBox(it.title, "어디까지 해보셨는지 함께 적어 주시면 답이 빨라집니다.");
    return h;
  }

  function renderPager(it) {
    var list = it.track === "A" ? trackA : (it.track === "B" ? trackB : trackS);
    var i = list.indexOf(it);
    var prev = list[i - 1], next = list[i + 1];
    var h = "";
    h += prev ? '<a class="pg prev" href="#' + prev.id + '"><span>이전</span><b>' + esc(prev.title) + "</b></a>"
              : '<span class="pg empty-pg"></span>';
    h += next ? '<a class="pg next" href="#' + next.id + '"><span>다음</span><b>' + esc(next.title) + "</b></a>"
              : '<span class="pg empty-pg"></span>';
    return h;
  }

  /* ── 발표자료 화면 ──────────────────────────────── */

  /* 전체 — 덱별로 나눠 보여 줍니다 */
  function renderAllDecks() {
    var h = '<p class="kicker">발표자료</p>';
    h += "<h2 class='item-title'>발표자료 전체</h2>";
    h += '<p class="lede">모두 ' + totalPages + "쪽 · 강사 " + esc(META.lecturer) +
         " 제작. 쪽을 누르면 크게 봅니다.</p>";
    h += '<p class="more">주제별로 보시는 편이 빠릅니다 — <a href="#curriculum">배우는 것</a>에서 ' +
         "항목을 고르시면 그 주제 자료만 모여 있습니다.</p>";
    DECKS.forEach(function (d) {
      h += "<h3>" + esc(d.title) + " · " + d.pages + "쪽</h3>";
      if (d.note) h += '<p class="deck-note">⚠️ ' + esc(d.note) + "</p>";
      h += '<div class="deck">';
      var shown = 0;
      for (var i = 1; i <= d.pages; i++) {
        var ref = d.id + ":" + i;
        if (HIDDEN[ref]) continue;
        h += slideTile(ref);
        shown++;
      }
      h += "</div>";
      if (shown < d.pages) {
        h += '<p class="deck-note">' + (d.pages - shown) +
             "쪽은 지금 기준으로 맞지 않는 내용이라 목록에서 뺐습니다. 원본 자료에는 그대로 있습니다.</p>";
      }
    });
    return h;
  }

  /* 한 주제의 자료만 */
  function renderItemDeck(it) {
    var sl = ITEM_SLIDES[it.id] || [];
    var h = '<p class="kicker"><a href="#' + it.id + '">' + esc(it.title) + "</a> · 발표자료</p>";
    h += "<h2 class='item-title'>" + esc(it.title) + " — 자료 " + sl.length + "쪽</h2>";
    h += '<p class="lede">이 주제에서 쓰는 슬라이드입니다. 쓸모 있는 순서로 놓았습니다.</p>';
    h += '<div class="deck">' + sl.map(slideTile).join("") + "</div>";
    return h;
  }

  /* 한 장 크게 — 같은 주제 안에서 앞뒤로 넘깁니다 */
  function renderSlide(ref, fromItem) {
    var r = parseRef(ref);
    var d = DECK[r.deck];
    if (!d || !(r.n >= 1 && r.n <= d.pages)) return null;

    var list = fromItem && ITEM_SLIDES[fromItem] ? ITEM_SLIDES[fromItem] : null;
    if (!list) {
      list = [];
      for (var i = 1; i <= d.pages; i++) list.push(d.id + ":" + i);
    }
    var idx = list.indexOf(ref);
    var t = slideTitle(ref);

    var back = fromItem
      ? '<a href="#slides-' + fromItem + '">' + esc((CURRICULUM.filter(function (x) { return x.id === fromItem; })[0] || {}).title || "목록") + "</a>"
      : '<a href="#slides">' + esc(d.title) + "</a>";

    var h = '<p class="kicker">' + back + " · " + r.n + " / " + d.pages + "쪽</p>";
    h += "<h2 class='item-title'>" + esc(t || r.n + "쪽") + "</h2>";
    h += '<figure class="fig slide-one"><img src="' + bigSrc(r) + '" alt="' + esc(d.title) + " " + r.n + '쪽">' +
         '<button class="fsbtn" type="button" data-full="' + esc(ref) + '"' +
         (fromItem ? ' data-from="' + esc(fromItem) + '"' : "") +
         '>⛶ 전체 화면</button></figure>';

    if (idx >= 0) {
      var prev = list[idx - 1], next = list[idx + 1];
      var q = fromItem ? "?from=" + fromItem : "";
      h += '<nav class="pager">';
      h += prev ? '<a class="pg prev" href="' + slideHash(prev) + q + '"><span>이전</span><b>' +
                  esc(slideTitle(prev) || parseRef(prev).n + "쪽") + "</b></a>"
                : '<span class="pg empty-pg"></span>';
      h += next ? '<a class="pg next" href="' + slideHash(next) + q + '"><span>다음</span><b>' +
                  esc(slideTitle(next) || parseRef(next).n + "쪽") + "</b></a>"
                : '<span class="pg empty-pg"></span>';
      h += "</nav>";
    }
    return h;
  }

  /* ── 오가기 ─────────────────────────────────────── */
  function only(which) {
    home.hidden = which !== "home";
    page.hidden = which !== "item";
    deck.hidden = which !== "deck";
    if (graph) graph.hidden = which !== "graph";
  }

  function showHome() {
    only("home");
    document.title = META.title + " — " + META.subtitle;
  }

  function showItem(it) {
    $("itembody").innerHTML = renderItem(it);
    $("pager").innerHTML = renderPager(it);
    installImageFallbacks(page);
    only("item");
    document.title = it.title + " — " + META.title;
    window.scrollTo(0, 0);
  }

  function showDeck(html, title) {
    $("slidesbody").innerHTML = html;
    installImageFallbacks(deck);
    only("deck");
    document.title = title + " — " + META.title;
    window.scrollTo(0, 0);
  }

  function renderGraph() {
    var h = '<p class="kicker">관계도</p>';
    h += "<h2 class='item-title'>주제 관계도</h2>";
    h += '<p class="lede">배운 것들이 서로 어떻게 이어지는지 한눈에 봅니다. ' +
         "복습하고 싶은 것을 누르면 그 항목으로 갑니다.</p>";
    h += '<p class="legend">' +
         '<span><i></i> 주제</span>' +
         '<span><i class="lS"></i> 먼저 보기</span>' +
         '<span><i class="lA"></i> A트랙 · 기초</span>' +
         '<span><i class="lB"></i> B트랙 · 자동화</span>' +
         "</p>";
    h += '<figure class="fig graph-wrap">' + Find.graphSVG(2) + "</figure>";
    h += '<p class="more">바깥쪽 회색이 <b>주제</b>, 색이 있는 것이 <b>배우는 항목</b>입니다. ' +
         "선은 그 항목이 어떤 주제에 걸치는지 보여 줍니다 — 여러 주제에 걸친 항목일수록 가운데로 모입니다.</p>";
    return h;
  }

  function showGraph() {
    $("graphbody").innerHTML = renderGraph();
    only("graph");
    document.title = "주제 관계도 — " + META.title;
    window.scrollTo(0, 0);
  }

  function route() {
    var raw = location.hash.replace(/^#/, "");

    var HOME_ANCHORS = {
      top: true,          /* 제목을 누르면 여기로 — 표준상 문서 맨 위를 뜻합니다 */
      hero: true,
      education: true,
      curriculum: true,
      "slides-home": true,
      faq: true,
      contact: true,
    };

    if (HOME_ANCHORS[raw]) {
      showHome();
      requestAnimationFrame(function () {
        if (raw === "top") { window.scrollTo(0, 0); return; }
        var target = document.getElementById(raw);
        if (target) target.scrollIntoView();
      });
      return;
    }

    if (raw === "graph") { showGraph(); return; }
    var from = null;
    var qi = raw.indexOf("?from=");
    if (qi > -1) { from = raw.slice(qi + 6); raw = raw.slice(0, qi); }

    /* #slides — 전체 */
    if (raw === "slides") { showDeck(renderAllDecks(), "발표자료"); return; }

    /* #slides-a01 — 한 주제 */
    var mi = /^slides-([ab]\d\d)$/.exec(raw);
    if (mi && findItem(mi[1])) {
      var it0 = findItem(mi[1]);
      showDeck(renderItemDeck(it0), it0.title + " 자료");
      return;
    }

    /* #slide-smart-12 — 한 장 */
    /* 덱 이름에 숫자가 들어갑니다 — 녹음 기반 자료는 rec0921 처럼 날짜를 답니다.
       예전에는 [a-z]+ 만 받아서 #slide-rec0921-7 이 첫 화면으로 떨어졌습니다. */
    var ms = /^slide-([a-z][a-z0-9]*)-(\d+)$/.exec(raw);
    if (ms) {
      var html = renderSlide(ms[1] + ":" + parseInt(ms[2], 10), from && findItem(from) ? from : null);
      if (html) { showDeck(html, "발표자료 " + ms[2] + "쪽"); return; }
    }

    /* #a01 — 목차 항목 */
    var it = findItem(raw);
    if (it) { showItem(it); return; }

    var wasSub = !page.hidden || !deck.hidden;
    showHome();
    if (wasSub && raw) {
      var el = document.getElementById(raw);
      if (el) el.scrollIntoView();
    }
  }

  /* 항목 페이지에서 슬라이드를 누르면 그 주제 안에서 넘어가도록 from 을 붙입니다 */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a.sl") : null;
    if (!a) return;
    var cur = location.hash.replace(/^#/, "").split("?")[0];
    var owner = /^([ab]\d\d)$/.test(cur) ? cur
              : (/^slides-([ab]\d\d)$/.exec(cur) || [])[1];
    if (owner) {
      e.preventDefault();
      location.hash = a.getAttribute("href").slice(1) + "?from=" + owner;
    }
  });

  /* ── 밝게 / 어둡게 ──────────────────────────────────
     평소엔 운영체제 설정을 따릅니다. 밤에 휴대폰으로 보실 때
     눈이 편한 쪽으로 고정하시라고 둔 단추입니다. */
  (function () {
    var btn = $("theme");
    if (!btn) return;
    var root = document.documentElement;
    var KEY = "theme";
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

    btn.addEventListener("click", function () {
      var now = root.getAttribute("data-theme");
      var dark = now ? now === "dark"
                     : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  })();

  /* ── 찾기 ───────────────────────────────────────── */
  var qEl = $("q"), qRes = $("qres");
  var KINDS = { "항목": "k-item", "자료": "k-slide", "영상": "k-vid", "문서": "k-doc" };

  function runSearch() {
    var v = qEl.value.trim();
    if (!v) { qRes.hidden = true; qRes.innerHTML = ""; return; }
    var hits = Find.search(v);
    if (!hits.length) {
      qRes.innerHTML = '<p class="qempty">「' + esc(v) + "」 에 걸리는 것이 없습니다.</p>";
    } else {
      qRes.innerHTML = hits.map(function (e) {
        return '<a class="qr" href="' + e.hash + '">' +
          '<span class="qk ' + (KINDS[e.kind] || "") + '">' + e.kind + "</span>" +
          '<span class="qt"><b>' + esc(e.label) + "</b><small>" + esc(e.sub) + "</small></span></a>";
      }).join("");
    }
    qRes.hidden = false;
  }

  qEl.addEventListener("input", runSearch);
  qEl.addEventListener("focus", function () { if (qEl.value.trim()) runSearch(); });
  qRes.addEventListener("click", function (e) {
    if (e.target.closest("a")) { qRes.hidden = true; qEl.value = ""; qEl.blur(); }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".searchbox")) qRes.hidden = true;
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== qEl) { e.preventDefault(); qEl.focus(); }
    if (e.key === "Escape") { qRes.hidden = true; qEl.blur(); }
  });

  /* ── 전체 화면으로 보기 ─────────────────────────────
     복습할 때 슬라이드를 크게 넘겨 보실 수 있게. 화살표 키로도 넘어갑니다. */
  (function () {
    var box = $("viewer");
    if (!box) return;
    var img = $("viewer-img"), cnt = $("v-count");
    var list = [], at = -1;

    function draw() {
      var ref = list[at];
      if (!ref) return;
      var r = parseRef(ref);
      img.src = bigSrc(r);
      img.alt = (slideTitle(ref) || r.n + "쪽");
      cnt.textContent = (at + 1) + " / " + list.length;
      $("v-prev").disabled = at <= 0;
      $("v-next").disabled = at >= list.length - 1;
    }

    function open(ref, from) {
      var r = parseRef(ref);
      if (from && ITEM_SLIDES[from]) {
        list = ITEM_SLIDES[from].slice();
      } else {
        var d = DECK[r.deck];
        list = [];
        for (var i = 1; i <= d.pages; i++) list.push(d.id + ":" + i);
      }
      at = list.indexOf(ref);
      if (at < 0) { list = [ref]; at = 0; }
      box.hidden = false;
      document.body.style.overflow = "hidden";
      draw();
      if (box.requestFullscreen) { try { box.requestFullscreen(); } catch (e) {} }
    }

    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      if (document.fullscreenElement && document.exitFullscreen) {
        try { document.exitFullscreen(); } catch (e) {}
      }
    }

    function step(n) {
      var to = at + n;
      if (to < 0 || to >= list.length) return;
      at = to; draw();
    }

    document.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".fsbtn") : null;
      if (b) { open(b.getAttribute("data-full"), b.getAttribute("data-from")); return; }
      if (box.hidden) return;
      if (e.target.id === "v-prev") step(-1);
      else if (e.target.id === "v-next") step(1);
      else if (e.target.id === "v-close" || e.target === box) close();
    });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); step(1); }
      else if (e.key === "Escape") close();
    });

    document.addEventListener("fullscreenchange", function () {
      if (!document.fullscreenElement && !box.hidden) close();
    });
  })();

  window.addEventListener("hashchange", route);
  installImageFallbacks(document);
  route();
})();
