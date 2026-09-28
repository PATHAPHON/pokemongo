import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserLocation } from '@/hooks/use-user-location';
import { useTrainer } from '@/context/trainer-context';
import {
  Coordinates,
  WildPokemon,
  generateInitialSpawnSpots,
  createPendingSpot,
  getDistanceInMeters,
} from '@/services/spawn-engine';
import { getKantoArtworkUrl, capitalizePokemonName } from '@/constants/kanto-pokemon';
import { PokemonTypeColors } from '@/constants/pokemon-theme';
import { PokemonTypeName } from '@/types';

declare global {
  interface Window {
    L: any;
  }
}

const MAP_MARKER_STYLES = `
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
`;

export default function WebMapScreen() {
  const router = useRouter();
  const { trainer } = useTrainer();
  const { location, heading, permissionGranted } = useUserLocation();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const playerMarkerRef = useRef<any>(null);
  const pokemonMarkersRef = useRef<Map<string, any>>(new Map());

  const [wildList, setWildList] = useState<WildPokemon[]>([]);
  const [distanceAlert] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(
    () => typeof window !== 'undefined' && !!(window as any).L
  );
  const lastSpawnLocationRef = useRef<Coordinates | null>(null);

  // 1. Initialize 15 spots staggered when GPS first locks or moves > 100m
  useEffect(() => {
    if (location.latitude === 0) return;

    const shouldRespawn =
      !lastSpawnLocationRef.current ||
      getDistanceInMeters(lastSpawnLocationRef.current, location) > 100;

    if (shouldRespawn) {
      lastSpawnLocationRef.current = location;
      const initialSpawns = generateInitialSpawnSpots(location, 15, trainer?.level || 1);
      setWildList(initialSpawns);
    }
  }, [location, trainer?.level]);

  // 2. Master 1-second ticker: transition pending to active and replace expired active spots
  useEffect(() => {
    if (location.latitude === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setWildList((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;

        // 1. Transition pending spots whose 10s wait has finished
        const updated = prev.map((spot) => {
          if (spot.status === 'PENDING' && now >= spot.spawnedAt) {
            changed = true;
            return {
              ...spot,
              status: 'ACTIVE' as const,
              spawnedAt: now,
              expiresAt: now + 60000,
            };
          }
          return spot;
        });

        // 2. Remove active spots that exceeded 60s
        const alive = updated.filter((spot) => {
          if (spot.status === 'ACTIVE' && now >= spot.expiresAt) {
            changed = true;
            return false;
          }
          return true;
        });

        // 3. Maintain exactly 15 spots: fill missing spots with new PENDING spots (10s countdown)
        const missing = 15 - alive.length;
        if (missing > 0) {
          changed = true;
          for (let i = 0; i < missing; i++) {
            const existingCoords = alive.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
            alive.push(createPendingSpot(location, trainer?.level || 1, 10000, existingCoords));
          }
        }

        return changed ? alive : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location, trainer?.level]);

  // 3. Load Leaflet CDN script, styles & custom spot styles
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('pokemon-map-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'pokemon-map-styles';
      styleEl.innerHTML = MAP_MARKER_STYLES;
      document.head.appendChild(styleEl);
    }

    if ((window as any).L) {
      return;
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.L) {
          clearInterval(checkInterval);
          setLeafletLoaded(true);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // 4. Initialize Leaflet Map once DOM container and Leaflet are ready (100% Fixed, No Pan/Zoom)
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstance || !window.L) return;

    const L = window.L;
    const map = L.map(mapContainerRef.current, {
      center: [location.latitude, location.longitude],
      zoom: 18.5,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    // 2D World Street Map tiles (OpenStreetMap - 100% free, no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Google Maps Style Navigation Arrow with Forward Direction Beam
    const playerIcon = L.divIcon({
      className: 'player-custom-marker',
      html: `
        <div id="web-player-rotator" style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center; transform:rotate(${
          heading ?? 0
        }deg); transform-origin:center center; transition:transform 0.15s ease-out;">
          <div style="position:absolute; top:-12px; width:0; height:0; border-left:22px solid transparent; border-right:22px solid transparent; border-top:46px solid rgba(0, 122, 255, 0.28); border-radius:50% 50% 0 0; filter:blur(1px);"></div>
          <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(0,122,255,0.18); border:1.5px solid rgba(0,122,255,0.5);"></div>
          <svg width="26" height="26" viewBox="0 0 24 24" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35)); z-index:3;">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="#007AFF" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round" />
          </svg>
        </div>
      `,
      iconSize: [64, 64],
      iconAnchor: [32, 32],
    });

    const playerMarker = L.marker([location.latitude, location.longitude], {
      icon: playerIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    playerMarkerRef.current = playerMarker;

    setMapInstance(map);

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [leafletLoaded]);

  // 5. Update Player position, heading & lock camera to center
  useEffect(() => {
    if (!mapInstance || !window.L) return;

    if (playerMarkerRef.current) {
      playerMarkerRef.current.setLatLng([location.latitude, location.longitude]);
    }
    mapInstance.panTo([location.latitude, location.longitude], {
      animate: true,
      duration: 0.38,
      easeLinearity: 0.25,
    });

    const el = document.getElementById('web-player-rotator');
    if (el && heading !== null && heading !== undefined) {
      el.style.transform = `rotate(${heading}deg)`;
    }
  }, [mapInstance, location, heading]);

  // Tap Pokemon to catch handler
  const handlePokemonTap = useCallback(
    (pokemon: WildPokemon) => {
      setWildList((prev) => {
        const filtered = prev.filter((p) => p.instanceId !== pokemon.instanceId);
        const existingCoords = filtered.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
        const replacement = createPendingSpot(location, trainer?.level || 1, 10000, existingCoords);
        return [...filtered, replacement];
      });

      router.push({
        pathname: '/catch',
        params: {
          id: String(pokemon.id),
          name: pokemon.name,
          cp: String(pokemon.cp),
          types: JSON.stringify(pokemon.types),
        },
      });
    },
    [router, location, trainer?.level]
  );

  const wildListRef = useRef<WildPokemon[]>(wildList);
  useEffect(() => {
    wildListRef.current = wildList;
  }, [wildList]);

  // Global handler accessible from both DOM onclick and Leaflet
  useEffect(() => {
    (window as any).handlePokemonClick = (instanceId: string) => {
      const current = wildListRef.current.find((p) => p.instanceId === instanceId);
      if (current && current.status === 'ACTIVE') {
        handlePokemonTap(current);
      }
    };
    return () => {
      delete (window as any).handlePokemonClick;
    };
  }, [handlePokemonTap]);

  // 6. Synchronize Wild Pokemon Markers on the Map
  useEffect(() => {
    if (!mapInstance || !window.L) return;
    const map = mapInstance;
    const L = window.L;
    const currentMarkers = pokemonMarkersRef.current;

    const activeIds = new Set(wildList.map((p) => p.instanceId));

    // Remove obsolete markers
    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeIds.has(id)) {
        map.removeLayer(marker);
        currentMarkers.delete(id);
      }
    }

    const now = Date.now();

    // Add or update markers
    wildList.forEach((pokemon) => {
      let html = '';
      if (pokemon.status === 'PENDING') {
        const remainingSec = Math.max(0, Math.ceil((pokemon.spawnedAt - now) / 1000));
        html = `
          <div class="spawn-spot pending-spot">
            <div class="pending-circle pending-glow">
              <span class="exclamation-mark">!</span>
            </div>
            <div class="pending-pill" id="web-pending-time-${pokemon.instanceId}">เกิดใน ${remainingSec}s</div>
          </div>
        `;
      } else {
        const remainingSec = Math.max(0, Math.ceil((pokemon.expiresAt - now) / 1000));
        const pct = Math.max(0, Math.min(100, (remainingSec / 60) * 100));
        const barColor = remainingSec <= 10 ? '#FF3B30' : remainingSec <= 25 ? '#FF9500' : '#34C759';
        const primaryType = (pokemon.types[0] || 'normal') as PokemonTypeName;
        const badgeColor = PokemonTypeColors[primaryType]?.primary || '#A8A878';
        const artwork = getKantoArtworkUrl(pokemon.id);
        const name = capitalizePokemonName(pokemon.name);

        html = `
          <div class="spawn-spot active-spot" onclick="window.handlePokemonClick && window.handlePokemonClick('${pokemon.instanceId}')">
            <div class="active-art-wrap">
              <div class="glow-ring" style="background:${badgeColor};"></div>
              <img class="pokemon-img" src="${artwork}" />
            </div>
            <div class="name-pill">${name}</div>
            <div class="progress-wrap">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" id="web-bar-fill-${pokemon.instanceId}" style="width:${pct}%; background-color:${barColor};"></div>
              </div>
              <span class="timer-text" id="web-active-time-${pokemon.instanceId}">${remainingSec}s</span>
            </div>
          </div>
        `;
      }

      const icon = L.divIcon({
        className: 'pokemon-custom-marker',
        html,
        iconSize: [60, 75],
        iconAnchor: [30, 45],
      });

      if (currentMarkers.has(pokemon.instanceId)) {
        const marker = currentMarkers.get(pokemon.instanceId);
        marker.setLatLng([pokemon.latitude, pokemon.longitude]);
        marker.setIcon(icon);
      } else {
        const marker = L.marker([pokemon.latitude, pokemon.longitude], { icon }).addTo(map);

        marker.on('click', () => {
          const current = wildListRef.current.find((p) => p.instanceId === pokemon.instanceId);
          if (current && current.status === 'ACTIVE') {
            handlePokemonTap(current);
          }
        });

        currentMarkers.set(pokemon.instanceId, marker);
      }
    });
  }, [mapInstance, wildList, location, handlePokemonTap]);

  // 7. Continuous 1-second in-DOM ticker for progress bars and countdowns on Web
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      wildList.forEach((p) => {
        if (p.status === 'PENDING') {
          const remainingSec = Math.max(0, Math.ceil((p.spawnedAt - now) / 1000));
          const labelEl = document.getElementById(`web-pending-time-${p.instanceId}`);
          if (labelEl) {
            labelEl.innerText = `เกิดใน ${remainingSec}s`;
          }
        } else if (p.status === 'ACTIVE') {
          const remainingSec = Math.max(0, Math.ceil((p.expiresAt - now) / 1000));
          const pct = Math.max(0, Math.min(100, (remainingSec / 60) * 100));
          const barEl = document.getElementById(`web-bar-fill-${p.instanceId}`);
          const timeEl = document.getElementById(`web-active-time-${p.instanceId}`);
          if (barEl) {
            barEl.style.width = `${pct}%`;
            barEl.style.backgroundColor =
              remainingSec <= 10 ? '#FF3B30' : remainingSec <= 25 ? '#FF9500' : '#34C759';
          }
          if (timeEl) {
            timeEl.innerText = `${remainingSec}s`;
          }
        }
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [wildList]);

  const activeCount = wildList.filter((p) => p.status === 'ACTIVE').length;

  return (
    <View style={styles.container}>
      {/* 2D Map Container for Leaflet */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />

      {/* Floating 2D Map Status Overlay */}
      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Header Bar */}
        <View style={styles.topBar} pointerEvents="box-none">
          <View style={styles.statusPill}>
            <Ionicons
              name={permissionGranted ? 'location' : 'location-outline'}
              size={16}
              color={permissionGranted ? '#34C759' : '#FF9500'}
            />
            <Text style={styles.statusPillText}>
              {permissionGranted ? 'GPS Active' : 'Fallback GPS'}
            </Text>
          </View>

          <View style={styles.statusPill}>
            <Ionicons name="scan-outline" size={16} color="#007AFF" />
            <Text style={styles.statusPillText}>Nearby: {activeCount}</Text>
          </View>
        </View>

        {/* Distance Alert Banner */}
        {distanceAlert && (
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={18} color="#FF3B30" />
            <Text style={styles.alertText}>{distanceAlert}</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E3DF',
    position: 'relative',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
    elevation: 3,
  },
  statusPillText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
  },
  alertBanner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEA',
    borderColor: '#FF3B30',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
    boxShadow: '0px 3px 10px rgba(255, 59, 48, 0.2)',
    elevation: 4,
  },
  alertText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
});
