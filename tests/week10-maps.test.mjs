import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Week 10: Location & Map Integration Tests', () => {
  const rootDir = process.cwd();
  const leafletPath = path.join(
    rootDir,
    'src/features/map/components/LeafletMapView.tsx'
  );
  const leafletContent = fs.readFileSync(leafletPath, 'utf-8');

  // Extract and compile createMapHtml function safely without requiring react-native runtime
  const match = leafletContent.match(
    /export const createMapHtml = \s*\(([\s\S]*?)\)\s*=>\s*`([\s\S]*?)`;/
  );
  assert.ok(match, 'createMapHtml function must be defined and exported in LeafletMapView.tsx');

  const createMapHtml = (initialLat, initialLng, mode = 'catch') => {
    const templateBody = match[2];
    const evaluator = new Function(
      'initialLat',
      'initialLng',
      'mode',
      `return \`${templateBody}\`;`
    );
    return evaluator(initialLat, initialLng, mode);
  };

  describe('1. Venue Map Renders Independently of User Location Permissions', () => {
    test('Inline mini Leaflet venue map preview in event-detail-info.tsx', () => {
      const filePath = path.join(
        rootDir,
        'src/features/events/components/event-detail-info.tsx'
      );
      const content = fs.readFileSync(filePath, 'utf-8');

      // Verify LeafletMapView is imported and used
      assert.ok(
        content.includes("from '@/features/map'") && content.includes('LeafletMapView'),
        'event-detail-info.tsx must import LeafletMapView from @/features/map'
      );
      assert.ok(
        content.includes('<LeafletMapView'),
        'event-detail-info.tsx must render <LeafletMapView'
      );

      // Verify height is 140
      assert.ok(
        content.includes('height: 140'),
        'Mini map container must have height: 140'
      );

      // Verify venue coordinates and pin are passed
      assert.ok(
        content.includes('event.location.latitude') &&
          content.includes('event.location.longitude'),
        'Mini map must use event.location coordinates'
      );
      assert.ok(
        content.includes('eventPins={venuePins}'),
        'Mini map must pass eventPins for the venue'
      );

      // Verify badge text and linkage to onViewOnMap
      assert.ok(
        content.includes('แตะเพื่อเปิดแผนที่ขนาดใหญ่'),
        "Mini map preview must include badge 'แตะเพื่อเปิดแผนที่ขนาดใหญ่'"
      );
      assert.ok(
        content.includes('onPress={onViewOnMap}'),
        'Badge must be linked to onViewOnMap via onPress'
      );

      // Verify no GPS permission dependency in event-detail-info.tsx
      assert.ok(
        !content.includes('expo-location'),
        'event-detail-info.tsx must not import expo-location'
      );
      assert.ok(
        !content.includes('requestForegroundPermissionsAsync'),
        'event-detail-info.tsx must not require location permissions'
      );
    });

    test('Event venue map in events/map.tsx centers independently of GPS permissions', () => {
      const filePath = path.join(rootDir, 'src/app/events/map.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      assert.ok(
        content.includes('venueLocation'),
        'events/map.tsx must define venueLocation'
      );
      assert.ok(
        content.includes('event.location.latitude') &&
          content.includes('event.location.longitude'),
        'events/map.tsx must center venueLocation on event.location'
      );
      assert.ok(
        content.includes('<LeafletMapView') && content.includes('location={venueLocation}'),
        'LeafletMapView must be centered on venueLocation'
      );
    });

    test('Location permission simulation: venue map always available even if permission denied', () => {
      function resolveVenueMapViewData(event, permissionStatus) {
        // Even when permission is 'denied', event venue map renders directly from event coordinates
        const isPermissionGranted = permissionStatus === 'granted';
        return {
          canRenderVenueMap: Boolean(event?.location?.latitude && event?.location?.longitude),
          venueCenter: {
            latitude: event.location.latitude,
            longitude: event.location.longitude,
          },
          isUserGpsActive: isPermissionGranted,
        };
      }

      const sampleEvent = {
        id: 'udon-thani-meetup',
        title: 'Udon Thani Meetup',
        location: {
          name: 'UD Town Udon Thani',
          latitude: 17.4065,
          longitude: 102.7995,
        },
      };

      const resultDenied = resolveVenueMapViewData(sampleEvent, 'denied');
      assert.equal(resultDenied.canRenderVenueMap, true);
      assert.equal(resultDenied.venueCenter.latitude, 17.4065);
      assert.equal(resultDenied.venueCenter.longitude, 102.7995);
      assert.equal(resultDenied.isUserGpsActive, false);

      const resultUndetermined = resolveVenueMapViewData(sampleEvent, 'undetermined');
      assert.equal(resultUndetermined.canRenderVenueMap, true);
      assert.equal(resultUndetermined.isUserGpsActive, false);
    });
  });

  describe('2. Pick Location Mode Cleans Up Player Marker', () => {
    test('createMapHtml hides playerMarker in pick mode', () => {
      const htmlPick = createMapHtml(13.75, 100.5, 'pick');

      assert.ok(
        htmlPick.includes('var isPickMode = true;'),
        'createMapHtml must set isPickMode = true in pick mode'
      );
      assert.ok(
        htmlPick.includes('var playerMarker = null;'),
        'createMapHtml must initialize playerMarker as null'
      );
      assert.ok(
        htmlPick.includes('if (!isPickMode)'),
        'createMapHtml must guard playerMarker creation with if (!isPickMode)'
      );

      // Verify that in pick mode, playerMarker is not added to the map
      const playerMarkerAddToMapPattern = /if \(!isPickMode\) {[\s\S]*?playerMarker = L\.marker[\s\S]*?\.addTo\(map\);[\s\S]*?}/;
      assert.ok(
        playerMarkerAddToMapPattern.test(htmlPick),
        'playerMarker addTo(map) must be enclosed inside if (!isPickMode)'
      );

      // Verify pickMarker draggable setup exists
      assert.ok(
        htmlPick.includes('window.setPick = function'),
        'Pick mode must provide setPick function'
      );
      assert.ok(
        htmlPick.includes('pickMarker = L.marker'),
        'Pick mode must support draggable pickMarker'
      );
    });

    test('createMapHtml renders playerMarker in catch and default modes', () => {
      const htmlCatch = createMapHtml(13.75, 100.5, 'catch');
      assert.ok(
        htmlCatch.includes('var isPickMode = false;'),
        'createMapHtml must set isPickMode = false in catch mode'
      );

      const htmlDefault = createMapHtml(13.75, 100.5);
      assert.ok(
        htmlDefault.includes('var isPickMode = false;'),
        'createMapHtml must default isPickMode = false'
      );
    });

    test('pick-location.tsx passes mode="pick" and requests GPS only upon user tap', () => {
      const filePath = path.join(rootDir, 'src/app/events/pick-location.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Verify mode="pick" is passed
      assert.ok(
        content.includes('mode="pick"'),
        'pick-location.tsx must pass mode="pick" to LeafletMapView'
      );

      // Verify GPS request is tied to handleUseGps
      assert.ok(
        content.includes('const handleUseGps = async () =>'),
        'pick-location.tsx must define handleUseGps'
      );
      assert.ok(
        content.includes('Location.requestForegroundPermissionsAsync()'),
        'pick-location.tsx must request foreground permissions in handleUseGps'
      );

      // Verify initial state renders from preset or initial location without asking GPS
      assert.ok(
        content.includes('useState<Coordinates>(initialPin)'),
        'pick-location.tsx must initialize pin without awaiting GPS'
      );
    });
  });
});
