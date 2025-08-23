(function () {
  const STATION_AREA = "삼성역";
  const SETTINGS_KEY = "lunchSettingsV1";
  const LAST_PICK_KEY = "lunchLastPickV1";

  /** @typedef {{id:string,name:string,category:string,priceTier:1|2|3,isSpicy:boolean,description:string,keywords?:string[]}} MenuItem */

  /** @type {MenuItem[]} */
  const MENU_ITEMS = [
    { id: "kimbap", name: "김밥/분식", category: "분식/패스트푸드", priceTier: 1, isSpicy: false, description: "김밥, 떡튀순으로 간단히 해결" , keywords:["김밥","분식","분식집"]},
    { id: "tteokbokki", name: "떡볶이", category: "분식/패스트푸드", priceTier: 1, isSpicy: true, description: "칼칼하게 당기는 매콤달콤 떡볶이" },
    { id: "kalguksu", name: "칼국수", category: "면/국물", priceTier: 1, isSpicy: false, description: "담백한 면과 진한 국물 한 그릇" },
    { id: "naengmyeon", name: "냉면", category: "면/국물", priceTier: 2, isSpicy: false, description: "시원하게 당기는 점심 냉면" },
    { id: "guksu", name: "잔치국수", category: "면/국물", priceTier: 1, isSpicy: false, description: "가볍게 후루룩 국수" },
    { id: "jjigae", name: "김치찌개", category: "한식", priceTier: 1, isSpicy: true, description: "밥도둑의 정석, 칼칼한 김치찌개" },
    { id: "doenjang", name: "된장찌개", category: "한식", priceTier: 1, isSpicy: false, description: "구수한 된장향" },
    { id: "sundubu", name: "순두부", category: "한식", priceTier: 1, isSpicy: true, description: "보글보글 얼큰한 순두부" },
    { id: "baekban", name: "백반/집밥", category: "한식", priceTier: 1, isSpicy: false, description: "든든한 집밥 한 상" },
    { id: "bibimbap", name: "비빔밥", category: "한식", priceTier: 1, isSpicy: false, description: "야채 가득 비빔밥" },
    { id: "dakgalbi", name: "닭갈비", category: "한식", priceTier: 2, isSpicy: true, description: "철판에 볶아먹는 닭갈비" },
    { id: "bossam", name: "보쌈/족발", category: "한식", priceTier: 2, isSpicy: false, description: "촉촉한 수육과 쌈" },
    { id: "samgyupsal", name: "삼겹살", category: "한식", priceTier: 3, isSpicy: false, description: "고기는 언제나 진리" },
    { id: "hansang", name: "한정식", category: "한식", priceTier: 3, isSpicy: false, description: "격식 있게 한 끼" },
    { id: "sushi", name: "초밥", category: "일식", priceTier: 3, isSpicy: false, description: "회와 샤리의 조화" },
    { id: "donburi", name: "덮밥(가츠/사케/규)", category: "일식", priceTier: 2, isSpicy: false, description: "가성비 좋은 일식 덮밥" },
    { id: "ramen", name: "라멘", category: "일식", priceTier: 2, isSpicy: false, description: "진한 육수의 일본식 라멘" },
    { id: "udon", name: "우동", category: "일식", priceTier: 1, isSpicy: false, description: "담백한 우동 한 그릇" },
    { id: "tonkatsu", name: "돈까스", category: "일식", priceTier: 2, isSpicy: false, description: "바삭한 돈까스" },
    { id: "jjamppong", name: "짬뽕", category: "중식", priceTier: 2, isSpicy: true, description: "얼큰한 국물의 짬뽕" },
    { id: "jjajang", name: "짜장면", category: "중식", priceTier: 1, isSpicy: false, description: "달큰한 춘장 소스" },
    { id: "friedrice", name: "중식 볶음밥", category: "중식", priceTier: 1, isSpicy: false, description: "불맛 가득 볶음밥" },
    { id: "mara", name: "마라탕/마라샹궈", category: "중식", priceTier: 2, isSpicy: true, description: "화끈한 마라의 매력" },
    { id: "pizza", name: "피자", category: "양식", priceTier: 2, isSpicy: false, description: "치즈 듬뿍 피자" },
    { id: "pasta", name: "파스타", category: "양식", priceTier: 2, isSpicy: false, description: "토마토/크림/오일 파스타" },
    { id: "steak", name: "스테이크/그릴", category: "양식", priceTier: 3, isSpicy: false, description: "고급스럽게 즐기는 점심" },
    { id: "salad", name: "샐러드", category: "가벼운 한 끼", priceTier: 2, isSpicy: false, description: "가볍고 건강하게" },
    { id: "sandwich", name: "샌드위치", category: "가벼운 한 끼", priceTier: 1, isSpicy: false, description: "빵 사이에 든든함" },
    { id: "burger", name: "버거", category: "분식/패스트푸드", priceTier: 2, isSpicy: false, description: "패티와 번의 클래식 조합" },
    { id: "mex", name: "브리또/타코", category: "양식", priceTier: 2, isSpicy: true, description: "살사 한 스푼의 매력" },
    { id: "vietnam", name: "쌀국수/분짜", category: "아시안", priceTier: 2, isSpicy: false, description: "향긋한 베트남식" },
    { id: "thai", name: "팟타이/똠얌", category: "아시안", priceTier: 2, isSpicy: true, description: "달콤매콤 타이푸드" },
    { id: "indian", name: "인도 커리/난", category: "아시안", priceTier: 2, isSpicy: true, description: "풍성한 향신료 커리" },
    { id: "koreanbbq", name: "불고기/직화구이", category: "한식", priceTier: 2, isSpicy: false, description: "불맛 가득 구이" },
    { id: "dongas", name: "경양식 돈가스", category: "양식", priceTier: 1, isSpicy: false, description: "추억의 경양식" },
    { id: "gimbap_special", name: "프리미엄 김밥", category: "가벼운 한 끼", priceTier: 2, isSpicy: false, description: "든든한 프리미엄 김밥" },
    { id: "soba", name: "소바", category: "일식", priceTier: 2, isSpicy: false, description: "시원한 메밀소바" },
    { id: "katsu_curry", name: "카츠카레/카레", category: "일식", priceTier: 2, isSpicy: false, description: "바삭 카츠 + 카레" },
    { id: "dak_bokkeum", name: "닭볶음탕", category: "한식", priceTier: 2, isSpicy: true, description: "밥 비벼먹기 좋은 국물" },
    { id: "jjigae_soup", name: "부대찌개", category: "한식", priceTier: 2, isSpicy: true, description: "푸짐한 햄과 라면사리" },
    { id: "gopchang", name: "곱창/막창", category: "한식", priceTier: 3, isSpicy: false, description: "쫄깃한 내장구이" },
    { id: "jokbal", name: "족발", category: "한식", priceTier: 2, isSpicy: false, description: "쫀득쫀득 콜라겐" },
    { id: "dessert", name: "빵/디저트", category: "카페/디저트", priceTier: 1, isSpicy: false, description: "달달한 디저트로 가볍게" }
  ];

  const dom = {
    category: document.getElementById("category"),
    price: document.getElementById("price"),
    excludeSpicy: document.getElementById("excludeSpicy"),
    randomButton: document.getElementById("randomButton"),
    rerollButton: document.getElementById("rerollButton"),
    shareButton: document.getElementById("shareButton"),
    resultCard: document.getElementById("resultCard"),
    resultTitle: document.getElementById("resultTitle"),
    resultMeta: document.getElementById("resultMeta"),
    resultDesc: document.getElementById("resultDesc"),
    naverLink: document.getElementById("naverLink"),
    kakaoLink: document.getElementById("kakaoLink"),
    toast: document.getElementById("toast")
  };

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.category) dom.category.value = s.category;
      if (s.price) dom.price.value = String(s.price);
      if (typeof s.excludeSpicy === "boolean") dom.excludeSpicy.checked = s.excludeSpicy;
    } catch {}
  }

  function saveSettings() {
    const s = {
      category: dom.category.value,
      price: dom.price.value,
      excludeSpicy: dom.excludeSpicy.checked
    };
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  }

  function loadLastPick() {
    try {
      const raw = localStorage.getItem(LAST_PICK_KEY);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (!item || !item.id) return null;
      return item;
    } catch { return null; }
  }

  function saveLastPick(item) {
    try { localStorage.setItem(LAST_PICK_KEY, JSON.stringify(item)); } catch {}
  }

  /** @returns {MenuItem[]} */
  function getFilteredItems() {
    const category = dom.category.value;
    const price = dom.price.value;
    const excludeSpicy = dom.excludeSpicy.checked;
    return MENU_ITEMS.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (price !== "all" && String(m.priceTier) !== price) return false;
      if (excludeSpicy && m.isSpicy) return false;
      return true;
    });
  }

  function pickRandom(items) {
    if (!items.length) return null;
    const idx = Math.floor(Math.random() * items.length);
    return items[idx];
  }

  function priceToSymbol(tier) {
    return "₩".repeat(Math.max(1, Math.min(3, tier)));
  }

  function buildSearchQuery(item) {
    if (item.keywords && item.keywords.length) {
      return `${item.keywords[0]} ${STATION_AREA}`;
    }
    return `${item.name} ${STATION_AREA}`;
  }

  function buildMapLinks(item) {
    const query = encodeURIComponent(buildSearchQuery(item));
    const naver = `https://m.map.naver.com/search2/search.naver?query=${query}`;
    const kakao = `https://map.kakao.com/?q=${query}`;
    return { naver, kakao };
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    setTimeout(() => dom.toast.classList.remove("show"), 1600);
  }

  function renderResult(item) {
    if (!item) {
      dom.resultCard.classList.add("hidden");
      return;
    }
    dom.resultTitle.textContent = `${item.name}`;
    dom.resultMeta.textContent = `${item.category} · ${priceToSymbol(item.priceTier)}${item.isSpicy ? " · 매콤" : ""}`;
    dom.resultDesc.textContent = item.description || `${STATION_AREA} 인근에서 찾아보세요`;
    const links = buildMapLinks(item);
    dom.naverLink.href = links.naver;
    dom.kakaoLink.href = links.kakao;
    dom.resultCard.classList.remove("hidden");
  }

  async function shareResult(item) {
    const links = buildMapLinks(item);
    const text = `${item.name} 어때요? (${item.category}, ${priceToSymbol(item.priceTier)}${item.isSpicy ? ", 매콤" : ""})\n\n카카오맵: ${links.kakao}\n네이버지도: ${links.naver}`;
    const shareData = { title: `점심 뭐 먹지? - ${STATION_AREA}`, text, url: links.kakao };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("링크가 클립보드에 복사되었습니다");
    } catch {
      showToast("복사에 실패했어요. 수동으로 복사해 주세요");
    }
  }

  function reroll() {
    const filtered = getFilteredItems();
    const pick = pickRandom(filtered);
    if (!pick) {
      dom.resultCard.classList.add("hidden");
      showToast("조건에 맞는 메뉴가 없어요");
      return;
    }
    saveLastPick(pick);
    renderResult(pick);
  }

  function init() {
    loadSettings();
    dom.category.addEventListener("change", () => { saveSettings(); });
    dom.price.addEventListener("change", () => { saveSettings(); });
    dom.excludeSpicy.addEventListener("change", () => { saveSettings(); });
    dom.randomButton.addEventListener("click", () => reroll());
    dom.rerollButton.addEventListener("click", () => reroll());
    dom.shareButton.addEventListener("click", () => {
      const last = loadLastPick();
      if (last) { shareResult(last); } else { showToast("먼저 추천을 받아보세요"); }
    });

    const last = loadLastPick();
    if (last) {
      renderResult(last);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
