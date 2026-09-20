/* 구글 워크스페이스와 AI 교육 — 화면 그리기
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

  var TRACK_NAME = {
    A: "A트랙 · 구글 워크스페이스 기초",
    B: "B트랙 · 에이전트 기반 업무 자동화",
  };

  /* ── 머리말 ─────────────────────────────────────── */
  $("site-title").textContent = META.title;
  $("site-sub").textContent = META.subtitle;
  $("foot-lecturer").textContent = META.lecturer;
  $("foot-updated").textContent = META.updated;

  /* ── 설치 영상 ──────────────────────────────────── */
  $("intro-video").innerHTML =
    '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(INTRO_VIDEO.id) + '"' +
    ' title="' + esc(INTRO_VIDEO.t) + '" loading="lazy" allowfullscreen' +
    ' allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"></iframe>';
  $("intro-desc").textContent = INTRO_VIDEO.desc;

  /* ── 인용 ───────────────────────────────────────── */
  $("quotes").innerHTML = QUOTES.map(function (q) {
    return '<figure class="quote"><p>“' + esc(q.text) + '”</p>' +
           '<cite>' + esc(q.where) + '</cite></figure>';
  }).join("");

  /* ── 목차 ───────────────────────────────────────── */
  function itemRow(it) {
    var flags = [];
    if (it.lesson && it.lesson.length) flags.push('<span class="chip done">강의 정리</span>');
    if (it.status === "own") flags.push('<span class="chip own">현장 실습</span>');
    if (it.status === "check") flags.push('<span class="chip chk">확인 중</span>');
    if (it.videos.length) flags.push('<span class="chip vid">영상 ' + it.videos.length + '</span>');

    return '<li><a class="item ' + it.track.toLowerCase() + '" href="#' + it.id + '">' +
      '<span class="num">' + it.no + '</span>' +
      '<span class="ti"><b>' + esc(it.title) + '</b><small>' + esc(it.blurb) + '</small></span>' +
      '<span class="flags">' + flags.join("") + '</span>' +
      '</a></li>';
  }

  var trackA = CURRICULUM.filter(function (i) { return i.track === "A"; });
  var trackB = CURRICULUM.filter(function (i) { return i.track === "B"; });
  $("track-a").innerHTML = trackA.map(itemRow).join("");
  $("track-b").innerHTML = trackB.map(itemRow).join("");

  /* ── FAQ ────────────────────────────────────────── */
  $("faq-list").innerHTML = FAQ.map(function (f) {
    return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
  }).join("");

  /* ── 항목 페이지 ────────────────────────────────── */
  var home = $("home");
  var page = $("itempage");

  function renderItem(it) {
    var h = "";
    h += '<p class="kicker">' + TRACK_NAME[it.track] + " · " + it.no + "번</p>";
    h += "<h2 class='item-title'>" + esc(it.title) + "</h2>";
    h += '<p class="lede">' + esc(it.blurb) + "</p>";

    if (it.lesson && it.lesson.length) {
      h += '<div class="lesson">';
      h += "<h3>강의에서 다룬 내용</h3>";
      it.lesson.forEach(function (s) {
        h += "<section class='ls'>";
        h += "<h4>" + rich(s.h) + "</h4>";
        h += "<p>" + rich(s.p) + "</p>";
        if (s.said) h += '<blockquote class="said">“' + esc(s.said) + '”</blockquote>';
        h += "</section>";
      });
      h += "</div>";
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
             '<span class="thumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + esc(v.id) + '/mqdefault.jpg"></span>' +
             '<span>' + esc(v.t) + '</span></a>';
      });
      h += "</div>";
    } else {
      h += '<p class="empty">이 항목은 강사님 고유 커리큘럼이라 대신할 만한 외부 영상이 없습니다. 현장 실습으로 배우시는 것이 가장 빠릅니다.</p>';
    }

    if (it.docs && it.docs.length) {
      h += "<h3>공식 문서</h3><ul class='docs'>";
      it.docs.forEach(function (d) {
        h += '<li><a href="' + esc(d.u) + '" target="_blank" rel="noopener">' + esc(d.t) + "</a></li>";
      });
      h += "</ul>";
    }

    if (!it.lesson || !it.lesson.length) {
      h += '<p class="empty" style="margin-top:26px">이 항목의 강의 정리는 아직 준비 중입니다. 회차가 끝나는 대로 채워집니다.</p>';
    }
    return h;
  }

  /* 같은 트랙 안에서 앞뒤로 넘기기 */
  function renderPager(it) {
    var list = it.track === "A" ? trackA : trackB;
    var i = list.indexOf(it);
    var prev = list[i - 1];
    var next = list[i + 1];
    var h = "";
    h += prev
      ? '<a class="pg prev" href="#' + prev.id + '"><span>이전</span><b>' + esc(prev.title) + "</b></a>"
      : '<span class="pg empty-pg"></span>';
    h += next
      ? '<a class="pg next" href="#' + next.id + '"><span>다음</span><b>' + esc(next.title) + "</b></a>"
      : '<span class="pg empty-pg"></span>';
    return h;
  }

  function showHome() {
    page.hidden = true;
    home.hidden = false;
    document.title = META.title + " — " + META.subtitle;
  }

  function showItem(it) {
    $("itembody").innerHTML = renderItem(it);
    $("pager").innerHTML = renderPager(it);
    home.hidden = true;
    page.hidden = false;
    document.title = it.title + " — " + META.title;
    window.scrollTo(0, 0);
  }

  function route() {
    var id = location.hash.replace(/^#/, "");
    var it = CURRICULUM.filter(function (x) { return x.id === id; })[0];
    if (it) {
      showItem(it);
    } else {
      var wasItem = !page.hidden;
      showHome();
      /* 목록으로 돌아올 때 원래 보던 자리로 */
      if (wasItem && id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView();
      }
    }
  }

  window.addEventListener("hashchange", route);
  route();
})();
