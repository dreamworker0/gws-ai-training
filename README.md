# GWS & AI 교육 아카이브

사회복지 현장의 Google Workspace와 AI 교육을 복습하는 공개 학습 페이지입니다.

사이트: <https://dreamworker0.github.io/gws-ai-training/>

현재 7개 분야에 30개 주제가 있고, 주제별로 강의 정리·발표자료·추천 영상·공식 문서를 연결합니다. 모든 기관의 수강생이 같은 주소를 사용하므로 특정 기관의 진도나 내부 기록은 넣지 않습니다.

## 내용 수정

| 수정할 내용 | 파일 |
|---|---|
| 분야의 이름과 주제 순서 | `data.js`의 `GROUPS` |
| 주제 설명, 강의 정리, 영상, 공식 문서 | `data.js`의 `CURRICULUM` |
| 발표자료와 주제 연결 | `data.js`의 `DECKS`, `ITEM_SLIDES`, `SLIDE_TITLES` |
| 자주 묻는 질문과 사이트 표시 이름 | `data.js`의 `FAQ`, `META` |
| 화면 동작과 모양 | `app.js`, `ui-state.js`, `style.css` |

주제를 추가하면 `CURRICULUM`에 정의하고 `GROUPS`의 한 분야에 ID를 정확히 한 번 넣습니다. 발표자료가 있다면 `ITEM_SLIDES`에 `덱ID:쪽번호` 형식으로 연결합니다. `scripts/design-contract.test.mjs`와 `scripts/routes.test.mjs`가 누락·중복·범위를 확인합니다.

## 발표자료 추가

원본 PDF는 사이트 Git 저장소 밖의 `발표자료폴더`에 둡니다. 변환 도구는 같은 작업공간의 `bin/slides-to-site.py`입니다. 이 도구의 `DECKS`에 `(덱ID, 표시 제목, PDF 상대 경로)`를 넣습니다. `_재작업/A04_구글캘린더_v2.pdf`처럼 하위 폴더도 `발표자료폴더` 기준 상대 경로로 적을 수 있습니다.

사이트 저장소 루트에서 실행할 때 출력 디렉터리를 명시합니다.

```powershell
python ../../bin/slides-to-site.py img/slides
```

별도 Git worktree에서 작업 중이라면 `bin/slides-to-site.py`의 절대 경로를 사용하고 출력은 해당 worktree의 `img/slides`로 지정합니다. 변환 도구는 각 덱에 보기용 JPEG, 썸네일, `captions.json`을 만들고 `img/slides/decks.json`을 갱신합니다. PDF에 추출 가능한 텍스트가 없으면 캡션이 빈 문자열일 수 있으므로 실제 페이지를 보고 `SLIDE_TITLES`를 작성합니다.

현재 연결한 새 원본은 A04 캘린더 9쪽, A06 구글 킵·내 지도 8쪽, A12 Google Chat·Slack 7쪽입니다. A06은 1~4쪽을 `a06`, 5~8쪽을 `a06-map`에 연결합니다.

## 로컬 확인

```powershell
python -m http.server 4173
```

브라우저에서 <http://localhost:4173/>을 엽니다. 모바일에서는 검색과 메뉴를 접어 두고, 학습 분야는 첫 분야만 기본으로 펼칩니다.
`태그로 찾기`에서는 강의 항목에 붙은 태그를 최대 세 개 골라 공통 항목을 볼 수 있습니다. 발표자료·영상·문서는 상단 글자 검색을 사용합니다.

변경 후 다음 검사를 실행합니다.

```powershell
node scripts/design-contract.test.mjs
node scripts/ui-behavior.test.mjs
node scripts/graph.test.mjs
node scripts/tag-search.test.mjs
node scripts/routes.test.mjs
node scripts/privacy.test.mjs
node scripts/check.mjs
node scripts/stamp.mjs --check
```

`check.mjs`는 현재 등록된 외부 링크를 검사하므로 네트워크 연결이 필요합니다. `.github/workflows/check.yml`도 데이터 변경과 정기 일정에 맞춰 링크를 점검합니다. `stamp.mjs`는 CSS와 JavaScript의 캐시 버전을 동기화하며 설치된 커밋 훅에서 자동 실행됩니다.

## 공개 데이터 원칙

특정 기관 이름·진도·내부 사정, 참여자 이름과 직함, 대화록 원문을 공개 데이터에 넣지 않습니다. 기관별 내용은 비공개 기록에 두고, 이 사이트에는 누구나 복습하는 데 필요한 자료만 둡니다.

## 배포

GitHub Pages는 `main` 브랜치의 정적 파일을 제공합니다. 원격 저장소에 올리기 전에 위 검사와 데스크톱·390px 모바일 화면에서 검색, 발표자료, 다크 모드, 잘못된 주소 안내를 확인합니다.
