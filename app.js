(function () {
  const DEFAULT_AREA = "삼성역";
  const SETTINGS_KEY = "lunchSettingsV5"; // 버전 업데이트
  const LAST_PICK_KEY = "lunchLastPickV2";

  /** @typedef {{id:string,name:string,category:string,priceTier:1|2|3,isSpicy:boolean,description:string,avgPrice:number,keywords?:string[]}} MenuItem */

  // 기본 메뉴 데이터 (카카오 API 실패 시 폴백용)
  const FALLBACK_MENUS = {
    "한식": [
      { name: "백반집", category: "한식", priceTier: 1, isSpicy: false, avgPrice: 8000, description: "정갈한 한식 백반" },
      { name: "국밥집", category: "한식", priceTier: 1, isSpicy: false, avgPrice: 7000, description: "따뜻한 국밥" },
      { name: "비빔밥집", category: "한식", priceTier: 2, isSpicy: true, avgPrice: 12000, description: "신선한 비빔밥" },
      { name: "찌개집", category: "한식", priceTier: 2, isSpicy: true, avgPrice: 15000, description: "얼큰한 찌개" }
    ],
    "중식": [
      { name: "짜장면집", category: "중식", priceTier: 1, isSpicy: false, avgPrice: 8000, description: "정통 짜장면" },
      { name: "짬뽕집", category: "중식", priceTier: 2, isSpicy: true, avgPrice: 12000, description: "얼큰한 짬뽕" },
      { name: "마라탕집", category: "중식", priceTier: 3, isSpicy: true, avgPrice: 25000, description: "중국식 훠궈" }
    ],
    "일식": [
      { name: "라멘집", category: "일식", priceTier: 2, isSpicy: false, avgPrice: 12000, description: "일본식 라멘" },
      { name: "초밥집", category: "일식", priceTier: 3, isSpicy: false, avgPrice: 30000, description: "신선한 초밥" },
      { name: "우동집", category: "일식", priceTier: 1, isSpicy: false, avgPrice: 9000, description: "따뜻한 우동" }
    ],
    "양식": [
      { name: "파스타집", category: "양식", priceTier: 2, isSpicy: false, avgPrice: 15000, description: "이탈리안 파스타" },
      { name: "스테이크집", category: "양식", priceTier: 3, isSpicy: false, avgPrice: 35000, description: "고급 스테이크" },
      { name: "피자집", category: "양식", priceTier: 2, isSpicy: false, avgPrice: 18000, description: "치즈가 쭉 늘어나는 피자" }
    ],
    "분식/패스트푸드": [
      { name: "김밥천국", category: "분식/패스트푸드", priceTier: 1, isSpicy: false, avgPrice: 5000, description: "다양한 분식 메뉴" },
      { name: "맥도날드", category: "분식/패스트푸드", priceTier: 1, isSpicy: false, avgPrice: 8000, description: "패스트푸드" },
      { name: "치킨집", category: "분식/패스트푸드", priceTier: 2, isSpicy: false, avgPrice: 18000, description: "바삭한 치킨" }
    ],
    "면/국물": [
      { name: "칼국수집", category: "면/국물", priceTier: 1, isSpicy: false, avgPrice: 8000, description: "쫄깃한 칼국수" },
      { name: "쌀국수집", category: "면/국물", priceTier: 1, isSpicy: true, avgPrice: 9000, description: "베트남 쌀국수" }
    ],
    "가벼운 한 끼": [
      { name: "샌드위치집", category: "가벼운 한 끼", priceTier: 1, isSpicy: false, avgPrice: 6000, description: "신선한 샌드위치" },
      { name: "샐러드바", category: "가벼운 한 끼", priceTier: 1, isSpicy: false, avgPrice: 8000, description: "건강한 샐러드" }
    ],
    "카페/디저트": [
      { name: "스타벅스", category: "카페/디저트", priceTier: 2, isSpicy: false, avgPrice: 12000, description: "커피와 간단한 식사" },
      { name: "베이커리", category: "카페/디저트", priceTier: 1, isSpicy: false, avgPrice: 7000, description: "신선한 베이커리" }
    ]
  };

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
    try { 
      const raw = localStorage.getItem(SETTINGS_KEY); 
      return raw ? JSON.parse(raw) : null; 
    } catch (error) { 
      console.warn("설정 로드 실패:", error);
      return null; 
    }
  }
  function saveSettings(s) { 
    try { 
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); 
    } catch (error) {
      console.warn("설정 저장 실패:", error);
    }
  }

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

  // 가격대 필터링 함수
  function filterByPrice(places, priceFilter, priceCap) {
    if (priceFilter === "all" && priceCap === 0) return places;
    
    return places.filter(place => {
      // 카카오 API 결과에 가격 정보가 없으므로 폴백 메뉴 사용
      if (place.avgPrice) {
        const price = place.avgPrice;
        if (priceCap > 0 && price > priceCap) return false;
        if (priceFilter !== "all") {
          const tier = price <= 10000 ? 1 : price <= 20000 ? 2 : 3;
          if (String(tier) !== priceFilter) return false;
        }
        return true;
      }
      return true; // 가격 정보가 없으면 통과
    });
  }

  // 매운 음식 제외 필터링
  function filterBySpicy(places, excludeSpicy) {
    if (!excludeSpicy) return places;
    return places.filter(place => !place.isSpicy);
  }

  // 주소를 좌표로 변환하는 함수
  async function geocodeAddress(address) {
    const settings = getCurrentSettings();
    
    // 카카오 JavaScript API 키가 있으면 사용
    if (settings.kakaoJsKey) {
      try {
        const kakao = await loadKakaoSdk(settings.kakaoJsKey);
        return new Promise((resolve) => {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK && result && result[0]) {
              resolve({ 
                lat: Number(result[0].y), 
                lon: Number(result[0].x),
                address: result[0].address_name || result[0].road_address_name || address
              });
            } else { 
              resolve(null); 
            }
          });
        });
      } catch (error) {
        console.warn("카카오 지오코딩 실패:", error);
      }
    }
    
    // 카카오 REST API 키가 있으면 사용
    if (settings.kakaoKey) {
      try {
        const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
        const response = await fetch(url, { 
          headers: { Authorization: `KakaoAK ${settings.kakaoKey}` } 
        });
        const data = await response.json();
        if (data.documents && data.documents[0]) {
          const doc = data.documents[0];
          return { 
            lat: Number(doc.y), 
            lon: Number(doc.x),
            address: doc.address_name || doc.road_address_name || address
          };
        }
      } catch (error) {
        console.warn("카카오 REST 지오코딩 실패:", error);
      }
    }
    
    return null;
  }

  // 카테고리별 폴백 메뉴 생성 (위치 기반)
  async function getFallbackMenusWithLocation(category, priceFilter, priceCap, excludeSpicy) {
    const settings = getCurrentSettings();
    let menus = [];
    
    if (category === "all") {
      Object.values(FALLBACK_MENUS).forEach(catMenus => {
        menus.push(...catMenus);
      });
    } else if (FALLBACK_MENUS[category]) {
      menus = FALLBACK_MENUS[category];
    }
    
    // 가격 필터링
    menus = filterByPrice(menus, priceFilter, priceCap);
    
    // 매운 음식 제외
    menus = filterBySpicy(menus, excludeSpicy);
    
    // 주소가 설정되어 있으면 위치 정보 추가
    if (settings.address && settings.address.trim()) {
      const coordinates = await geocodeAddress(settings.address);
      if (coordinates) {
        menus.forEach(menu => {
          menu.lat = coordinates.lat;
          menu.lon = coordinates.lon;
          menu.address = coordinates.address;
          menu.distance = "주변";
        });
      }
    }
    
    return menus;
  }

  // Kakao JS SDK loader
  let kakaoSdkPromise = null;
  function loadKakaoSdk(jsKey) {
    try {
      if (typeof window !== "undefined" && window.kakao && window.kakao.maps && window.kakao.maps.services) {
        return Promise.resolve(window.kakao);
      }
      if (!jsKey) return Promise.reject(new Error("Kakao JS Key missing"));
      if (!kakaoSdkPromise) {
        kakaoSdkPromise = new Promise((resolve, reject) => {
          try {
            const s = document.createElement("script");
            s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(jsKey)}&libraries=services`;
            s.async = true;
            s.onload = () => {
              try {
                if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                  resolve(window.kakao);
                } else {
                  reject(new Error("Kakao SDK 로드 후 초기화 실패"));
                }
              } catch (error) {
                reject(new Error(`Kakao SDK 초기화 오류: ${error.message}`));
              }
            };
            s.onerror = () => reject(new Error("Kakao SDK 스크립트 로드 실패"));
            document.head.appendChild(s);
          } catch (error) {
            reject(new Error(`Kakao SDK 스크립트 생성 오류: ${error.message}`));
          }
        });
      }
      return kakaoSdkPromise;
    } catch (error) {
      return Promise.reject(new Error(`Kakao SDK 로더 오류: ${error.message}`));
    }
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
    if (place.place_name) {
      // 카카오 API 결과
      const lat = Number(place.y);
      const lon = Number(place.x);
      const name = place.place_name;
      const categoryName = (place.category_name || "").split(" > ").slice(-1)[0] || place.category_name || "";
      const address = place.road_address_name || place.address_name || "";
      return { lat, lon, name, address, categoryName, kakaoPlaceUrl: place.place_url, type: "kakao" };
    } else {
      // 폴백 메뉴 결과 (위치 정보가 있을 수 있음)
      const address = place.address || `${DEFAULT_AREA} 근처`;
      return { 
        name: place.name, 
        address: address,
        categoryName: place.category, 
        description: place.description,
        avgPrice: place.avgPrice,
        type: "fallback",
        lat: place.lat || null,
        lon: place.lon || null,
        distance: place.distance || null
      };
    }
  }

  function buildLinksForPlace(p) { 
    const settings = getCurrentSettings();
    
    if (p.type === "kakao" && p.lat && p.lon) {
      // 카카오 API 결과: 정확한 좌표로 길찾기
      return { kakao: `https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lon}` };
    } else if (p.type === "fallback" && p.lat && p.lon) {
      // 위치 정보가 있는 폴백 메뉴: 정확한 좌표로 길찾기
      return { kakao: `https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lon}` };
    } else {
      // 위치 정보가 없는 폴백 메뉴: 사용자 설정 주소 주변에서 검색
      if (settings.address && settings.address.trim()) {
        // 정확한 주소 + 식당명으로 검색 (가장 정확한 위치 기반 검색)
        const searchQuery = `${encodeURIComponent(settings.address)} ${encodeURIComponent(p.name)}`;
        return { kakao: `https://map.naver.com/p/search/${searchQuery}` };
      } else {
        // 주소가 설정되지 않은 경우 네이버 지도 검색
        return { kakao: `https://map.naver.com/p/search/${encodeURIComponent(p.name)}` };
      }
    }
  }

  function renderPlaceResult(p) {
    dom.resultTitle.textContent = p.name;
    dom.resultMeta.textContent = `${p.categoryName}`;
    dom.resultDesc.textContent = p.description || p.address;
    
    try {
      const links = buildLinksForPlace(p);
      dom.kakaoLink.href = links.kakao;
      
      if (p.type === "kakao" && p.lat && p.lon) {
        dom.kakaoLink.textContent = "카카오 지도";
        dom.kakaoLink.target = "_blank";
        dom.kakaoLink.rel = "noopener noreferrer";
      } else {
        const settings = getCurrentSettings();
        if (settings.address && settings.address.trim()) {
          // 주소가 너무 길면 축약해서 표시
          const displayAddress = settings.address.length > 20 ? 
            settings.address.substring(0, 20) + "..." : 
            settings.address;
          dom.kakaoLink.textContent = `${displayAddress}에서 검색`;
        } else {
          dom.kakaoLink.textContent = "네이버 지도에서 검색";
        }
        dom.kakaoLink.target = "_blank";
        dom.kakaoLink.rel = "noopener noreferrer";
      }
    } catch (error) {
      console.error("링크 생성 오류:", error);
      dom.kakaoLink.href = "#";
      dom.kakaoLink.textContent = "링크 오류";
      dom.kakaoLink.onclick = (e) => {
        e.preventDefault();
        showToast("링크 생성에 실패했습니다");
      };
    }
    
    dom.resultCard.classList.remove("hidden");
  }

  function loadLastPick() { 
    try { 
      const raw = localStorage.getItem(LAST_PICK_KEY); 
      return raw ? JSON.parse(raw) : null; 
    } catch (error) { 
      console.warn("마지막 추천 로드 실패:", error);
      return null; 
    }
  }
  function saveLastPick(item) { 
    try { 
      localStorage.setItem(LAST_PICK_KEY, JSON.stringify(item)); 
    } catch (error) {
      console.warn("마지막 추천 저장 실패:", error);
    }
  }

  async function reroll() {
    const s = getCurrentSettings();
    
    // 카카오 API로 검색 시도
    let docs = [];
    if (s.usePrecise && s.address && s.kakaoJsKey) {
      try { 
        docs = await findNearbyPlacesBySdk(s); 
      } catch (e) { 
        console.log("Kakao JS SDK 검색 실패:", e);
      }
    }
    
    if ((!docs || !docs.length) && s.usePrecise && s.address && s.kakaoKey) {
      try { 
        docs = await findNearbyPlacesByRest(s); 
      } catch (e) { 
        console.log("Kakao REST 호출 실패:", e);
      }
    }

    // 카카오 API 검색이 실패하거나 결과가 없으면 폴백 메뉴 사용
    if (!docs || !docs.length) {
      const fallbackMenus = await getFallbackMenusWithLocation(s.category, s.price, s.priceCap, s.excludeSpicy);
      if (fallbackMenus.length === 0) {
        showToast("조건에 맞는 식당을 찾을 수 없어요. 필터를 조정해보세요.");
        return;
      }
      const idx = Math.floor(Math.random() * fallbackMenus.length);
      const pickedMenu = fallbackMenus[idx];
      saveLastPick({ type: "fallback", data: pickedMenu });
      renderPlaceResult(mapPlaceToDisplay(pickedMenu));
      
      if (pickedMenu.lat && pickedMenu.lon) {
        showToast(`폴백 메뉴를 추천합니다. ${pickedMenu.address} 주변에서 찾았어요.`);
      } else {
        showToast("폴백 메뉴를 추천합니다. 카카오 API 키를 설정하면 실제 주변 식당을 검색할 수 있어요.");
      }
      return;
    }

    // 카카오 API 결과 필터링
    docs = filterByPrice(docs, s.price, s.priceCap);
    docs = filterBySpicy(docs, s.excludeSpicy);
    
    if (docs.length === 0) {
      showToast("조건에 맞는 식당을 찾을 수 없어요. 필터를 조정해보세요.");
      return;
    }

    const idx = Math.floor(Math.random() * docs.length);
    const pickedPlace = mapPlaceToDisplay(docs[idx]);
    saveLastPick({ type: "kakao", data: pickedPlace });
    renderPlaceResult(pickedPlace);
    showToast("주변 식당을 찾았습니다!");
  }

  async function shareResultGeneric() {
    const last = loadLastPick();
    if (!last) { showToast("먼저 추천을 받아보세요"); return; }
    
    const p = last.data;
    let text = "";
    
    if (last.type === "kakao") {
      const link = buildLinksForPlace(p).kakao;
      text = `${p.name} (${p.categoryName})\n${p.address}\n\n카카오맵: ${link}`;
    } else {
      const settings = getCurrentSettings();
      const locationInfo = settings.address && settings.address.trim() ? 
        `위치: ${settings.address}` : 
        `위치: ${DEFAULT_AREA} 근처`;
      
      text = `${p.name} (${p.categoryName})\n${p.description}\n예상 가격: ${p.avgPrice?.toLocaleString()}원\n${locationInfo}`;
    }
    
    const shareData = { title: `점심 뭐 먹지?`, text, url: buildLinksForPlace(p).kakao };
    if (navigator.share) { 
      try { 
        await navigator.share(shareData); 
        return; 
      } catch {} 
    }
    try { 
      await navigator.clipboard.writeText(text); 
      showToast("링크가 클립보드에 복사되었습니다"); 
    } catch { 
      showToast("복사에 실패했어요"); 
    }
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
    if (last && last.data) { renderPlaceResult(last.data); }

    const s = getCurrentSettings();
    if (!s.address || !s.address.trim()) { setTimeout(() => openSettingsModal(s), 100); }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
