import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  Coordinates,
  WildPokemon,
} from '@/features/map/services/spawn-engine';
import {
  getArtworkUrl,
  capitalizePokemonName,
} from '@/shared/constants/kanto-pokemon';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import { PokemonTypeName } from '@/shared/types';

import { EventVenuePin } from '../hooks/use-event-venue-pins';

export interface LeafletMapViewRef {
  recenter: (coords: Coordinates) => void;
}


export interface LeafletMapViewProps {
  location: Coordinates;
  wildList: WildPokemon[];
  eventPins?: EventVenuePin[];
  onCatch?: (pokemon: WildPokemon) => void;
  onEventPress?: (eventId: string) => void;
  onExpired?: (instanceId: string) => void;
  onSpawned?: (instanceId: string) => void;
  mode?: 'catch' | 'pick';
  pickPin?: Coordinates | null;
  onMapPick?: (coords: Coordinates) => void;
}

type Props = LeafletMapViewProps;

const createMapHtml = (initialLat: number, initialLng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { -webkit-tap-highlight-color: transparent; }
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #E5E3DF; overflow: hidden; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }
    
    .spawn-spot { display: flex; flex-direction: column; align-items: center; user-select: none; }
    
    .event-spot { display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none; }
    .event-pin-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .event-pill {
      background: rgba(20, 20, 20, 0.92);
      color: #FFFFFF;
      font-size: 8.5px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      margin-top: 2px;
      max-width: 95px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border: 1px solid rgba(255, 255, 255, 0.35);
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    
    /* PENDING SPOT */
    .pending-spot { cursor: pointer; }
    .pending-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: radial-gradient(circle, #FFE066 0%, #FFA900 65%, #FF8800 100%);
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 14px rgba(255, 170, 0, 0.8), 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pending-glow {
      animation: pulseGlow 1.2s infinite ease-in-out;
    }
    @keyframes pulseGlow {
      0% { transform: scale(0.92); box-shadow: 0 0 8px rgba(255, 170, 0, 0.6); }
      50% { transform: scale(1.08); box-shadow: 0 0 18px rgba(255, 200, 0, 0.95); }
      100% { transform: scale(0.92); box-shadow: 0 0 8px rgba(255, 170, 0, 0.6); }
    }
    .exclamation-mark {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 900;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-shadow: 0 1px 3px rgba(0,0,0,0.45);
      line-height: 1;
    }
    .pending-pill {
      background: rgba(20, 20, 20, 0.88);
      color: #FFCC00;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
      margin-top: 3px;
      border: 1px solid rgba(255, 204, 0, 0.6);
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      white-space: nowrap;
    }

    /* ACTIVE SPOT */
    .active-spot { cursor: pointer; }
    .active-art-wrap {
      position: relative;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .glow-ring { position: absolute; width: 42px; height: 42px; border-radius: 50%; opacity: 0.45; top: 3px; }
    .pokemon-img {
      width: 46px;
      height: 46px;
      object-fit: contain;
      z-index: 2;
      position: relative;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    .name-pill {
      background: rgba(255, 255, 255, 0.95);
      color: #1A1A1A;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 6px;
      margin-top: 2px;
      z-index: 3;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      white-space: nowrap;
    }
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 3px;
      margin-top: 2px;
      background: rgba(0, 0, 0, 0.78);
      padding: 1px 4px;
      border-radius: 8px;
      border: 0.5px solid rgba(255, 255, 255, 0.35);
      z-index: 3;
    }
    .progress-bar-bg {
      width: 26px;
      height: 4px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.9s linear, background-color 0.3s ease;
    }
    .timer-text {
      color: #FFFFFF;
      font-size: 8px;
      font-weight: 800;
      line-height: 1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Player Trainer Pin & Radar Pulse (Gyro-Free) */
    .player-marker-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .player-pin-container {
      position: relative;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .player-radar-wave {
      position: absolute;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(0, 122, 255, 0.18);
      border: 1.5px solid rgba(0, 122, 255, 0.45);
      animation: pulseRadar 2s infinite ease-out;
    }
    @keyframes pulseRadar {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.35); opacity: 0; }
    }
    .player-avatar-circle {
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #007AFF;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      z-index: 3;
    }
    .player-avatar-center {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #FFFFFF;
    }

    /* Pick-mode draggable pin */
    .pick-pin-wrap { display: flex; flex-direction: column; align-items: center; user-select: none; }
    .pick-pin-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #8B5CF6;
      border: 3px solid #FFFFFF;
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
  </style>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var playerLat = ${initialLat};
    var playerLng = ${initialLng};
    var mapReady = false;

    // Cross-platform postMessage helper (supports both Native WebView and Web Browser Iframe)
    function postToParent(payload) {
      var msg = JSON.stringify(payload);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(msg, '*');
      }
    }

    // 2D Map fixed on player
    var map = L.map('map', {
      center: [playerLat, playerLng],
      zoom: 18.5,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false
    });
    window.map = map;

    // OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Clean Trainer Pin Marker (No Gyroscope/Compass)
    var playerIcon = L.divIcon({
      className: 'player-marker-wrap',
      html: '<div class="player-pin-container">' +
            '<div class="player-radar-wave"></div>' +
            '<div class="player-avatar-circle"><div class="player-avatar-center"></div></div>' +
            '</div>',
      iconSize: [60, 60],
      iconAnchor: [30, 30]
    });

    var playerMarker = L.marker([playerLat, playerLng], {
      icon: playerIcon,
      zIndexOffset: 1000
    }).addTo(map);

    window.updatePlayerLocation = function(lat, lng) {
      playerLat = lat;
      playerLng = lng;
      if (playerMarker) playerMarker.setLatLng([lat, lng]);
      map.panTo([lat, lng], { animate: true, duration: 0.4 });
    };

    var pokemonMarkers = {};
    var currentSpawnsMap = {};
    var spawnedNotified = {};
    var expiredNotified = {};

    function renderMarkerHtml(p) {
      var now = Date.now();
      if (p.status === 'PENDING') {
        var remainingSec = Math.max(0, Math.ceil((p.spawnedAt - now) / 1000));
        return '<div class="spawn-spot pending-spot">' +
          '<div class="pending-circle pending-glow">' +
          '<span class="exclamation-mark">!</span>' +
          '</div>' +
          '<div class="pending-pill" id="pending-time-' + p.instanceId + '">เกิดใน ' + remainingSec + 's</div>' +
          '</div>';
      } else {
        var remainingSec = Math.max(0, Math.ceil((p.expiresAt - now) / 1000));
        var totalSec = Math.max(1, Math.round((p.expiresAt - (p.spawnedAt || (p.expiresAt - 600000))) / 1000));
        var pct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));
        var barColor = remainingSec <= 10 ? '#FF3B30' : (remainingSec <= 25 ? '#FF9500' : '#34C759');
        return '<div class="spawn-spot active-spot">' +
          '<div class="active-art-wrap">' +
          '<div class="glow-ring" style="background:' + p.typeColor + '"></div>' +
          '<img class="pokemon-img" src="' + p.artwork + '" />' +
          '</div>' +
          '<div class="name-pill">' + p.displayName + '</div>' +
          '<div class="progress-wrap">' +
          '<div class="progress-bar-bg">' +
          '<div class="progress-bar-fill" id="bar-fill-' + p.instanceId + '" style="width:' + pct + '%; background-color:' + barColor + ';"></div>' +
          '</div>' +
          '<span class="timer-text" id="active-time-' + p.instanceId + '">' + remainingSec + 's</span>' +
          '</div>' +
          '</div>';
      }
    }

    var lastCatchTime = 0;
    function triggerCatch(pokemon) {
      var now = Date.now();
      if (now - lastCatchTime < 1000) return;
      lastCatchTime = now;
      if (pokemon && pokemon.status === 'ACTIVE') {
        postToParent({ type: 'CATCH', pokemon: pokemon });
      }
    }

    window.updateSpawns = function(spawns) {
      var activeIds = {};
      spawns.forEach(function(p) {
        activeIds[p.instanceId] = true;
        currentSpawnsMap[p.instanceId] = p;
      });

      for (var id in pokemonMarkers) {
        if (!activeIds[id]) {
          map.removeLayer(pokemonMarkers[id]);
          delete pokemonMarkers[id];
          delete currentSpawnsMap[id];
          delete spawnedNotified[id];
          delete expiredNotified[id];
        }
      }

      spawns.forEach(function(p) {
        var html = renderMarkerHtml(p);
        var icon = L.divIcon({
          className: 'custom-pkmn',
          html: html,
          iconSize: [60, 75],
          iconAnchor: [30, 45]
        });

        if (pokemonMarkers[p.instanceId]) {
          pokemonMarkers[p.instanceId].setLatLng([p.latitude, p.longitude]);
          pokemonMarkers[p.instanceId].setIcon(icon);
        } else {
          var m = L.marker([p.latitude, p.longitude], { icon: icon }).addTo(map);
          m.on('click', function() {
            var curr = currentSpawnsMap[p.instanceId];
            triggerCatch(curr);
          });
          pokemonMarkers[p.instanceId] = m;
        }
      });
    };

    var eventMarkers = {};
    window.updateEvents = function(events) {
      var activeIds = {};
      (events || []).forEach(function(e) {
        activeIds[e.id] = true;
      });

      for (var id in eventMarkers) {
        if (!activeIds[id]) {
          map.removeLayer(eventMarkers[id]);
          delete eventMarkers[id];
        }
      }

      (events || []).forEach(function(e) {
        var innerPin = '📍';
        if (e.featuredPokemonId) {
          innerPin = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + e.featuredPokemonId + '.png" style="width:34px;height:34px;object-fit:contain;margin-top:-2px;" />';
        }
        var iconHtml = '<div class="event-spot">' +
          '<div class="event-pin-circle" style="background:' + (e.categoryColor || '#8B5CF6') + ';">' + innerPin + '</div>' +
          '<div class="event-pill">' + (e.title || 'กิจกรรม') + '</div>' +
          '</div>';

        var icon = L.divIcon({
          className: 'custom-event-marker',
          html: iconHtml,
          iconSize: [80, 65],
          iconAnchor: [40, 50]
        });

        if (eventMarkers[e.id]) {
          eventMarkers[e.id].setLatLng([e.latitude, e.longitude]);
          eventMarkers[e.id].setIcon(icon);
        } else {
          var m = L.marker([e.latitude, e.longitude], { icon: icon, zIndexOffset: 600 }).addTo(map);
          m.on('click', function() {
            postToParent({ type: 'EVENT_CLICK', eventId: e.id });
          });
          eventMarkers[e.id] = m;
        }
      });
    };

    // Pick-mode draggable pin (used by event creation map picker)
    var pickMarker = null;
    var lastPickTime = 0;
    function emitPick(lat, lng) {
      var now = Date.now();
      if (now - lastPickTime < 500) return;
      lastPickTime = now;
      postToParent({ type: 'MAP_PICK', lat: lat, lng: lng });
    }
    window.setPick = function(lat, lng) {
      var icon = L.divIcon({
        className: 'pick-pin-wrap',
        html: '<div class="pick-pin-wrap">' +
          '<div class="pick-pin-circle">📍</div>' +
          '</div>',
        iconSize: [44, 50],
        iconAnchor: [22, 44]
      });
      if (pickMarker) {
        pickMarker.setLatLng([lat, lng]);
        pickMarker.setIcon(icon);
      } else {
        pickMarker = L.marker([lat, lng], { icon: icon, draggable: true, zIndexOffset: 1200 }).addTo(map);
        pickMarker.on('dragend', function() {
          var ll = pickMarker.getLatLng();
          emitPick(ll.lat, ll.lng);
        });
      }
    };
    map.on('click', function(e) {
      window.setPick(e.latlng.lat, e.latlng.lng);
      emitPick(e.latlng.lat, e.latlng.lng);
    });

    // Continuous 1-second in-DOM ticker for progress bar and countdowns
    setInterval(function() {
      var now = Date.now();
      for (var id in currentSpawnsMap) {
        var p = currentSpawnsMap[id];
        if (!p) continue;

        if (p.status === 'PENDING') {
          var remainingSec = Math.max(0, Math.ceil((p.spawnedAt - now) / 1000));
          var labelEl = document.getElementById('pending-time-' + id);
          if (labelEl) labelEl.innerText = 'เกิดใน ' + remainingSec + 's';
          if (remainingSec <= 0 && !spawnedNotified[id]) {
            spawnedNotified[id] = true;
            postToParent({ type: 'SPAWNED', instanceId: id });
          }
        } else if (p.status === 'ACTIVE') {
          var remainingSec = Math.max(0, Math.ceil((p.expiresAt - now) / 1000));
          var totalSec = Math.max(1, Math.round((p.expiresAt - (p.spawnedAt || (p.expiresAt - 600000))) / 1000));
          var pct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));
          var barEl = document.getElementById('bar-fill-' + id);
          var timeEl = document.getElementById('active-time-' + id);
          if (barEl) {
            barEl.style.width = pct + '%';
            barEl.style.backgroundColor = remainingSec <= 10 ? '#FF3B30' : (remainingSec <= 25 ? '#FF9500' : '#34C759');
          }
          if (timeEl) timeEl.innerText = remainingSec + 's';
          if (remainingSec <= 0 && !expiredNotified[id]) {
            expiredNotified[id] = true;
            postToParent({ type: 'EXPIRED', instanceId: id });
          }
        }
      }
    }, 1000);

    // Cross-platform Message Listener for Web Iframe
    window.addEventListener('message', function(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'UPDATE_LOCATION') {
          window.updatePlayerLocation(data.lat, data.lng);
        } else if (data && data.type === 'UPDATE_SPAWNS') {
          window.updateSpawns(data.spawns);
        } else if (data && data.type === 'UPDATE_EVENTS') {
          window.updateEvents(data.events);
        } else if (data && data.type === 'RECENTER') {
          if (window.map) window.map.panTo([data.lat, data.lng], { animate: true, duration: 0.4 });
        } else if (data && data.type === 'SET_PICK') {
          if (window.setPick) window.setPick(data.lat, data.lng);
        }
      } catch (e) {}
    });

    mapReady = true;
    postToParent({ type: 'READY' });
  </script>
</body>
</html>
`;

export const LeafletMapView = forwardRef<LeafletMapViewRef, Props>(
  function LeafletMapView(
    {
      location,
      wildList,
      eventPins = [],
      onCatch,
      onEventPress,
      onExpired,
      onSpawned,
      mode = 'catch',
      pickPin = null,
      onMapPick,
    },
    ref
  ) {
    const webViewRef = useRef<WebView | null>(null);
    const iframeRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const lastCatchMsgTimeRef = useRef<number>(0);
    const lastPickMsgTimeRef = useRef<number>(0);

    // Capture initial coordinates
    const initialLocationRef = useRef<Coordinates>(location);
    const htmlSource = useMemo(
      () => ({
        html: createMapHtml(
          initialLocationRef.current.latitude,
          initialLocationRef.current.longitude
        ),
      }),
      []
    );

    // Cross-platform script execution helper
    const executeJs = useCallback((js: string, postObj?: any) => {
      if (Platform.OS === 'web') {
        try {
          if (postObj && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(postObj, '*');
          }
          const win = iframeRef.current?.contentWindow;
          if (win && win.eval) {
            win.eval(js);
          }
        } catch {
          // Ignore eval errors
        }
      } else {
        webViewRef.current?.injectJavaScript(js);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      recenter: (coords: Coordinates) => {
        const js = `if (window.map) { window.map.panTo([${coords.latitude}, ${coords.longitude}], { animate: true, duration: 0.4 }); } true;`;
        executeJs(js, {
          type: 'RECENTER',
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
    }));

    // Update Player location via JS injection and postMessage
    useEffect(() => {
      if (!isReady) return;
      const js = `if (window.updatePlayerLocation) { window.updatePlayerLocation(${location.latitude}, ${location.longitude}); } true;`;
      executeJs(js, {
        type: 'UPDATE_LOCATION',
        lat: location.latitude,
        lng: location.longitude,
      });
    }, [location, isReady, executeJs]);

    // Update Wild Pokémon markers (skipped in pick mode)
    useEffect(() => {
      if (!isReady || mode === 'pick') return;

      const formattedSpawns = wildList.map((p) => {
        const primaryType = (p.types[0] || 'normal') as PokemonTypeName;
        const color = PokemonTypeColors[primaryType]?.primary || '#A8A878';
        return {
          ...p,
          artwork: getArtworkUrl(p.id),
          displayName: capitalizePokemonName(p.name),
          typeColor: color,
        };
      });

      const serializedSpawns = JSON.stringify(formattedSpawns);
      const js = `if (window.updateSpawns) { window.updateSpawns(${serializedSpawns}); } true;`;
      executeJs(js, { type: 'UPDATE_SPAWNS', spawns: formattedSpawns });
    }, [wildList, isReady, executeJs, mode]);

    // Update Event Venue pins (skipped in pick mode)
    useEffect(() => {
      if (!isReady || mode === 'pick') return;
      const serializedEvents = JSON.stringify(eventPins);
      const js = `if (window.updateEvents) { window.updateEvents(${serializedEvents}); } true;`;
      executeJs(js, { type: 'UPDATE_EVENTS', events: eventPins });
    }, [eventPins, isReady, executeJs, mode]);

    // Push pick pin to map (pick mode only)
    useEffect(() => {
      if (!isReady || mode !== 'pick' || !pickPin) return;
      const js = `if (window.setPick) { window.setPick(${pickPin.latitude}, ${pickPin.longitude}); } true;`;
      executeJs(js, {
        type: 'SET_PICK',
        lat: pickPin.latitude,
        lng: pickPin.longitude,
      });
    }, [pickPin, isReady, executeJs, mode]);

    // Message handler for Web Iframe
    useEffect(() => {
      if (Platform.OS !== 'web') return;

      const handleWebMessage = (event: MessageEvent) => {
        try {
          const data =
            typeof event.data === 'string'
              ? JSON.parse(event.data)
              : event.data;
          if (!data || typeof data !== 'object') return;

          if (data.type === 'READY') {
            setIsReady(true);
          } else if (data.type === 'CATCH' && data.pokemon) {
            const now = Date.now();
            if (now - lastCatchMsgTimeRef.current > 1000) {
              lastCatchMsgTimeRef.current = now;
              onCatch?.(data.pokemon);
            }
          } else if (data.type === 'MAP_PICK' && typeof data.lat === 'number' && typeof data.lng === 'number') {
            if (mode !== 'pick') return;
            const now = Date.now();
            if (now - lastPickMsgTimeRef.current > 500) {
              lastPickMsgTimeRef.current = now;
              onMapPick?.({ latitude: data.lat, longitude: data.lng });
            }
          } else if (data.type === 'EVENT_CLICK' && data.eventId) {
            onEventPress?.(data.eventId);
          } else if (data.type === 'EXPIRED') {
            onExpired?.(data.instanceId);
          } else if (data.type === 'SPAWNED') {
            onSpawned?.(data.instanceId);
          }
        } catch {
          // Ignore parsing errors
        }
      };

      window.addEventListener('message', handleWebMessage);
      return () => {
        window.removeEventListener('message', handleWebMessage);
      };
    }, [onCatch, onEventPress, onExpired, onSpawned, onMapPick, mode]);

    // Render Web Iframe
    if (Platform.OS === 'web') {
      return (
        <View style={styles.container}>
          <iframe
            ref={iframeRef}
            srcDoc={htmlSource.html}
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => setIsReady(true)}
          />
        </View>
      );
    }

    // Render Native WebView (iOS / Android)
    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={htmlSource}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          onLoadEnd={() => setIsReady(true)}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'READY') {
                setIsReady(true);
              } else if (data.type === 'CATCH') {
                const now = Date.now();
                if (now - lastCatchMsgTimeRef.current > 1000) {
                  lastCatchMsgTimeRef.current = now;
                  onCatch?.(data.pokemon);
                }
              } else if (data.type === 'MAP_PICK' && typeof data.lat === 'number' && typeof data.lng === 'number') {
                if (mode !== 'pick') return;
                const now = Date.now();
                if (now - lastPickMsgTimeRef.current > 500) {
                  lastPickMsgTimeRef.current = now;
                  onMapPick?.({ latitude: data.lat, longitude: data.lng });
                }
              } else if (data.type === 'EVENT_CLICK' && data.eventId) {
                onEventPress?.(data.eventId);
              } else if (data.type === 'EXPIRED') {
                onExpired?.(data.instanceId);
              } else if (data.type === 'SPAWNED') {
                onSpawned?.(data.instanceId);
              }
            } catch {
              // Ignore parse errors
            }
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: '#E5E3DF',
  },
});
