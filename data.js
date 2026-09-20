/* ===================================================================
   구글 워크스페이스와 AI 교육 — 수강생 학습 페이지 데이터
   -------------------------------------------------------------------
   이 파일만 고치면 사이트 내용이 바뀝니다. HTML·CSS는 건드릴 필요 없습니다.

   전국 사회복지기관 교육 현장 어디서나 쓰는 범용 페이지입니다.
   특정 기관·특정 과정의 정보는 넣지 않습니다.

   고치는 법
     · 영상 추가      → videos 배열에 { t: "제목", id: "유튜브ID" } 한 줄
     · 강사님 정리 추가 → notes 배열에 "문장" 한 줄
     · 항목 추가·수정   → CURRICULUM 배열

   ⚠️ 이 사이트는 공개 웹에 올라갑니다.
      특정 기관 이름 · 내부 사정 · 직원 수 · 예산 · 진단 결과는 절대 넣지 마세요.
      수강생이 배우는 데 필요한 것만 둡니다.
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

/* 강사님이 강의 중에 하신 말씀 */
const QUOTES = [
  {
    text: "출근 시간, 퇴근 시간. 이 말은 시간을 통제하는 말이고 공간을 통제하는 말이에요. 그런데 스마트워크는 이걸 흐트려 놓는 말이죠.",
    where: "스마트워크의 정의",
  },
  {
    text: "요런 얘기의 핵심은 뭐냐면, 시간 선택과 공간 선택을 직원이 할 수 있다는 거예요.",
    where: "스마트워크의 정의",
  },
  {
    text: "스마트워크는 한 번의 교육으로 완성되는 것이 아니라, 내부에서 지속적으로 이야기 나누고 시도해 보는 문화가 정착되어야 합니다.",
    where: "교육을 대하는 자세",
  },
  {
    text: "작은 데서부터 무엇을 변화할 것인가. 하다못해 캘린더 하나만 이번 교육을 통해 잡고 가도, 일정 관리 이런 것만 편해지면 너무 좋잖아요.",
    where: "무엇부터 바꿀 것인가",
  },
  {
    text: "회사의 업무들이 개인 계정으로 가는 것 자체가 유출로 볼 수도 있습니다.",
    where: "개인 계정과 업무 계정을 나누는 이유",
  },
];

/* ───────────────────────────────────────────────────────────────────
   발표자료 「스마트워커는 관계를 꿈꾼다 4」 — 전체 79쪽
   강사 김종원 제작. 이미지는 img/slides/ 에 있습니다.
     보기용  img/slides/p01.jpg        (가로 1400)
     목록용  img/slides/thumb/p01.jpg  (가로 400)
   원본 PDF 를 새로 받으시면 bin/slides-to-site.py 를 다시 돌리면 됩니다.
   ─────────────────────────────────────────────────────────────────── */
const SLIDE_COUNT = 79;

/* 글자가 있는 쪽만 제목을 답니다. 없는 쪽은 그림이 곧 내용입니다. */
const SLIDE_TITLES = {
  1: "설치와 활용",
  2: "구글 워크스페이스를 알아봅시다. Dreamworker 김종원",
  5: "9시까지 출근해!",
  6: "SMARTWORK 리모트 워크",
  11: "1. 명확한 작업 범위 합의 2. 실시간 과정의 확인 전제",
  12: "스마트워크는? 일의 주도권을 실무자가 획득하는 일",
  14: "장소불문 이동/현장 집에서 직장에서",
  15: "서류위주 탁상업무 현장중심업무",
  16: "SMART WORK",
  17: "SMART WORK 관계",
  26: "정신적 합체",
  33: "한 사람당 최소 2개 이상의 기기",
  34: "기기 간의 연결",
  35: "클라우드",
  40: "NAS",
  41: "인터넷에서 만나는 모든 사람",
  42: "사람간의 느슨한 연결",
  43: "전화 견적문의 가안작성 시안확인 택배수령",
  46: "조직 빈번한 소통",
  49: "조직 내의 긴밀한 연결",
  54: "구글 도구와 MS 도구 대조표",
  57: "영리 — Microsoft 365 요금",
  58: "영리 — Google Workspace 요금",
  61: "그 밖의 도구 요금 (줌·어도비·슬랙)",
  62: "비영리 — Microsoft 365 요금",
  64: "비영리 드라이브 100TB",
  66: "전국 500여 사회복지기관 https://bit.ly/구글워크스페이스설치기관",
  67: "비영리단체용 가입 5단계",
  69: "장점 개인과 기관 구분 기관 내 통합 용량 확보 기관 내 관리 다양한 확장기능",
  70: "aaa@hanmail.net 홍길동",
  71: "aaa@center.or.kr 홍길동",
  72: "개인 Google Workspace",
  73: "용량 비교 — 공유 드라이브 100TB",
  75: "비영리단체에게 스마트워크가 필요한 이유",
  76: "효율적인 문서관리 (랜섬웨어)",
  78: "생산성",
  79: "조직 문화"
};

/* ───────────────────────────────────────────────────────────────────
   연결 3단계 그림 (기초 설명)
   발표자료 「스마트워커는 관계를 꿈꾼다 4」 33~49쪽의 뼈대를 옮긴 것입니다.
   색은 CSS 변수를 쓰므로 밝은 화면·어두운 화면 모두에서 읽힙니다.
   ─────────────────────────────────────────────────────────────────── */
const CONNECT_SVG = `
<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="연결의 세 단계: 기기 간의 연결, 사람 간의 느슨한 연결, 조직 내의 긴밀한 연결">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--fg-soft)"/>
    </marker>
  </defs>

  <!-- 1단계 : 기기 -->
  <g>
    <rect x="8" y="42" width="212" height="180" rx="14" fill="var(--bg-alt)" stroke="var(--line)"/>
    <text x="114" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="var(--brand)">1단계</text>
    <rect x="62" y="74" width="44" height="58" rx="5" fill="none" stroke="var(--fg-soft)" stroke-width="2"/>
    <rect x="128" y="88" width="28" height="44" rx="5" fill="none" stroke="var(--fg-soft)" stroke-width="2"/>
    <line x1="106" y1="103" x2="128" y2="110" stroke="var(--brand)" stroke-width="2"/>
    <text x="114" y="160" text-anchor="middle" font-size="15" font-weight="700" fill="var(--fg)">기기 간의 연결</text>
    <text x="114" y="182" text-anchor="middle" font-size="12.5" fill="var(--fg-soft)">한 사람당 최소 2대</text>
    <text x="114" y="201" text-anchor="middle" font-size="12.5" fill="var(--fg-soft)">바탕은 클라우드</text>
  </g>

  <!-- 2단계 : 사람 -->
  <g>
    <rect x="254" y="42" width="212" height="180" rx="14" fill="var(--bg-alt)" stroke="var(--line)"/>
    <text x="360" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="var(--brand)">2단계</text>
    <g stroke="var(--fg-soft)" stroke-width="1.6" stroke-dasharray="4 4" fill="none">
      <line x1="300" y1="82" x2="360" y2="112"/>
      <line x1="360" y1="112" x2="422" y2="80"/>
      <line x1="300" y1="82" x2="330" y2="130"/>
      <line x1="422" y1="80" x2="398" y2="132"/>
    </g>
    <g fill="var(--bg)" stroke="var(--fg-soft)" stroke-width="2">
      <circle cx="300" cy="82" r="9"/><circle cx="422" cy="80" r="9"/>
      <circle cx="330" cy="130" r="9"/><circle cx="398" cy="132" r="9"/>
    </g>
    <circle cx="360" cy="112" r="11" fill="var(--brand)"/>
    <text x="360" y="160" text-anchor="middle" font-size="15" font-weight="700" fill="var(--fg)">사람 간의 느슨한 연결</text>
    <text x="360" y="182" text-anchor="middle" font-size="12.5" fill="var(--fg-soft)">인터넷에서 만나는 모든 사람</text>
    <text x="360" y="201" text-anchor="middle" font-size="12.5" fill="var(--fg-soft)">구속은 없고 끊기지도 않는다</text>
  </g>

  <!-- 3단계 : 조직 -->
  <g>
    <rect x="500" y="42" width="212" height="180" rx="14" fill="var(--brand-soft)" stroke="var(--brand)"/>
    <text x="606" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="var(--brand)">3단계</text>
    <g stroke="var(--brand)" stroke-width="1.8" fill="none">
      <line x1="566" y1="80" x2="646" y2="80"/><line x1="566" y1="130" x2="646" y2="130"/>
      <line x1="566" y1="80" x2="566" y2="130"/><line x1="646" y1="80" x2="646" y2="130"/>
      <line x1="566" y1="80" x2="646" y2="130"/><line x1="646" y1="80" x2="566" y2="130"/>
      <line x1="566" y1="80" x2="606" y2="105"/><line x1="646" y1="130" x2="606" y2="105"/>
    </g>
    <g fill="var(--brand)">
      <circle cx="566" cy="80" r="9"/><circle cx="646" cy="80" r="9"/>
      <circle cx="566" cy="130" r="9"/><circle cx="646" cy="130" r="9"/>
      <circle cx="606" cy="105" r="9"/>
    </g>
    <text x="606" y="160" text-anchor="middle" font-size="15" font-weight="700" fill="var(--fg)">조직 내의 긴밀한 연결</text>
    <text x="606" y="182" text-anchor="middle" font-size="12.5" fill="var(--fg-soft)">소통이 빈번하다</text>
    <text x="606" y="201" text-anchor="middle" font-size="12.5" fill="var(--fg-soft)">업무 메신저를 따로 두는 이유</text>
  </g>

  <!-- 단계 사이 화살표 -->
  <line x1="226" y1="132" x2="246" y2="132" stroke="var(--fg-soft)" stroke-width="2" marker-end="url(#ar)"/>
  <line x1="472" y1="132" x2="492" y2="132" stroke="var(--fg-soft)" stroke-width="2" marker-end="url(#ar)"/>

  <!-- 아래 축 : 느슨함 → 긴밀함 -->
  <line x1="60" y1="252" x2="660" y2="252" stroke="var(--line)" stroke-width="2"/>
  <text x="60"  y="275" font-size="12.5" fill="var(--fg-soft)">느슨하다</text>
  <text x="660" y="275" font-size="12.5" fill="var(--fg-soft)" text-anchor="end">촘촘해진다</text>
</svg>`;

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
    blurb: "스마트워크가 무엇인지, 왜 개인 계정과 업무 계정을 나눠야 하는지부터 시작합니다.",

    /* lesson — 강의 녹음에서 옮긴 내용.
       said 는 강사님이 실제로 하신 말씀 그대로입니다. */
    lesson: [
      {
        h: "스마트워크는 시간과 공간을 흐트려 놓는 말이다",
        p: "출근 시간, 퇴근 시간. 이 두 마디가 우리의 시간과 공간을 붙들어 둡니다. 스마트워크는 그 둘을 느슨하게 푸는 말입니다. 그렇다고 일을 덜 하자는 뜻이 아닙니다. 성과는 그대로 내되, 언제 어디서 할지를 일하는 사람이 고를 수 있게 하자는 것입니다.",
        said: "이 말은 시간을 통제하는 말이고 공간을 통제하는 말이에요. 이게 있어야 만남이 이루어지고 이게 있어야 일이 진행돼요. 근데 스마트워크는 이걸 모호하게 하는 말이에요. 시간과 공간을 흐트려 놓는 말이죠.",
      },
      {
        h: "핵심은 '선택권이 누구에게 있는가'",
        p: "어떤 곳은 출근 시각을 직원이 고르고, 어떤 곳은 한 달에 한 번 재택을 씁니다. 제도의 이름이 무엇이든 핵심은 하나입니다 — 시간과 공간을 고르는 권한이 일하는 사람에게 있느냐.",
        said: "요런 얘기의 핵심은 뭐냐면 시간 선택과 공간 선택을 직원이 할 수 있다는 거예요.",
      },
      {
        h: "\"우리는 이용자가 있는데 어떻게 해?\" — 당연한 반문입니다",
        p: "재택이 자유로운 회사 이야기를 들으면 사회복지 현장에서는 곧바로 이런 생각이 듭니다. 우리는 이용자가 있고 지역이 있는데 어떻게 자리를 비우나. 강사님도 그 반문을 당연하게 여기십니다. 그래서 목표를 다르게 잡습니다. **자리를 비우는 것이 아니라, 그 자리에서 일을 끝내는 것.** 현장에서 기록하고 현장에서 마치면, 사무실로 돌아와 다시 하는 일이 사라집니다.",
        said: "우리는 장애인이 있고 지역이 있고 주민이 있는데 어떻게 해? 요런 생각 들 수 있어요. 당연한 생각이에요.",
      },
      {
        h: "연결의 세 단계 — 기기 → 사람 → 조직",
        p: "이 강의 전체를 꿰는 뼈대입니다. **연결은 세 단계로 올라가고, 올라갈수록 촘촘해집니다.**",
        svg: CONNECT_SVG,
        after: "**1단계 · 기기 간의 연결.** 한 사람이 최소 두 개 이상의 기기를 쓰는 세상입니다. 어느 것을 잡든 하던 일을 이어갈 수 있어야 합니다. 그 바탕이 **클라우드**입니다. 자료가 이 컴퓨터 안에만 있으면 1단계에서 막힙니다.\n\n**2단계 · 사람 간의 느슨한 연결.** 상대가 북극에 있어도 됩니다. 메일을 보내면 답이 오고, 시간을 맞추면 화상으로 만납니다. **구속은 없는데 끊기지도 않는** 상태 — 인터넷을 쓰는 것 자체가 이미 이 환경에 들어와 있는 것입니다.\n\n**3단계 · 조직 내의 긴밀한 연결.** 여기가 다릅니다. 조직 안에서는 **소통이 빈번합니다.** 느슨해도 되는 앞 두 단계와 달리 촘촘히 맞물려야 합니다. 구글 워크스페이스가 필요해지는 자리, 그리고 **업무 메신저를 따로 두어야 하는 이유**가 바로 여기입니다.\n\n개인 메신저 하나로 세 단계를 다 감당하려 하면 3단계에서 탈이 납니다. 휴가 중에 알림이 울리는 것이 그 증상입니다.",
        said: "1단계 기기 간의 연결. 한 사람이 두 개 이상 쓰는 세상에 연결해야 이 컴퓨터를 쓰든 저 컴퓨터를 쓰든 계속 일을 할 수 있는 거죠. 2단계 다른 사람과의 연결인데 그 사람이 북극에 있어도 되고 뉴질랜드에 있어도 돼요. 한마디로 말하면 느슨한 연결이에요. 구속은 없어. 하지만 연결은 돼요.",
      },
      {
        h: "스마트워크의 전제 두 가지",
        p: "시간과 공간을 푸는 데에는 조건이 붙습니다. **하나, 명확한 작업 범위 합의. 둘, 실시간 과정의 확인.** 이 둘이 없으면 스마트워크는 그냥 관리가 안 되는 상태가 됩니다. 도구를 먼저 깔 일이 아니라 이 합의를 먼저 해야 합니다.",
      },
      {
        h: "탁상업무에서 현장중심업무로",
        p: "스마트워크가 향하는 지점은 「서류 위주의 탁상업무」에서 「현장 중심 업무」로의 이동입니다. 장소를 불문하고 — 이동 중이든, 현장이든, 집이든, 직장이든 — 그 자리에서 일이 되게 하는 것입니다.",
      },
      {
        h: "휴대폰을 꺼내 최근 대화 다섯 사람을 보십시오",
        p: "강사님이 교육 첫머리에 자주 하시는 질문입니다. 대부분 회사 사람이 나옵니다. 친구·가족과 쓰려고 가입한 메신저가 실제로는 업무용이 되어 있고, 그래서 휴가 중에도 알림이 울립니다. 업무 계정을 따로 두는 일은 보안 이전에 **쉴 때 쉬기 위한 장치**입니다.",
        said: "핸드폰 다 꺼내봐요. 최근에 대화한 다섯 사람 누군지 봐봐요. 친구랑 가족인가요, 아니면 회사 사람인가요?",
      },
      {
        h: "개인 계정으로 일하는 것은 그 자체로 유출일 수 있다",
        p: "업무 자료가 개인 계정에 쌓이면, 그 사람이 떠날 때 자료도 함께 떠납니다. 기관 계정으로 일해야 사람이 바뀌어도 자료가 남습니다. 비영리단체는 구글 워크스페이스를 무료로 쓸 수 있으니 비용이 이유가 되지는 않습니다.",
        said: "회사의 업무들이 개인 계정으로 가는 것 자체가 유출로 볼 수도 있고, 정보 수집이나 이런 것들이 나중에 문제가 될 수 있겠다 싶어서.",
      },
      {
        h: "우리 기관은 어디쯤인가 — 스스로 물어볼 것들",
        p: "강사님이 첫 만남에서 짚으시는 질문들입니다. 답이 '아니오'라고 해서 문제는 아닙니다. 어디서 시작할지를 정하기 위한 것입니다.\n\n· 마이크로소프트 365를 쓰는가, 구글 워크스페이스를 쓰는가\n· 개인 계정과 업무 계정을 나눠 쓰는가\n· 직원이 퇴사할 때 자료를 정리하는 방법이 있는가\n· 2단계 인증을 쓰는가, 계정을 여럿이 돌려쓰지는 않는가\n· 폴더를 만들고 이름을 정하는 규칙이 있는가\n· 공용 저장 공간을 클라우드 방식으로 쓰고 있는가",
      },
      {
        h: "한 번 듣고 바로 되지는 않습니다",
        p: "강사님이 먼저 못을 박으시는 대목입니다. 교육 시간을 함께했다고 해서 다음 날부터 쓸 수 있게 되지는 않습니다. 기관 안에서 계속 이야기하고 시도해 보는 쪽이 훨씬 중요합니다.",
        said: "그 시간을 함께 했다고 당장 쓸 수 있다, 절대 그런 일은 없을 가능성이 커요.",
      },
    ],

    videos: [
      { t: "비영리단체용 Google Workspace 설치 방법 (2026 · 강사님 영상)", id: "GCd7QG170Q8" },
      { t: "비영리단체용 Google Workspace 가입 방법 (2021년 버전 · 참고)", id: "v2XrHWAbZk4" },
    ],
    docs: [
      { t: "Google for Nonprofits 안내", u: "https://www.google.com/nonprofits/" },
    ],
    notes: [],
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
    blurb: "업무 연락을 개인 메신저에서 분리하는 일. 현장에서 가장 많이 찾으시는 주제입니다.",
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

/* 자주 묻는 것 */
const FAQ = [
  {
    q: "이 페이지는 무엇인가요?",
    a: "강의에서 다루는 주제를 한자리에 모아 둔 학습 자료 모음입니다. 수업이 끝난 뒤 다시 찾아보실 때, 또는 못 들으신 부분을 채우실 때 쓰시면 됩니다.",
  },
  {
    q: "A트랙과 B트랙 중 무엇을 들어야 하나요?",
    a: "A트랙(구글 워크스페이스 기초)은 업무에 컴퓨터를 쓰는 분이라면 누구에게나 필요한 내용입니다. B트랙(에이전트 기반 업무 자동화)은 한 걸음 더 들어가는 과정으로, 관심 있는 분이 이어서 들으시면 됩니다.",
  },
  {
    q: "교육 전에 미리 해 둘 것이 있나요?",
    a: "구글 워크스페이스 계정이 있어야 합니다. 비영리단체라면 무료로 쓰실 수 있습니다. 맨 위 「시작하기」 영상대로 따라 하시면 됩니다.",
  },
  {
    q: "어떤 순서로 보면 좋을까요?",
    a: "A트랙을 번호 순서대로 보시면 됩니다. 급하시다면 「관리 콘솔」과 「구글 드라이브(데스크톱용)」 둘만 먼저 보셔도 업무가 꽤 달라집니다.",
  },
  {
    q: "영상은 꼭 봐야 하나요?",
    a: "아닙니다. 수업에서 다룬 내용을 다시 보고 싶으실 때 참고하시라고 걸어 둔 것입니다. 외부에서 만든 영상이라 강사님 설명과 화면이 조금 다를 수 있습니다.",
  },
];
