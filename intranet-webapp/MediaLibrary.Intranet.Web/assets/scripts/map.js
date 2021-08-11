function initMap() {
  const mapContainer = document.querySelector('#map')
  if (!mapContainer) return
  // Set up map
  const center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter()
  const map = L.map(mapContainer).setView([center.x, center.y], 12)
  const basemap = L.tileLayer(
    'https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: 18,
      minZoom: 11,
      attribution:
        '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="https://www.sla.gov.sg">Singapore Land Authority</a>',
    }
  )
  map.setMaxBounds([
    [1.56073, 104.1147],
    [1.16, 103.502],
  ])
  basemap.addTo(map)
  // Make sure popups are sized properly
  document.querySelector('.leaflet-popup-pane').addEventListener(
    'load',
    (event) => {
      const tagName = event.target.tagName
      const popup = map._popup
      if (tagName === 'IMG' && popup && !popup._updated) {
        popup._updated = true
        popup.update()
      }
    },
    true
  )
  return map
}

const markerStyle = {
  radius: 5,
  color: '#333333',
  fillColor: '#004DA8',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
}

function createMarker(lat, lng, title, url, img) {
  const marker = L.circleMarker(L.latLng(lat, lng), markerStyle)
  marker.bindPopup(
    `<a href="${url}" alt="${title}"><img class="popup-img" src="${img}" /></a>`
  )
  return marker
}

function init() {
  const map = initMap()
  if (!map) return
  // Create markers
  const markers = L.markerClusterGroup()
  const resultElements = document.querySelectorAll('#map-data span')
  Array.prototype.forEach.call(resultElements, (element) => {
    const { lat, lng, title, url, img } = element.dataset
    markers.addLayer(createMarker(+lat, +lng, title, url, img))
  })
  map.addLayer(markers)
}

init()
