import React, { useRef, useImperativeHandle, forwardRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Coordinates, WildPokemon, INTERACTION_RADIUS_METERS } from '@/features/map/services/spawn-engine';
import { getKantoArtworkUrl, capitalizePokemonName } from '@/shared/constants/kanto-pokemon';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import { PokemonTypeName } from '@/shared/types';

export interface LeafletMapViewRef {
  recenter: (coords: Coordinates) => void;
}

interface Props {
  location: Coordinates;
  heading: number | null;
  wildList: WildPokemon[];
  onCatch: (pokemon: WildPokemon) => void;
  onSpawned?: (instanceId: string) => void;
  onExpired?: (instanceId: string) => void;
  onTooFar?: (pokemon: WildPokemon, distance: number) => void;
}

const STATIC_MAP_HTML = `
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
    
    /* PENDING SPOT */
    .pending-spot { cursor: default; }
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

    /* Smooth movement transitions */
    .player-marker-wrap {
      transition: transform 0.35s linear;
    }
    #player-rotator {
      transition: transform 0.1s ease-out;
    }
  </style>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var playerLat = 13.7466;
    var playerLng = 100.5349;
    var interactionRadius = ${INTERACTION_RADIUS_METERS};
    var mapReady = false;

    // 100% Fixed 2D Map on player (no manual drag or zoom)
    var map = L.map('map', {
      center: [playerLat, playerLng],
      zoom: 18.5,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    });
    window.map = map;

    // 2D OpenStreetMap tiles (100% free, no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Google Maps Style Navigation Arrow with Forward Direction Beam
    var playerIcon = L.divIcon({
      className: 'player-marker-wrap',
      html: '<div id="player-rotator" style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center; transform:rotate(0deg); transform-origin:center center;">' +
            '<div style="position:absolute; top:-12px; width:0; height:0; border-left:22px solid transparent; border-right:22px solid transparent; border-top:46px solid rgba(0, 122, 255, 0.28); border-radius:50% 50% 0 0; filter:blur(1px);"></div>' +
            '<div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(0,122,255,0.18); border:1.5px solid rgba(0,122,255,0.5);"></div>' +
            '<svg width="26" height="26" viewBox="0 0 24 24" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35)); z-index:3;">' +
            '<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="#007AFF" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round" />' +
            '</svg></div>',
      iconSize: [64, 64],
      iconAnchor: [32, 32]
    });

    var playerMarker = L.marker([playerLat, playerLng], {
      icon: playerIcon,
      zIndexOffset: 1000
    }).addTo(map);

    // Smooth movement and continuous camera follow without snapping
    window.updatePlayerLocation = function(lat, lng, heading) {
      playerLat = lat;
      playerLng = lng;
      if (playerMarker) playerMarker.setLatLng([lat, lng]);
      
      // Smooth animated pan matching Navigation GPS frequency
      map.panTo([lat, lng], { animate: true, duration: 0.38, easeLinearity: 0.25 });
      
      if (heading !== null && heading !== undefined) {
        var el = document.getElementById('player-rotator');
        if (el) {
          el.style.transform = 'rotate(' + heading + 'deg)';
        }
      }
    };

    var pokemonMarkers = {};
    var currentSpawnsMap = {};

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
        var pct = Math.max(0, Math.min(100, (remainingSec / 60) * 100));
        var barColor = remainingSec <= 10 ? '#FF3B30' : (remainingSec <= 25 ? '#FF9500' : '#34C759');
        return '<div class="spawn-spot active-spot" onclick="window.handlePokemonClick && window.handlePokemonClick(\\'' + p.instanceId + '\\')">' +
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

    window.handlePokemonClick = function(instanceId) {
      var curr = currentSpawnsMap[instanceId];
      if (curr && curr.status === 'ACTIVE' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CATCH', pokemon: curr }));
      }
    };

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
            if (curr && curr.status === 'ACTIVE' && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CATCH', pokemon: curr }));
            }
          });
          pokemonMarkers[p.instanceId] = m;
        }
      });
    };

    // Continuous 1-second in-DOM ticker for progress bar and countdowns
    setInterval(function() {
      var now = Date.now();
      for (var id in currentSpawnsMap) {
        var p = currentSpawnsMap[id];
        if (!p) continue;

        if (p.status === 'PENDING') {
          var remainingSec = Math.max(0, Math.ceil((p.spawnedAt - now) / 1000));
          var labelEl = document.getElementById('pending-time-' + id);
          if (labelEl) {
            labelEl.innerText = 'เกิดใน ' + remainingSec + 's';
          }
          if (remainingSec <= 0) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SPAWNED', instanceId: id }));
            }
          }
        } else if (p.status === 'ACTIVE') {
          var remainingSec = Math.max(0, Math.ceil((p.expiresAt - now) / 1000));
          var pct = Math.max(0, Math.min(100, (remainingSec / 60) * 100));
          var barEl = document.getElementById('bar-fill-' + id);
          var timeEl = document.getElementById('active-time-' + id);
          if (barEl) {
            barEl.style.width = pct + '%';
            if (remainingSec <= 10) {
              barEl.style.backgroundColor = '#FF3B30';
            } else if (remainingSec <= 25) {
              barEl.style.backgroundColor = '#FF9500';
            } else {
              barEl.style.backgroundColor = '#34C759';
            }
          }
          if (timeEl) {
            timeEl.innerText = remainingSec + 's';
          }
          if (remainingSec <= 0) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXPIRED', instanceId: id }));
            }
          }
        }
      }
    }, 1000);

    mapReady = true;
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
    }
  </script>
</body>
</html>
`;

export const LeafletMapView = forwardRef<LeafletMapViewRef, Props>(function LeafletMapView(
  { location, heading, wildList, onCatch, onSpawned, onExpired, onTooFar },
  ref
) {
  const webViewRef = useRef<WebView | null>(null);
  const [isReady, setIsReady] = useState(false);
  const lastHeadingRef = useRef<number | null>(null);
  const headingThrottleRef = useRef<number>(0);

  // Memoize constant source so WebView NEVER reloads on state changes!
  const htmlSource = useMemo(() => ({ html: STATIC_MAP_HTML }), []);

  useImperativeHandle(ref, () => ({
    recenter: (coords: Coordinates) => {
      const js = `if (window.map) { window.map.panTo([${coords.latitude}, ${coords.longitude}], { animate: true, duration: 0.4 }); } true;`;
      webViewRef.current?.injectJavaScript(js);
    },
  }));

  // Update Player location & heading via JS injection (throttled to 60fps)
  useEffect(() => {
    if (!isReady) return;

    const now = Date.now();
    // Allow immediate location updates, throttle pure heading updates to max 25ms
    if (now - headingThrottleRef.current < 25 && lastHeadingRef.current === heading) {
      return;
    }
    headingThrottleRef.current = now;
    lastHeadingRef.current = heading;

    const js = `if (window.updatePlayerLocation) { window.updatePlayerLocation(${location.latitude}, ${location.longitude}, ${
      heading !== null ? heading : 'null'
    }); } true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [location, heading, isReady]);

  // Update Wild Pokémon markers in WebView via JS injection
  useEffect(() => {
    if (!isReady) return;

    const serializedSpawns = JSON.stringify(
      wildList.map((p) => {
        const primaryType = (p.types[0] || 'normal') as PokemonTypeName;
        const color = PokemonTypeColors[primaryType]?.primary || '#A8A878';
        return {
          ...p,
          artwork: getKantoArtworkUrl(p.id),
          displayName: capitalizePokemonName(p.name),
          typeColor: color,
        };
      })
    );

    const js = `if (window.updateSpawns) { window.updateSpawns(${serializedSpawns}); } true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [wildList, isReady]);

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
        onLoadEnd={() => {
          setIsReady(true);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'READY') {
              setIsReady(true);
            } else if (data.type === 'CATCH') {
              onCatch(data.pokemon);
            } else if (data.type === 'SPAWNED') {
              onSpawned?.(data.instanceId);
            } else if (data.type === 'EXPIRED') {
              onExpired?.(data.instanceId);
            } else if (data.type === 'TOO_FAR') {
              onTooFar?.(data.pokemon, data.distance);
            }
          } catch {
            // Ignore parse errors
          }
        }}
      />
    </View>
  );
});

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
