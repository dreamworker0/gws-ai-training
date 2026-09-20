/* ===================================================================
   구글 워크스페이스와 AI 교육 — 수강생 학습 페이지 데이터
   -------------------------------------------------------------------
   이 파일만 고치면 사이트 내용이 바뀝니다. HTML·CSS는 건드릴 필요 없습니다.

   고치는 법
     · 영상 추가      → videos 배열에 { t: "제목", id: "유튜브ID" } 한 줄
     · 강사님 정리 추가 → notes 배열에 "문장" 한 줄
     · 기관 진도 갱신   → ORGS 의 done 숫자만 고치기
     · 일정 바뀜       → SCHEDULE 표 고치기

   ⚠️ 이 사이트는 공개 웹에 올라갑니다.
      기관 내부 사정 · 직원 수 · 지원금 · 진단 결과는 절대 넣지 마세요.
      그런 내용은 진단보고서(비공개)에만 둡니다.
   =================================================================== */

const META = {
  title: "구글 워크스페이스와 AI 교육",
  subtitle: "수강생 학습 페이지",
  lecturer: "김종원 (소셜프리즘)",
  updated: "2026-09-20",
};

/* ───────────────────────────────────────────────────────────────────
   강사님이 직접 만드신 설치 영상 — 최상단 고정. 절대 빼지 말 것.
   방문 기관에는 미리 설치를 요청하시지만, 아직 설치하지 않은 기관이
   반드시 있습니다. 이 영상이 그분들의 출발점입니다.

   🔁 강사님이 1년에 한 번쯤 새로 찍어 올리십니다.
      갱신할 때는 아래 id 와 t(제목)만 바꾸면 끝입니다.
   ─────────────────────────────────────────────────────────────────── */
const INTRO_VIDEO = {
  id: "GCd7QG170Q8",
  t: "2026년 비영리단체용 Google Workspace 설치 방법 (goodstack 인증 버전)",
  desc: "아직 기관 계정을 만들지 않으셨다면 여기부터 시작하세요. 강사님이 직접 만드신 영상이고, 해마다 최신 화면으로 새로 올라옵니다.",
  year: "2026",
};

/* 강사님이 현장에서 하신 말씀 — 대화록에서 그대로 옮긴 것 */
const QUOTES = [
  {
    text: "출근 시간, 퇴근 시간. 이 말은 시간을 통제하는 말이고 공간을 통제하는 말이에요. 그런데 스마트워크는 이걸 흐트려 놓는 말이죠.",
    where: "2026-08 · 1차 진단 회차",
  },
  {
    text: "요런 얘기의 핵심은 뭐냐면, 시간 선택과 공간 선택을 직원이 할 수 있다는 거예요.",
    where: "2026-08 · 1차 진단 회차",
  },
  {
    text: "스마트워크는 한 번의 교육으로 완성되는 것이 아니라, 기관 내부에서 지속적으로 이야기 나누고 시도해 보는 문화가 정착되어야 합니다.",
    where: "2026-09 · 진단 회차",
  },
  {
    text: "작은 데서부터 무엇을 변화할 것인가. 하다못해 캘린더 하나만 이번 교육을 통해 잡고 가도, 일정 관리 이런 것만 편해지면 너무 좋잖아요.",
    where: "2026-08 · 1차 진단 회차",
  },
  {
    text: "회사의 업무들이 개인 계정으로 가는 것 자체가 유출로 볼 수도 있습니다.",
    where: "2026-08 · 개인 계정과 기관 계정을 나누는 이유",
  },
];

/* ───────────────────────────────────────────────────────────────────
   지금까지 실제로 강의한 항목 (2026-09-20 기준: 「기초 설명」까지)

   👉 회차가 끝날 때마다 여기에 항목 id 만 추가하면
      일정표에 「진행함」 표시가 켜지고 진도 막대가 올라갑니다.
      예) TAUGHT = ["a01", "a05", "a02"];
   ─────────────────────────────────────────────────────────────────── */
const TAUGHT = ["a01"];

/* 회기 유형 — curriculum.md 와 같은 내용 */
const TYPES = [
  { name: "기반형", n: 14, desc: "A트랙 위주 + B트랙 최소" },
  { name: "운영형", n: 18, desc: "A트랙은 웬만큼 다 + B트랙 일부" },
  { name: "확장형", n: 22, desc: "일정표를 거의 다" },
];

/* ===================================================================
   목차 23항목
   status: "ready"  = 영상·문서가 채워짐
           "own"    = 강사님 고유 커리큘럼 (외부 영상으로 대체 불가)
           "check"  = 강사님 확인이 필요한 항목
   =================================================================== */

const CURRICULUM = [
  /* ---------- A트랙 : 구글 워크스페이스 기초 (전체 인원) ---------- */
  {
    id: "a01", track: "A", no: 1, title: "기초 설명", status: "ready",
    blurb: "스마트워크가 무엇인지, 왜 개인 계정과 기관 계정을 나눠야 하는지부터 시작합니다.",
    videos: [
      { t: "비영리단체용 Google Workspace 설치 방법 (2026 · 강사님 영상)", id: "GCd7QG170Q8" },
      { t: "비영리단체용 Google Workspace 가입 방법 (2021년 버전 · 참고)", id: "v2XrHWAbZk4" },
    ],
    docs: [
      { t: "Google for Nonprofits 안내", u: "https://www.google.com/nonprofits/" },
    ],
    notes: [
      "개인 계정과 기관 계정을 나누는 것이 보안의 출발점입니다.",
      "직원이 퇴사할 때 자료가 어디에 남는지가 기관의 실력입니다.",
    ],
  },
  {
    id: "a02", track: "A", no: 2, title: "구글 드라이브 (데스크톱용)", status: "ready",
    blurb: "내 PC 탐색기에서 바로 구글 드라이브를 쓰는 방법. 공유 드라이브가 핵심입니다.",
    videos: [
      { t: "구글 드라이브와 데스크톱용 드라이브의 활용", id: "O6ZGJrWxs38" },
      { t: "구글 드라이브로 문서 자료 관리하기", id: "GpaJ-0-pLkI" },
    ],
    docs: [
      { t: "데스크톱용 Google Drive 사용하기", u: "https://support.google.com/drive/answer/7329379?hl=ko" },
      { t: "공유 드라이브란?", u: "https://support.google.com/a/users/answer/9310351?hl=ko" },
    ],
    notes: [
      "개인 드라이브가 아니라 공유 드라이브에 두어야 사람이 바뀌어도 자료가 남습니다.",
      "폴더를 만들기 전에 '정리하는 규칙'을 먼저 정하는 것이 순서입니다.",
    ],
  },
  {
    id: "a03", track: "A", no: 3, title: "구글 문서 편집기", status: "ready",
    blurb: "문서·스프레드시트·프레젠테이션을 여럿이 동시에 고치는 방법.",
    videos: [
      { t: "누구나 쉽게 배우는 구글 오피스 (문서·시트·프레젠테이션)", id: "ajAIItxxTcg" },
      { t: "구글 문서도구 — 공유와 협업", id: "lQ-lQKfZuyo" },
    ],
    docs: [
      { t: "Google 문서 시작하기", u: "https://support.google.com/docs/answer/7068618?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a04", track: "A", no: 4, title: "구글 캘린더", status: "ready",
    blurb: "일정을 모두 캘린더에 올려 함께 보는 것. 회의실·차량 같은 리소스 예약도 여기서 합니다.",
    videos: [
      { t: "구글 캘린더 핵심 사용법 10가지", id: "6YkR-dOJQFE" },
      { t: "구글 캘린더와 태스크로 업무 시간관리하기", id: "roe4S7zmzOk" },
    ],
    docs: [
      { t: "Google 캘린더 시작하기", u: "https://support.google.com/calendar/answer/2465776?hl=ko" },
      { t: "회의실·리소스 예약하기", u: "https://support.google.com/a/answer/1033925?hl=ko" },
    ],
    notes: [
      "캘린더를 남에게 보여주기 위해서가 아니라 자기를 위해 써야 합니다.",
      "일정을 다 올리고 역할까지 나눠 주면 그때부터 기초가 섭니다.",
    ],
  },
  {
    id: "a05", track: "A", no: 5, title: "관리 콘솔", status: "ready",
    blurb: "기관 계정 전체를 관리하는 곳. 강사님이 교육을 관리 콘솔 설정부터 시작하시는 이유입니다.",
    videos: [
      { t: "Google Workspace 초기 환경 구성 — 관리 콘솔 개요", id: "LvUWamu8dDc" },
      { t: "Google Workspace 관리콘솔 알아보기", id: "SMPZFwzQmrg" },
      { t: "관리자 역할과 사용자 계정 관리", id: "rQLZ4DTLmpg" },
    ],
    docs: [
      { t: "관리 콘솔 시작하기", u: "https://support.google.com/a/answer/182076?hl=ko" },
    ],
    notes: [
      "\"왜냐하면 관리 콘솔 설정부터 제가 알려드리거든요.\" — 교육의 첫 단추입니다.",
      "오피스 설문지를 써 봤다고 관리 콘솔을 다룰 수 있는 것은 아닙니다. 다른 영역입니다.",
    ],
  },
  {
    id: "a06", track: "A", no: 6, title: "구글 킵, 구글 지도", status: "ready",
    blurb: "메모를 흘리지 않는 법(킵)과 기관·이용자 위치를 지도로 관리하는 법(내 지도).",
    videos: [
      { t: "메모장 끝판왕! 구글 Keep 사용법", id: "aEBqz58aNqo" },
      { t: "구글킵 13가지 활용법", id: "UiCWrTGeDMo" },
      { t: "구글 내 지도 기본기능 살펴보기", id: "VEqaqDq4rlc" },
    ],
    docs: [
      { t: "Google Keep 사용하기", u: "https://support.google.com/keep/answer/2888240?hl=ko" },
      { t: "내 지도(My Maps) 만들기", u: "https://support.google.com/mymaps/answer/3024396?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a07", track: "A", no: 7, title: "사이트 도구", status: "ready",
    blurb: "코딩 없이 기관 홈페이지·내부 안내 페이지를 만드는 도구.",
    videos: [
      { t: "Google Workspace 시작하기 — 홈페이지 제작도구 사이트 도구", id: "-zQDpm0env0" },
      { t: "누구나 100% 따라 만드는 Google Sites 만들기", id: "IllRuTgMqOY" },
    ],
    docs: [
      { t: "Google 사이트 도구 시작하기", u: "https://support.google.com/sites/answer/98081?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a08", track: "A", no: 8, title: "구글 미트, 구글 비즈(Vids)", status: "ready",
    blurb: "화상회의(미트)와 AI 동영상 제작(비즈). 기관 소개·교육 영상을 직접 만들 수 있습니다.",
    videos: [
      { t: "구글 미트 무료 사용법 (PC 기초)", id: "LBH9AW74j5U" },
      { t: "구글 미트 회의 예약하기", id: "MBdqSTiKhD4" },
      { t: "구글비즈 왕초보 가이드 — 구글이 만든 무료 AI 영상 편집도구", id: "fAZ91MJP9qk" },
      { t: "구글 비즈(Google Vids) 사용법 완벽 가이드", id: "ODeSuIaiEDk" },
    ],
    docs: [
      { t: "Google Meet 시작하기", u: "https://support.google.com/meet/answer/9302870?hl=ko" },
      { t: "Google Vids 도움말", u: "https://support.google.com/vids?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a09", track: "A", no: 9, title: "지메일", status: "ready",
    blurb: "라벨과 필터로 받은편지함을 정리하는 법.",
    videos: [
      { t: "지메일 라벨 만들기 / 필터 적용하기", id: "4NxaRkKzbw8" },
      { t: "Gmail 사용자 87%가 모르는 효과적인 이메일 사용법 20가지", id: "HiZZ8nuBgJA" },
    ],
    docs: [
      { t: "Gmail 라벨 만들기", u: "https://support.google.com/mail/answer/118708?hl=ko" },
      { t: "Gmail 필터 만들기", u: "https://support.google.com/mail/answer/6579?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a10", track: "A", no: 10, title: "구글 설문지", status: "ready",
    blurb: "만족도 조사·신청서·내부 취합. 응답이 바로 스프레드시트로 쌓입니다.",
    videos: [
      { t: "구글 설문지 Google Forms 완벽 해부", id: "SniQA3lziLo" },
      { t: "구글 설문지 AI 활용 가이드", id: "hpGZZPFp6OM" },
    ],
    docs: [
      { t: "Google 설문지 시작하기", u: "https://support.google.com/docs/answer/6281888?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a11", track: "A", no: 11, title: "구글 포토", status: "ready",
    blurb: "행사 사진을 개인 휴대폰에 묵히지 않고 기관 자산으로 모으는 법.",
    videos: [
      { t: "구글 포토 사용법", id: "I5R2Fxt7fA8" },
      { t: "구글포토 백업 — 전체 사진 PC로 내려받기", id: "Lefa-hCuwhM" },
      { t: "PC와 스마트폰의 백업·동기화 차이 이해하기", id: "e3EmXf4VLOw" },
    ],
    docs: [
      { t: "Google 포토 백업 설정", u: "https://support.google.com/photos/answer/6193313?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "a12", track: "A", no: 12, title: "구글 챗, 슬랙", status: "ready",
    blurb: "업무 연락을 개인 메신저에서 분리하는 일. 여러 기관이 이 항목을 가장 먼저 요청하셨습니다.",
    videos: [
      { t: "2024년 최신 구글 Chat 스페이스 사용방법", id: "_dCNTk0fbew" },
      { t: "슬랙의 개요 및 사용법 알아보기 (1강)", id: "Pj9t-_GwJQw" },
      { t: "슬랙 기업용 메신저 사용방법", id: "ZVlhsG6J7i8" },
    ],
    docs: [
      { t: "Google Chat 도움말", u: "https://support.google.com/chat/?hl=ko" },
      { t: "Slack 시작하기 (한국어)", u: "https://slack.com/intl/ko-kr/help/categories/360000049043" },
    ],
    notes: [
      "업무 연락과 개인 연락을 나누는 것이 첫 목표입니다.",
    ],
  },

  /* ---------- B트랙 : 에이전트 기반 업무 자동화 (일부 인원) ---------- */
  {
    id: "b01", track: "B", no: 1, title: "구글 AI 스튜디오 바이브 코딩", status: "ready",
    blurb: "말로 설명하면 앱이 만들어집니다. 무료로 시작할 수 있는 입구입니다.",
    videos: [
      { t: "확 달라진 구글 AI 스튜디오로 바이브 코딩하기 (초보자용)", id: "DQV06YYH9Ck" },
      { t: "말 한마디로 앱 만든다 — Google AI Studio Build 실습", id: "3IITukX8r8Q" },
    ],
    docs: [
      { t: "Google AI Studio", u: "https://aistudio.google.com/" },
    ],
    notes: [],
  },
  {
    id: "b02", track: "B", no: 2, title: "깃허브 + 버셀 배포", status: "ready",
    blurb: "만든 것을 남이 볼 수 있는 주소로 올리는 일. 지금 보고 계신 이 페이지도 이 방법으로 올라갑니다.",
    videos: [
      { t: "프론트엔드 앱을 GitHub와 Vercel에 무료로 호스팅하기", id: "cpzeO67w4oc" },
      { t: "Vercel로 내가 만든 웹 사이트 배포하기", id: "GX9QbJiiQyQ" },
    ],
    docs: [
      { t: "Vercel 시작하기", u: "https://vercel.com/docs/getting-started-with-vercel" },
      { t: "GitHub 시작하기", u: "https://docs.github.com/ko/get-started" },
    ],
    notes: [],
  },
  {
    id: "b03", track: "B", no: 3, title: "구글 스프레드시트 기초 (앱스 스크립트)", status: "ready",
    blurb: "시트가 곧 데이터베이스입니다. 앱스 스크립트를 붙이면 그 자리에서 자동화가 됩니다.",
    videos: [
      { t: "구글 스프레드시트 가장 기초적인 기능 및 사용법", id: "vegBYv_RlMU" },
      { t: "스프레드시트 작업 자동화 — 앱스 스크립트", id: "8Xd7ymswbXU" },
      { t: "구글 Apps Script 완전 자동화 꿀팁 5분", id: "tKNVipkqG8Y" },
    ],
    docs: [
      { t: "Google Apps Script 공식 문서", u: "https://developers.google.com/apps-script?hl=ko" },
    ],
    notes: [
      "예전에는 함수를 많이 가르쳤지만, 지금은 계산을 사람이 할 이유가 줄었습니다.",
      "강사님 시연: 스프레드시트의 내용을 캘린더 일정으로 자동 등록하고, 반대로 캘린더를 시트로 내보내기.",
    ],
  },
  {
    id: "b04", track: "B", no: 4, title: "에이전트 AI 도구 (코덱스, 클로드)", status: "ready",
    blurb: "지시를 내리면 스스로 일하는 도구. 비개발자도 쓸 수 있습니다.",
    videos: [
      { t: "Claude Code 왕초보 입문 튜토리얼", id: "1_bRmkUvjHA" },
      { t: "비개발자를 위한 클로드 코드 입문", id: "HyMgKcuhE-s" },
      { t: "비개발자가 자주 묻는 Claude Code FAQ 5개", id: "UNd1Cb5aIoU" },
    ],
    docs: [
      { t: "Claude Code 공식 문서", u: "https://docs.claude.com/en/docs/claude-code/overview" },
    ],
    notes: [
      "기관 계정으로 가입하면 개인 계정보다 싸고, 자료가 밖으로 새지 않습니다.",
    ],
  },
  {
    id: "b05", track: "B", no: 5, title: "업무 자동화", status: "ready",
    blurb: "매달 손으로 하던 일을 한 번 만들어 두고 쓰는 일. 강사님 현장 시연이 중심입니다.",
    videos: [
      { t: "구글 Apps Script 완전 자동화 꿀팁 5분", id: "tKNVipkqG8Y" },
      { t: "스프레드시트 작업 자동화 — 앱스 스크립트", id: "8Xd7ymswbXU" },
    ],
    docs: [
      { t: "Apps Script 트리거 (자동 실행)", u: "https://developers.google.com/apps-script/guides/triggers?hl=ko" },
    ],
    notes: [
      "자동화는 새 도구를 까는 일이 아니라, 이미 있는데 안 보이던 것을 보이게 하는 일입니다.",
    ],
  },
  {
    id: "b06", track: "B", no: 6, title: "바이브 코딩 1 (파이어베이스)", status: "ready",
    blurb: "데이터가 쌓이는 앱을 만드는 단계. 로그인·저장이 되는 진짜 앱입니다.",
    videos: [
      { t: "구글 Firebase Studio 사용법 — 코딩 몰라도 AI로 앱 개발", id: "0A45kpsOCPY" },
      { t: "배포를 아직도 못해? Firebase Studio 입문", id: "nroyeDbMNi0" },
    ],
    docs: [
      { t: "Firebase 공식 문서", u: "https://firebase.google.com/docs?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "b07", track: "B", no: 7, title: "바이브 코딩 2 (API 사용)", status: "own",
    blurb: "다른 서비스와 주고받게 만드는 단계. 강사님 실습 중심 회차입니다.",
    videos: [
      { t: "확 달라진 구글 AI 스튜디오로 바이브 코딩하기", id: "DQV06YYH9Ck" },
    ],
    docs: [
      { t: "Gemini API 시작하기", u: "https://ai.google.dev/gemini-api/docs?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "b08", track: "B", no: 8, title: "멀티 에이전트 만들기", status: "ready",
    blurb: "일을 나눠 맡는 여러 에이전트를 두는 방법.",
    videos: [
      { t: "클로드 스킬·서브에이전트·커맨드 개념 정리", id: "2eqPBLgVH0U" },
      { t: "서브에이전트 모르면 클로드 코드 돈 버리는 겁니다", id: "Qr3pyVpd8CY" },
    ],
    docs: [
      { t: "서브에이전트 공식 문서", u: "https://docs.claude.com/en/docs/claude-code/sub-agents" },
    ],
    notes: [],
  },
  {
    id: "b09", track: "B", no: 9, title: "Google Workspace CLI 배우기", status: "own",
    blurb: "명령어로 워크스페이스를 다루는 단계. 강사님 고유 커리큘럼이라 현장 실습으로만 배웁니다.",
    videos: [],
    docs: [
      { t: "Google Workspace 개발자 가이드", u: "https://developers.google.com/workspace/guides/get-started?hl=ko" },
    ],
    notes: [],
  },
  {
    id: "b10", track: "B", no: 10, title: "에이전틱 AI 서버 만들기", status: "own",
    blurb: "내 기관 안에서 도는 에이전트를 세우는 단계. 강사님 고유 커리큘럼입니다.",
    videos: [],
    docs: [
      { t: "Model Context Protocol (MCP)", u: "https://modelcontextprotocol.io/" },
    ],
    notes: [],
  },
  {
    id: "b11", track: "B", no: 11, title: "나만의 외장 두뇌 만들기", status: "own",
    blurb: "내 일을 기억하는 비서를 두는 마지막 단계. 강사님 고유 커리큘럼입니다.",
    videos: [],
    docs: [],
    notes: [
      "강사님이 현장에서 보여 주시는 '호야'가 바로 이 항목의 결과물입니다.",
      "메신저는 창구일 뿐이고, 뒤에서 기록을 읽고 보고서를 만드는 쪽이 본체입니다.",
    ],
  },
];

/* ===================================================================
   기관 — 공개 웹에 올려도 되는 것만 (이름 · 유형 · 총 회기 · 단계)

   ⚠️ 여기에 회기 진행 숫자를 손으로 적지 마세요.
      같은 숫자를 여러 곳에 복제하면 반드시 어긋납니다(2026-09-11 사고).
      정확한 회기 수가 필요해지면 캘린더 전수 집계로 채워 넣겠습니다.

   stage: "진단"   = 1·2차 진단 단계
          "본교육" = 본교육 시작
          "완료"   = 회기 종료
   =================================================================== */
const ORGS = [
  { slug: "jungnim",   name: "중림종합사회복지관",         type: "확장형", quota: 22, stage: "진단" },
  { slug: "seouljang", name: "서울장애인종합복지관",       type: "확장형", quota: 22, stage: "진단" },
  { slug: "gangnam",   name: "강남노인종합복지관",         type: "확장형", quota: 22, stage: "진단" },
  { slug: "yeongnak",  name: "영락애니아의집",             type: "확장형", quota: 22, stage: "진단" },
  { slug: "noeseong",  name: "서울시립뇌성마비복지관",     type: "확장형", quota: 22, stage: "진단" },
  { slug: "baldal",    name: "서울시립발달장애인복지관",   type: "확장형", quota: 22, stage: "진단" },
  { slug: "junggok",   name: "중곡종합사회복지관",         type: "확장형", quota: 22, stage: "진단" },
  { slug: "geumcheon", name: "금천발달장애인주간보호센터", type: "운영형", quota: 18, stage: "진단" },
  { slug: "nowon1",    name: "노원1종합사회복지관",        type: "운영형", quota: 18, stage: "진단" },
  { slug: "mapo",      name: "마포시니어클럽",             type: "운영형", quota: 18, stage: "진단" },
  { slug: "gamchan",   name: "강감찬관악종합사회복지관",   type: "운영형", quota: 18, stage: "본교육" },
];

/* 자주 묻는 것 */
const FAQ = [
  {
    q: "우리 기관은 몇 회기인가요?",
    a: "기관이 신청한 유형에 따라 다릅니다. 기반형 14회기, 운영형 18회기, 확장형 22회기이고, 1회기는 2시간입니다. 아래 '기관별 진도'에서 확인하실 수 있습니다.",
  },
  {
    q: "A트랙과 B트랙 중 무엇을 들어야 하나요?",
    a: "A트랙(구글 워크스페이스 기초)은 전체 인원이 함께 듣습니다. B트랙(에이전트 기반 업무 자동화)은 일부 인원이 참여합니다.",
  },
  {
    q: "교육 전에 미리 해 둘 것이 있나요?",
    a: "기관 구글 워크스페이스 계정이 있어야 합니다. 맨 위 '시작하기' 영상대로 비영리단체용으로 가입하시면 됩니다.",
  },
  {
    q: "영상은 꼭 봐야 하나요?",
    a: "아닙니다. 수업에서 다룬 내용을 다시 보고 싶으실 때 참고하시라고 걸어 둔 것입니다. 외부에서 만든 영상이라 강사님 설명과 화면이 조금 다를 수 있습니다.",
  },
];
