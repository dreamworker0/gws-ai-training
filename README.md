# 구글 워크스페이스와 AI 교육 — 수강생 학습 페이지

교육을 듣는 분들이 보시는 페이지입니다. 강사 김종원(소셜프리즘).

🌐 **https://dreamworker0.github.io/gws-ai-training/**

**전국 사회복지기관 어디에 출강하든 그대로 쓰는 범용 페이지입니다.**
특정 기관 이름이나 특정 과정의 진도는 담지 않습니다 — 그래야 어느 현장에서나 바로 안내할 수 있습니다.

- **강의 목차 23항목** (A트랙 구글 워크스페이스 기초 12 + B트랙 에이전트 기반 업무 자동화 11)
- 항목마다 **강사님 현장 설명 정리 · 유튜브 영상 · 공식 문서** 세 칸
- 맨 위에 **비영리단체용 Google Workspace 설치 영상**(강사님 제작) 고정

---

## 무엇을 고치면 되나

거의 모든 내용이 **`data.js` 한 파일**에 있습니다. HTML·CSS는 건드릴 필요가 없습니다.

| 하고 싶은 일 | 고칠 곳 |
|---|---|
| 강사님 설명 정리 추가 | 해당 항목의 `notes` 배열에 문장 한 줄 |
| 영상 추가·교체 | 해당 항목의 `videos` 배열에 `{ t: "제목", id: "유튜브ID" }` |
| 설치 영상 갱신 (해마다) | `INTRO_VIDEO` 의 `id` 와 `t` 만 교체 |
| 항목 추가·수정 | `CURRICULUM` 배열 |
| 자주 묻는 것 | `FAQ` 배열 |
| 제목·강사명·갱신일 | `META` |

**유튜브 ID 찾는 법** — 주소 `https://www.youtube.com/watch?v=GCd7QG170Q8` 에서 `v=` 뒤쪽이 ID입니다.

---

## ⚠️ 공개 웹입니다

이 사이트는 누구나 볼 수 있고, 여러 기관의 수강생이 같은 주소를 봅니다.
**다음은 절대 넣지 마세요.**

- 특정 기관 이름, 내부 사정, 직원 수, 예산
- 진단 결과, 참석자 이름·직함
- 대화록 원문
- 특정 과정의 진도나 일정

그런 내용은 비공개 기록에만 둡니다. 여기에는 **배우는 데 필요한 것**만 둡니다.

---

## 링크 점검

영상은 삭제되고 구글 도움말 주소는 조용히 바뀝니다. 죽은 링크가 쌓이면
사이트 전체가 방치된 것처럼 보이므로 자동으로 점검합니다.

```bash
node scripts/check.mjs
```

74건 전부 확인하는 데 1분이 채 걸리지 않습니다. 하나라도 죽어 있으면
어느 항목의 무엇인지 짚어 주고 실패합니다.

**GitHub Actions**(`.github/workflows/check.yml`)가 같은 검사를 자동으로 돌립니다.

- `data.js` 를 고쳐 올릴 때마다
- **매주 월요일 아침 7시**(한국시간) — 예전에 멀쩡했던 영상이 사라진 것을 잡습니다
- 주간 점검에서 죽은 링크가 나오면 **이슈를 하나 열고**, 이미 열려 있으면 거기에 댓글을 답니다

### 러너 바꾸기

기본은 GitHub이 빌려주는 `ubuntu-latest` 입니다. 따로 설정할 것이 없습니다.

내 컴퓨터에 붙인 러너로 돌리시려면 저장소
**Settings → Secrets and variables → Actions → Variables** 에서
`RUNNER_LABEL` 을 `self-hosted` 로 두시면 됩니다. 워크플로 파일은 고치지 않아도 됩니다.

---

## 배포

### GitHub Pages (지금 쓰는 곳)

<https://dreamworker0.github.io/gws-ai-training/> — `main` 에 올리면 1~2분 뒤 자동으로 반영됩니다.
따로 할 일은 없습니다.

### Vercel (연결하면 이쪽으로 옮길 수 있음)

GitHub 저장소를 Vercel에 연결해 두면 **main 에 올릴 때마다 자동 배포**됩니다.
빌드 과정이 없는 정적 사이트라 Vercel 설정에서 고를 것도 없습니다.

- Framework Preset: **Other**
- Build Command: 비워 둠
- Output Directory: 비워 둠

## 로컬에서 보기

```bash
python -m http.server 4173
```

`data.js` 를 `fetch` 하지 않고 `<script>` 로 읽기 때문에
파일을 그냥 열어도(`file://`) 대부분 동작하지만, 서버로 띄우는 편이 확실합니다.

---

## 파일

```
index.html              화면 뼈대
style.css               모양 (밝은 화면·어두운 화면 모두 대응)
data.js                 ← 내용은 전부 여기
app.js                  화면 그리기
favicon.svg             브라우저 탭과 북마크용 드림워크 표식
img/dreamwork-archive-hero.png  홈 대표 이미지
img/dreamwork-og.png    링크 공유용 1200×630 미리보기
scripts/build-social-assets.py 대표 이미지에서 공유 이미지를 다시 만드는 도구
scripts/design-contract.test.mjs 디자인·메타데이터 계약 점검
scripts/check.mjs       링크 생존 점검
.github/workflows/      주간 자동 점검
```

## 디자인 자산과 점검

홈은 드림워크의 교육 분야, 학습 아카이브, 관점과 문의를 한 흐름으로 보여 줍니다.
대표 이미지가 바뀌면 아래 명령으로 오픈 그래프 이미지를 다시 만들 수 있습니다.

```bash
python scripts/build-social-assets.py
node scripts/design-contract.test.mjs
node scripts/check.mjs
```

`index.html`의 Open Graph와 Twitter 메타데이터는 GitHub Pages의 공개 주소와
`img/dreamwork-og.png`를 사용합니다.
