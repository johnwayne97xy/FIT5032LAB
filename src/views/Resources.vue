<template>
  <div class="main-container">
    <!-- 页面标题 -->
    <div class="title-section">
      <h1>Mental Health Resources & Support</h1>
      <p>Find trusted organisations, research data, and nearby clinics to support your mental health journey</p>
    </div>

    <!-- 紧急支持 -->
    <section class="emergency-help-section">
      <h2>Immediate Support</h2>
      <div class="help-cards-container">
        <div class="help-card">
          <h3>Lifeline</h3>
          <p>24-hour crisis support</p>
          <div class="contact-details">
            <span class="phone-number"> 13 11 14</span>
            <a href="https://www.lifeline.org.au/" target="_blank" class="website-button">Visit Website</a>
          </div>
        </div>

        <div class="help-card">
          <h3>Beyond Blue</h3>
          <p>Mental health counselling</p>
          <div class="contact-details">
            <span class="phone-number"> 1300 22 4636</span>
            <a href="https://www.beyondblue.org.au/" target="_blank" class="website-button">Visit Website</a>
          </div>
        </div>

        <div class="help-card emergency-card">
          <h3>Emergency</h3>
          <p>Immediate danger</p>
          <div class="contact-details">
            <span class="phone-number"> 000</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 在线咨询 -->
    <section class="online-counselling-section">
      <h2>Online Counselling</h2>
      <div class="help-cards-container">
        <div class="help-card">
          <h3>MindSpot</h3>
          <p>Free online mental health clinic</p>
          <a href="https://mindspot.org.au/" target="_blank" class="website-button">Get Started</a>
        </div>

        <div class="help-card">
          <h3>Headspace</h3>
          <p>Support for young people</p>
          <a href="https://headspace.org.au/" target="_blank" class="website-button">Learn More</a>
        </div>

        <div class="help-card">
          <h3>BetterHelp</h3>
          <p>Professional online therapy</p>
          <a href="https://www.betterhelp.com/" target="_blank" class="website-button">Find Therapist</a>
        </div>
      </div>
    </section>

    <!-- 研究数据 -->
    <section class="research-data-section">
      <h2>Research & Statistics</h2>

      <div class="data-cards-container">
        <!-- 数据卡片1 -->
        <div class="data-card">
          <div class="data-title-section">
            <h3>Mental Health Conditions by Gender</h3>
            <p class="data-source-text">Source: AIHW 2018-19</p>
          </div>

          <div class="main-statistics">
            <div class="big-number">42%</div>
            <div class="statistics-description">of women have mental health conditions</div>
            <div class="comparison-text">vs 30% of men</div>
          </div>

          <div class="important-note">
             <strong>Key Insight:</strong> Women are more likely to seek help and receive diagnoses for mental health conditions
          </div>

          <!-- Tableau 可视化 -->
          <div class="tableau-wrapper">
            <tableau-viz
              id="tableau-chart-1"
              src="https://viz.aihw.gov.au/t/Public/views/Mentalhealth/1_Presenceofcurrentdiagnosedmentalhealthconditionspeoplebysex201819"
              width="100%"
              height="400"
              hide-tabs
              toolbar="bottom">
            </tableau-viz>
          </div>
        </div>

        <!-- 数据卡片2 -->
        <div class="data-card">
          <div class="data-title-section">
            <h3>Common Mental Health Challenges</h3>
            <p class="data-source-text">Source: AIHW 2018</p>
          </div>

          <div class="mental-health-conditions-list">
            <div class="condition-item">
              <span class="condition-title">Anxiety</span>
              <div class="percentage-bars">
                <div class="percentage-bar women-bar" style="width: 65%">Women: 13.6%</div>
                <div class="percentage-bar men-bar" style="width: 45%">Men: 9.4%</div>
              </div>
            </div>

            <div class="condition-item">
              <span class="condition-title">Depression</span>
              <div class="percentage-bars">
                <div class="percentage-bar women-bar" style="width: 55%">Women: 11.4%</div>
                <div class="percentage-bar men-bar" style="width: 35%">Men: 7.6%</div>
              </div>
            </div>

            <div class="condition-item">
              <span class="condition-title">Alcohol Use</span>
              <div class="percentage-bars">
                <div class="percentage-bar men-bar" style="width: 70%">Men: 14.3%</div>
                <div class="percentage-bar women-bar" style="width: 25%">Women: 4.7%</div>
              </div>
            </div>
          </div>

          <div class="important-note">
             <strong>Key Insight:</strong> Women experience higher rates of anxiety and depression, while men show higher rates of alcohol-related disorders
          </div>

          <!-- Tableau 可视化 -->
          <div class="tableau-wrapper">
            <tableau-viz
              id="tableau-chart-2"
              src="https://viz.aihw.gov.au/t/Public/views/Mentalhealth/4_MentalandsubstanceusedisordersburdenDALYsbytypeofdisorderandsex2018"
              width="100%"
              height="400"
              hide-tabs
              toolbar="bottom">
            </tableau-viz>
          </div>
        </div>
      </div>
    </section>

    <!-- 地图查找诊所 -->
    <section class="clinic-finder-section">
      <h3>Find Nearby Psychology Clinics</h3>
      <p>
        Enter your location to explore nearby mental health clinics and find navigation routes.
      </p>

      <div class="search-controls">
        <input
          v-model="userSearchInput"
          type="text"
          placeholder="Enter your address (e.g. Oakleigh East, Melbourne)"
          class="address-input"
        />

        <button @click="findNearbyClinics" class="website-button">
          Search
        </button>

        <button @click="openSelectedClinicInGoogleMaps" class="website-button">
          Open in Google Maps
        </button>
      </div>

      <div id="clinic-map" class="map-display"></div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

// Component name
defineOptions({
  name: 'ResourcesPage'
})

// Declare global vars
/* global mapboxgl */

// User input: search address
const userSearchInput = ref('')

// Currently selected clinic to open in Google Maps
const currentlySelectedClinic = ref(null)

// Map related variables
let mapInstance = null
let userLocationMarker = null
let clinicMarkersList = []

// Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoiam9obndheW5lOTd4eSIsImEiOiJjbWd2Mmk5dXcwbzEwMndxMml6Zmlhb3MwIn0.CdN53YRHD25nrPvI-jdXfQ'

// Melbourne boundaries
const MELBOURNE_BOUNDARIES = [144.5, -38.3, 145.5, -37.5]

// On mount, load external scripts
onMounted(() => {
  loadTableauScript()
  loadMapboxScript()
})

// Load Tableau script
function loadTableauScript() {
  const tableauScript = document.createElement('script')
  tableauScript.src = 'https://viz.aihw.gov.au/javascripts/api/tableau.embedding.3.latest.min.js'
  tableauScript.type = 'module'
  document.body.appendChild(tableauScript)
}

// Load Mapbox script
function loadMapboxScript() {
  // 加载CSS样式
  const mapboxCSS = document.createElement('link')
  mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css'
  mapboxCSS.rel = 'stylesheet'
  document.head.appendChild(mapboxCSS)

  // 加载JavaScript文件
  const mapboxScript = document.createElement('script')
  mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.js'
  mapboxScript.onload = initializeMap
  document.body.appendChild(mapboxScript)
}

// Initialize map
function initializeMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN
  mapInstance = new mapboxgl.Map({
    container: 'clinic-map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136], // Melbourne CBD
    zoom: 12,
    maxBounds: [
      [144.5, -38.3], // SW
      [145.5, -37.5]  // NE
    ]
  })
  mapInstance.addControl(new mapboxgl.NavigationControl())
}

// Open selected clinic in Google Maps
function openSelectedClinicInGoogleMaps() {
  if (!currentlySelectedClinic.value) {
    alert('Please select a clinic first by clicking on a pink marker.')
    return
  }
  const clinicAddress = currentlySelectedClinic.value.place_name || currentlySelectedClinic.value.text
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinicAddress)}`
  window.open(googleMapsUrl, '_blank')
}

// Basic XSS sanitization for any user-provided or external text
function sanitizeBasic(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Find nearby clinics
async function findNearbyClinics() {
  if (!userSearchInput.value) {
    alert('Please enter an address.')
    return
  }

  // Step 1: Geocode user address to coordinates
  const safeSearch = sanitizeBasic(userSearchInput.value)
  const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    safeSearch + ' Melbourne'
  )}.json?proximity=144.9631,-37.8136&bbox=${MELBOURNE_BOUNDARIES.join(',')}&country=AU&access_token=${MAPBOX_ACCESS_TOKEN}`

  const geocodingResponse = await fetch(geocodingUrl)
  const geocodingData = await geocodingResponse.json()

  if (!geocodingData.features.length) {
    alert('No results found.')
    return
  }

  const userLocation = geocodingData.features[0].center // [经度, 纬度]

  // Step 2: Move map to user location and add marker
  mapInstance.flyTo({ center: userLocation, zoom: 13 })
  if (userLocationMarker) userLocationMarker.remove()
  userLocationMarker = new mapboxgl.Marker({ color: 'green' }).setLngLat(userLocation).addTo(mapInstance)

  // Step 3: Clear previous markers
  clinicMarkersList.forEach(marker => marker.remove())
  clinicMarkersList = []

  // Step 4: Query nearby hospitals/clinics via Overpass
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:3500, ${userLocation[1]}, ${userLocation[0]});
      node["amenity"="clinic"](around:3500, ${userLocation[1]}, ${userLocation[0]});
      way["amenity"="hospital"](around:3500, ${userLocation[1]}, ${userLocation[0]});
      way["amenity"="clinic"](around:3500, ${userLocation[1]}, ${userLocation[0]});
      relation["amenity"="hospital"](around:3500, ${userLocation[1]}, ${userLocation[0]});
      relation["amenity"="clinic"](around:3500, ${userLocation[1]}, ${userLocation[0]});
    );
    out center 30;
  `

  // Try multiple Overpass servers
  const overpassServers = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ]

  let clinicData = null
  for (const server of overpassServers) {
    try {
      const response = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      })
      if (response.ok) {
        clinicData = await response.json()
        break
      }
    } catch {
      // 尝试下一个服务器
    }
  }

  if (!clinicData || !clinicData.elements?.length) {
    alert('No nearby hospitals/clinics found.')
    return
  }

  // Step 5: Add clinic markers to map
  clinicData.elements.forEach(clinic => {
    const clinicLatitude = clinic.lat ?? clinic.center?.lat
    const clinicLongitude = clinic.lon ?? clinic.center?.lon
    if (clinicLatitude == null || clinicLongitude == null) return

    const clinicName = sanitizeBasic(clinic.tags?.name || 'Unknown clinic/hospital')
    const clinicAddress = [
      sanitizeBasic(clinic.tags?.addr_street || ''),
      sanitizeBasic(clinic.tags?.addr_housenumber || ''),
      sanitizeBasic(clinic.tags?.addr_suburb || ''),
      sanitizeBasic(clinic.tags?.addr_city || '')
    ].filter(Boolean).join(' ')

    const clinicInfo = {
      text: clinicName,
      place_name: clinicAddress ? `${clinicName}, ${clinicAddress}` : clinicName
    }

    const popupContent = `
      <b>${clinicName}</b><br>
      ${clinicAddress || ''}<br>
      <button id="show-route-${clinicLongitude}-${clinicLatitude}"
        class="text-blue-600 underline mt-1 mr-2">Show Route</button>
      <button id="open-gmaps-${clinicLongitude}-${clinicLatitude}"
        class="text-green-600 underline mt-1">Open in Google Maps</button>
    `
    const clinicPopup = new mapboxgl.Popup().setHTML(popupContent)

    const clinicMarker = new mapboxgl.Marker({ color: 'pink' })
      .setLngLat([clinicLongitude, clinicLatitude])
      .setPopup(clinicPopup)
      .addTo(mapInstance)

    clinicMarkersList.push(clinicMarker)

    // 点击标记后，为弹窗按钮绑定事件
    clinicMarker.getElement().addEventListener('click', () => {
      currentlySelectedClinic.value = clinicInfo
      clinicPopup.on('open', () => {
        const showRouteButton = document.getElementById(`show-route-${clinicLongitude}-${clinicLatitude}`)
        const openGmapsButton = document.getElementById(`open-gmaps-${clinicLongitude}-${clinicLatitude}`)
        if (showRouteButton) showRouteButton.onclick = () => drawRouteFromUserToClinic(userLocation, [clinicLongitude, clinicLatitude])
        if (openGmapsButton) openGmapsButton.onclick = () => {
          currentlySelectedClinic.value = clinicInfo
          openSelectedClinicInGoogleMaps()
        }
      })
    })
  })
}

// 绘制从用户位置到诊所的路线
async function drawRouteFromUserToClinic(startLocation, endLocation) {
  if (mapInstance.getSource('route')) {
    mapInstance.removeLayer('route')
    mapInstance.removeSource('route')
  }

  const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLocation[0]},${startLocation[1]};${endLocation[0]},${endLocation[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`

  const directionsResponse = await fetch(directionsUrl)
  const directionsData = await directionsResponse.json()

  if (!directionsData.routes?.length) {
    alert('No route found.')
    return
  }

  const routeGeometry = directionsData.routes[0].geometry

  mapInstance.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: routeGeometry } })
  mapInstance.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#1d4ed8', 'line-width': 4 }
  })

  const routeBounds = new mapboxgl.LngLatBounds()
  routeGeometry.coordinates.forEach((coordinate) => routeBounds.extend(coordinate))
  mapInstance.fitBounds(routeBounds, { padding: 60 })
}
</script>


<style scoped>
/* 整体容器 */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 页面标题 */
.title-section {
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border-radius: 15px;
}

.title-section h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.title-section p {
  font-size: 1.1rem;
  opacity: 0.95;
}

/* 通用区块样式 */
section {
  margin-bottom: 50px;
}

section h2 {
  font-size: 1.8rem;
  color: #1f2937;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 3px solid #10b981;
}

section h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 20px;
}

/* 卡片网格 */
.help-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* 帮助卡片 */
.help-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.help-card.emergency-card {
  background: #fee2e2;
  border: 2px solid #dc2626;
}

.help-card h3 {
  font-size: 1.3rem;
  color: #059669;
  margin-bottom: 10px;
}

.help-card p {
  color: #6b7280;
  margin-bottom: 15px;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.phone-number {
  font-size: 1.1rem;
  font-weight: bold;
  color: #1f2937;
}

.website-button {
  display: inline-block;
  padding: 8px 16px;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  text-align: center;
  border: none;
  cursor: pointer;
}

.website-button:hover {
  background: #059669;
}

/* 研究数据区块 */
.research-data-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 40px;
}

.data-cards-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.data-card {
  background: #f9fafb;
  padding: 25px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.data-title-section {
  margin-bottom: 20px;
}

.data-title-section h3 {
  font-size: 1.3rem;
  color: #1f2937;
  margin-bottom: 5px;
}

.data-source-text {
  color: #6b7280;
  font-size: 0.9rem;
}

.main-statistics {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
  border: 2px solid #10b981;
}

.big-number {
  font-size: 3rem;
  font-weight: bold;
  color: #10b981;
}

.statistics-description {
  font-size: 1.1rem;
  color: #374151;
  margin: 5px 0;
}

.comparison-text {
  color: #6b7280;
  font-style: italic;
}

/* 心理健康条件列表 */
.mental-health-conditions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
}

.condition-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.condition-title {
  font-weight: bold;
  color: #1f2937;
  display: block;
  margin-bottom: 10px;
}

.percentage-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.percentage-bar {
  padding: 8px 12px;
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.women-bar {
  background: linear-gradient(90deg, #ec4899, #f472b6);
}

.men-bar {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.important-note {
  background: #fef3c7;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #f59e0b;
}

/* Tableau容器 */
.tableau-wrapper {
  margin-top: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

/* 诊所查找区块 */
.clinic-finder-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
}

.search-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.address-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.address-input:focus {
  outline: none;
  border-color: #10b981;
}

.map-display {
  width: 100%;
  height: 500px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-section h1 {
    font-size: 1.8rem;
  }

  .help-cards-container {
    grid-template-columns: 1fr;
  }

  .search-controls {
    flex-direction: column;
  }

  .website-button {
    width: 100%;
  }

  .percentage-bar {
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  section h2 {
    font-size: 1.4rem;
  }

  .big-number {
    font-size: 2rem;
  }
}
</style>
