/* 열매똑똑 스마트워크 — 화면 그리기
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

  var taught = {};
  TAUGHT.forEach(function (id) { taught[id] = true; });

  /* ── 머리말 ─────────────────────────────────────── */
  $("site-title").textContent = META.title;
  $("site-sub").textContent = META.subtitle;
  $("foot-lecturer").textContent = META.lecturer;
  $("foot-updated").textContent = META.updated;
  document.title = META.title + " — " + META.subtitle;

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

  /* ── 유형 ───────────────────────────────────────── */
  $("types").innerHTML = TYPES.map(function (t) {
    return '<div class="type"><b>' + esc(t.name) + ' · ' + t.n + '회기</b>' +
           '<span>' + esc(t.desc) + '</span></div>';
  }).join("");

  /* ── 진도 ───────────────────────────────────────── */
  var totalItems = CURRICULUM.length;
  var doneItems = CURRICULUM.filter(function (it) { return taught[it.id]; }).length;
  var pct = Math.round((doneItems / totalItems) * 100);
  $("progress-bar").style.width = pct + "%";
  $("progress-label").textContent = doneItems + " / " + totalItems + "항목";
  $("progress-note").textContent = doneItems === 0
    ? "아직 본교육이 시작되지 않았습니다."
    : "회차가 진행될 때마다 채워집니다. 지금까지 다룬 항목에는 「진행함」 표시가 붙습니다.";

  /* ── 일정표 ─────────────────────────────────────── */
  function itemRow(it) {
    var flags = [];
    if (taught[it.id]) flags.push('<span class="chip done">진행함</span>');
    if (it.status === "own") flags.push('<span class="chip own">현장 실습</span>');
    if (it.status === "check") flags.push('<span class="chip chk">확인 중</span>');
    if (it.videos.length) flags.push('<span class="chip vid">영상 ' + it.videos.length + '</span>');

    return '<li><button class="item ' + it.track.toLowerCase() + '" data-id="' + it.id + '">' +
      '<span class="num">' + it.no + '</span>' +
      '<span class="ti"><b>' + esc(it.title) + '</b><small>' + esc(it.blurb) + '</small></span>' +
      '<span class="flags">' + flags.join("") + '</span>' +
      '</button></li>';
  }

  $("track-a").innerHTML = CURRICULUM.filter(function (i) { return i.track === "A"; }).map(itemRow).join("");
  $("track-b").innerHTML = CURRICULUM.filter(function (i) { return i.track === "B"; }).map(itemRow).join("");

  /* ── 기관 ───────────────────────────────────────── */
  $("org-list").innerHTML = ORGS.map(function (o) {
    return '<div class="org"><b>' + esc(o.name) + '</b><div class="meta">' +
      '<span class="chip">' + esc(o.type) + '</span>' +
      '<span class="chip">총 ' + o.quota + '회기</span>' +
      '<span class="chip' + (o.stage === "본교육" ? " done" : "") + '">' + esc(o.stage) + '</span>' +
      '</div></div>';
  }).join("");

  /* ── FAQ ────────────────────────────────────────── */
  $("faq-list").innerHTML = FAQ.map(function (f) {
    return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
  }).join("");

  /* ── 항목 상세 ──────────────────────────────────── */
  var modal = $("modal");
  var modalBody = $("modal-body");
  var lastFocus = null;

  function openItem(id) {
    var it = CURRICULUM.filter(function (x) { return x.id === id; })[0];
    if (!it) return;

    var h = "";
    h += '<p class="kicker">' + (it.track === "A" ? "A트랙 · 구글 워크스페이스 기초" : "B트랙 · 에이전트 기반 업무 자동화") +
         ' · ' + it.no + '번</p>';
    h += "<h3>" + esc(it.title) + "</h3>";
    h += "<p>" + esc(it.blurb) + "</p>";

    if (it.notes && it.notes.length) {
      h += "<h4>강사님이 하신 말씀</h4><div class='note-box'><ul>";
      it.notes.forEach(function (n) { h += "<li>" + esc(n) + "</li>"; });
      h += "</ul></div>";
    }

    h += "<h4>영상으로 보기</h4>";
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
      h += "<h4>공식 문서</h4><ul>";
      it.docs.forEach(function (d) {
        h += '<li><a href="' + esc(d.u) + '" target="_blank" rel="noopener">' + esc(d.t) + "</a></li>";
      });
      h += "</ul>";
    }

    if (!taught[it.id]) {
      h += '<p class="empty" style="margin-top:22px">아직 강의하지 않은 항목입니다. 회차가 끝나면 강사님 설명 정리가 여기에 추가됩니다.</p>';
    }

    modalBody.innerHTML = h;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-x").focus();
    if (location.hash !== "#" + it.id) history.replaceState(null, "", "#" + it.id);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
    if (/^#[ab]\d\d$/.test(location.hash)) history.replaceState(null, "", location.pathname);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".item") : null;
    if (btn) { openItem(btn.getAttribute("data-id")); return; }
    if (e.target.hasAttribute && e.target.hasAttribute("data-close")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* 주소에 항목이 적혀 있으면 바로 열기 (#a04 처럼 공유 가능) */
  if (/^#[ab]\d\d$/.test(location.hash)) openItem(location.hash.slice(1));
})();
