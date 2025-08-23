(function () {
  const DEFAULT_AREA = "삼성역";
  const SETTINGS_KEY = "lunchSettingsV4"; // include js key
  const LAST_PICK_KEY = "lunchLastPickV1";

  /** @typedef {{id:string,name:string,category:string,priceTier:1|2|3,isSpicy:boolean,description:string,avgPrice:number,keywords?:string[]}} MenuItem */

  // MENU_ITEMS kept for potential future use; picker now uses Kakao places

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
    kakaoLink: document.getElementById("kakaoLink"),
    toast: document.getElementById("toast"),
    addressDisplay: document.getElementById("addressDisplay"),
    walkDisplay: document.getElementById("walkDisplay"),
    priceCapDisplay: document.getElementById("priceCapDisplay"),
    openSettings: document.getElementById("openSettings"),
    settingsModal: document.getElementById("settingsModal"),
    settingsBackdrop: document.getElementById("settingsBackdrop"),
    settingsAddress: document.getElementById("settingsAddress"),
    settingsWalk: document.getElementById("settingsWalk"),
    settingsPrice: document.getElementById("settingsPrice"),
    settingsKakaoJsKey: document.getElementById("settingsKakaoJsKey"),
    settingsKakaoKey: document.getElementById("settingsKakaoKey"),
    settingsUsePrecise: document.getElementById("settingsUsePrecise"),
    settingsCancel: document.getElementById("settingsCancel"),
    settingsSave: document.getElementById("settingsSave")
  };

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    setTimeout(() => dom.toast.classList.remove("show"), 1800);
  }

  function loadSettings() {
    try { const raw = localStorage.getItem(SETTINGS_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function saveSettings(s) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {} }

  function getCurrentSettings() {
    const loaded = loadSettings();
    if (loaded) return loaded;
    return {
      category: dom.category ? dom.category.value : "all",
      price: dom.price ? dom.price.value : "all",
      excludeSpicy: dom.excludeSpicy ? dom.excludeSpicy.checked : false,
      address: "",
      walkMinutes: 10,
      priceCap: 0,
      kakaoJsKey: "",
      kakaoKey: "",
      usePrecise: false
    };
  }

  function updateSettingsBar(s) {
    dom.addressDisplay.textContent = s.address && s.address.trim().length > 0 ? s.address : "미설정";
    dom.walkDisplay.textContent = `${Number(s.walkMinutes || 10)}분`;
    dom.priceCapDisplay.textContent = Number(s.priceCap || 0) > 0 ? `${Number(s.priceCap).toLocaleString()}원` : "무제한";
  }

  function openSettingsModal(prefill) {
    const s = prefill || getCurrentSettings();
    dom.settingsAddress.value = s.address || "";
    dom.settingsWalk.value = s.walkMinutes != null ? String(s.walkMinutes) : "10";
    dom.settingsPrice.value = s.priceCap != null ? String(s.priceCap) : "0";
    dom.settingsKakaoJsKey.value = s.kakaoJsKey || "";
    dom.settingsKakaoKey.value = s.kakaoKey || "";
    dom.settingsUsePrecise.checked = !!s.usePrecise;
    dom.settingsModal.classList.remove("hidden");
  }
  function closeSettingsModal() { dom.settingsModal.classList.add("hidden"); }
  function applyModalSettings() {
    const address = String(dom.settingsAddress.value || "").trim();
    const walkMinutes = Math.max(1, Math.min(60, Number(dom.settingsWalk.value || 10)));
    const priceCap = Math.max(0, Number(dom.settingsPrice.value || 0));
    const kakaoJsKey = String(dom.settingsKakaoJsKey.value || "").trim();
    const kakaoKey = String(dom.settingsKakaoKey.value || "").trim();
    const usePrecise = !!dom.settingsUsePrecise.checked;
    const prev = getCurrentSettings();
    const next = { ...prev, address, walkMinutes, priceCap, kakaoJsKey, kakaoKey, usePrecise };
    if (dom.category) next.category = dom.category.value;
    if (dom.price) next.price = dom.price.value;
    if (dom.excludeSpicy) next.excludeSpicy = dom.excludeSpicy.checked;
    saveSettings(next);
    updateSettingsBar(next);
    showToast("설정이 저장되었습니다");
    closeSettingsModal();
  }

  function getCategoryKeywords(category) {
    switch (category) {
      case "한식": return ["한식", "백반", "국밥", "찌개", "비빔밥", "분식"];
      case "중식": return ["중식", "중국집", "짜장면", "짬뽕", "마라탕"];
      case "일식": return ["일식", "라멘", "초밥", "돈카츠", "우동", "소바"];
      case "아시안": return ["베트남 음식", "쌀국수", "타이 음식", "아시안"];
      case "양식": return ["양식", "파스타", "스테이크", "피자"];
      case "분식/패스트푸드": return ["분식", "김밥", "버거", "치킨"];
      case "면/국물": return ["라멘", "칼국수", "우동", "국밥", "짬뽕", "쌀국수"];
      case "가벼운 한 끼": return ["샌드위치", "샐러드", "김밥"];
      case "카페/디저트": return ["카페", "디저트", "베이커리"];
      default: return ["맛집", "식당"];
    }
  }
  function getCategoryGroupCode(category) { return category === "카페/디저트" ? "CE7" : "FD6"; }

  // Kakao JS SDK loader
  let kakaoSdkPromise = null;
  function loadKakaoSdk(jsKey) {
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps && window.kakao.maps.services) {
      return Promise.resolve(window.kakao);
    }
    if (!jsKey) return Promise.reject(new Error("Kakao JS Key missing"));
    if (!kakaoSdkPromise) {
      kakaoSdkPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(jsKey)}&libraries=services`;
        s.async = true;
        s.onload = () => resolve(window.kakao);
        s.onerror = () => reject(new Error("Kakao SDK 로드 실패"));
        document.head.appendChild(s);
      });
    }
    return kakaoSdkPromise;
  }

  async function geocodeBySdk(address, jsKey) {
    const kakao = await loadKakaoSdk(jsKey);
    return new Promise((resolve) => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result && result[0]) {
          resolve({ x: Number(result[0].x), y: Number(result[0].y) });
        } else { resolve(null); }
      });
    });
  }

  async function findNearbyPlacesBySdk(settings) {
    const s = settings || getCurrentSettings();
    const kakao = await loadKakaoSdk(s.kakaoJsKey);
    const center = await geocodeBySdk(s.address, s.kakaoJsKey);
    if (!center) return [];
    const radius = minutesToMeters(Number(s.walkMinutes || 10));
    const keywords = getCategoryKeywords(s.category || "all");
    const groupCode = getCategoryGroupCode(s.category || "all");

    async function searchWithKeyword(keyword) {
      return new Promise((resolve) => {
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
          if (status === kakao.maps.services.Status.OK && Array.isArray(data)) {
            const filtered = data.filter(d => d.category_group_code === groupCode);
            resolve(filtered);
          } else {
            resolve([]);
          }
        }, { location: new kakao.maps.LatLng(center.y, center.x), radius, sort: kakao.maps.services.SortBy.DISTANCE });
      });
    }

    for (let i = 0; i < keywords.length; i++) {
      const docs = await searchWithKeyword(keywords[i]);
      if (docs.length) return docs;
    }
    return [];
  }

  // REST fallback (may hit CORS in some environments)
  async function fetchJson(url, headers) { const res = await fetch(url, { headers }); if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }
  async function kakaoGeocode(address, kakaoKey) {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const json = await fetchJson(url, { Authorization: `KakaoAK ${kakaoKey}` });
    const doc = json && json.documents && json.documents[0];
    if (!doc) return null; return { x: Number(doc.x), y: Number(doc.y) };
  }
  function minutesToMeters(minutes) { const walkingSpeedMps = 1.2; return Math.round(minutes * 60 * walkingSpeedMps); }
  function getCategoryGroupCodeRest(category) { return getCategoryGroupCode(category); }
  async function findNearbyPlacesByRest(settings) {
    const s = settings || getCurrentSettings();
    const center = await kakaoGeocode(s.address, s.kakaoKey);
    if (!center) return [];
    const radius = minutesToMeters(Number(s.walkMinutes || 10));
    const keywords = getCategoryKeywords(s.category || "all");
    const groupCode = getCategoryGroupCodeRest(s.category || "all");
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&x=${center.x}&y=${center.y}&radius=${radius}&sort=distance`;
      try {
        const json = await fetchJson(url, { Authorization: `KakaoAK ${s.kakaoKey}` });
        let docs = (json && json.documents) ? json.documents : [];
        docs = docs.filter(d => d.category_group_code === groupCode);
        if (docs.length > 0) return docs;
      } catch (e) {}
    }
    return [];
  }

  function mapPlaceToDisplay(place) {
    const lat = Number(place.y);
    const lon = Number(place.x);
    const name = place.place_name;
    const categoryName = (place.category_name || "").split(" > ").slice(-1)[0] || place.category_name || "";
    const address = place.road_address_name || place.address_name || "";
    return { lat, lon, name, address, categoryName, kakaoPlaceUrl: place.place_url };
  }
  function buildLinksForPlace(p) { return { kakao: `https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lon}` }; }

  function renderPlaceResult(p) {
    dom.resultTitle.textContent = p.name;
    dom.resultMeta.textContent = `${p.categoryName}`;
    dom.resultDesc.textContent = p.address;
    dom.kakaoLink.href = buildLinksForPlace(p).kakao;
    dom.resultCard.classList.remove("hidden");
  }

  function loadLastPick() { try { const raw = localStorage.getItem(LAST_PICK_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
  function saveLastPick(item) { try { localStorage.setItem(LAST_PICK_KEY, JSON.stringify(item)); } catch {} }

  async function reroll() {
    const s = getCurrentSettings();
    if (!(s.usePrecise && s.address)) { showToast("설정에서 주소/정확한 장소 사용을 확인하세요"); return; }

    let docs = [];
    if (s.kakaoJsKey) {
      try { docs = await findNearbyPlacesBySdk(s); } catch (e) { showToast("Kakao JS SDK 검색 실패: 키/도메인 등록 확인"); }
    }
    if ((!docs || !docs.length) && s.kakaoKey) {
      try { docs = await findNearbyPlacesByRest(s); } catch (e) { showToast("Kakao REST 호출 실패: 키/CORS 확인"); }
    }
    if (!docs || !docs.length) { showToast("주변에서 식당을 찾을 수 없어요"); return; }

    const idx = Math.floor(Math.random() * docs.length);
    const pickedPlace = mapPlaceToDisplay(docs[idx]);
    saveLastPick({ type: "place", data: pickedPlace });
    renderPlaceResult(pickedPlace);
  }

  async function shareResultGeneric() {
    const last = loadLastPick();
    if (!last || last.type !== "place") { showToast("먼저 추천을 받아보세요"); return; }
    const p = last.data;
    const link = buildLinksForPlace(p).kakao;
    const text = `${p.name} (${p.categoryName})\n${p.address}\n\n카카오맵: ${link}`;
    const shareData = { title: `점심 뭐 먹지?`, text, url: link };
    if (navigator.share) { try { await navigator.share(shareData); return; } catch {} }
    try { await navigator.clipboard.writeText(text); showToast("링크가 클립보드에 복사되었습니다"); } catch { showToast("복사에 실패했어요"); }
  }

  function init() {
    const loaded = loadSettings();
    if (loaded) {
      if (dom.category && loaded.category) dom.category.value = loaded.category;
      if (dom.price && loaded.price) dom.price.value = String(loaded.price);
      if (dom.excludeSpicy && typeof loaded.excludeSpicy === "boolean") dom.excludeSpicy.checked = loaded.excludeSpicy;
      updateSettingsBar(loaded);
    } else {
      updateSettingsBar(getCurrentSettings());
    }

    dom.category.addEventListener("change", () => { const s = getCurrentSettings(); s.category = dom.category.value; saveSettings(s); });
    dom.price.addEventListener("change", () => { const s = getCurrentSettings(); s.price = dom.price.value; saveSettings(s); });
    dom.excludeSpicy.addEventListener("change", () => { const s = getCurrentSettings(); s.excludeSpicy = dom.excludeSpicy.checked; saveSettings(s); });

    dom.randomButton.addEventListener("click", () => { reroll(); });
    dom.rerollButton.addEventListener("click", () => { reroll(); });
    dom.shareButton.addEventListener("click", () => { shareResultGeneric(); });

    dom.openSettings.addEventListener("click", () => openSettingsModal(getCurrentSettings()));
    dom.settingsBackdrop.addEventListener("click", closeSettingsModal);
    dom.settingsCancel.addEventListener("click", closeSettingsModal);
    dom.settingsSave.addEventListener("click", applyModalSettings);

    const last = loadLastPick();
    if (last && last.type === "place") { renderPlaceResult(last.data); }

    const s = getCurrentSettings();
    if (!s.address || !s.address.trim()) { setTimeout(() => openSettingsModal(s), 100); }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
