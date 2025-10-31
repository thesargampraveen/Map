// App.js
import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Geolocation from '@react-native-community/geolocation';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.015;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Initialize MapLibre
MapLibreGL.setAccessToken(null); // Use public tiles

// Indian States and Union Territories with coordinates
const INDIAN_STATES = [
  { name: 'Andhra Pradesh', coords: [15.9129, 79.7400] },
  { name: 'Arunachal Pradesh', coords: [28.2180, 94.7278] },
  { name: 'Assam', coords: [26.2006, 92.9376] },
  { name: 'Bihar', coords: [25.0961, 85.3131] },
  { name: 'Chhattisgarh', coords: [21.2787, 81.8661] },
  { name: 'Goa', coords: [15.2993, 74.1240] },
  { name: 'Gujarat', coords: [22.2587, 71.1924] },
  { name: 'Haryana', coords: [29.0588, 76.0856] },
  { name: 'Himachal Pradesh', coords: [31.1048, 77.1734] },
  { name: 'Jharkhand', coords: [23.6102, 85.2799] },
  { name: 'Karnataka', coords: [15.3173, 75.7139] },
  { name: 'Kerala', coords: [10.8505, 76.2711] },
  { name: 'Madhya Pradesh', coords: [22.9734, 78.6569] },
  { name: 'Maharashtra', coords: [19.0760, 72.8777] },
  { name: 'Manipur', coords: [24.6637, 93.9063] },
  { name: 'Meghalaya', coords: [25.4670, 91.3662] },
  { name: 'Mizoram', coords: [23.1645, 92.9376] },
  { name: 'Nagaland', coords: [26.1584, 94.5624] },
  { name: 'Odisha', coords: [20.9517, 85.0985] },
  { name: 'Punjab', coords: [31.1471, 75.3412] },
  { name: 'Rajasthan', coords: [27.0238, 74.2179] },
  { name: 'Sikkim', coords: [27.5330, 88.5122] },
  { name: 'Tamil Nadu', coords: [11.1271, 78.6569] },
  { name: 'Telangana', coords: [17.3850, 78.4867] },
  { name: 'Tripura', coords: [23.8315, 91.2868] },
  { name: 'Uttar Pradesh', coords: [26.8467, 80.9462] },
  { name: 'Uttarakhand', coords: [30.0668, 79.0193] },
  { name: 'West Bengal', coords: [22.9868, 87.8550] },
  { name: 'Delhi', coords: [28.7041, 77.1025] },
  { name: 'Jammu & Kashmir', coords: [33.7782, 76.5762] },
  { name: 'Ladakh', coords: [34.1526, 77.5771] }
];

// Major Indian Cities with coordinates
const INDIAN_CITIES = [
  { name: 'Mumbai', coords: [19.0760, 72.8777], population: '20.4M', state: 'Maharashtra' },
  { name: 'Delhi', coords: [28.7041, 77.1025], population: '32.9M', state: 'Delhi' },
  { name: 'Bangalore', coords: [12.9716, 77.5946], population: '12.3M', state: 'Karnataka' },
  { name: 'Hyderabad', coords: [17.3850, 78.4867], population: '10.5M', state: 'Telangana' },
  { name: 'Chennai', coords: [13.0827, 80.2707], population: '11.1M', state: 'Tamil Nadu' },
  { name: 'Kolkata', coords: [22.5726, 88.3639], population: '14.9M', state: 'West Bengal' },
  { name: 'Pune', coords: [18.5204, 73.8567], population: '6.9M', state: 'Maharashtra' },
  { name: 'Ahmedabad', coords: [23.0225, 72.5714], population: '8.6M', state: 'Gujarat' },
  { name: 'Jaipur', coords: [26.9124, 75.7873], population: '4.7M', state: 'Rajasthan' },
  { name: 'Lucknow', coords: [26.8467, 80.9462], population: '3.5M', state: 'Uttar Pradesh' },
  { name: 'Kanpur', coords: [26.4499, 80.3319], population: '3.2M', state: 'Uttar Pradesh' },
  { name: 'Nagpur', coords: [21.1458, 79.0882], population: '2.9M', state: 'Maharashtra' },
  { name: 'Indore', coords: [22.7196, 75.8577], population: '3.2M', state: 'Madhya Pradesh' },
  { name: 'Thane', coords: [19.2183, 72.9781], population: '2.7M', state: 'Maharashtra' },
  { name: 'Bhopal', coords: [23.2599, 77.4126], population: '2.8M', state: 'Madhya Pradesh' },
  { name: 'Visakhapatnam', coords: [17.6868, 83.2185], population: '2.4M', state: 'Andhra Pradesh' },
  { name: 'Pimpri-Chinchwad', coords: [18.6298, 73.7997], population: '2.4M', state: 'Maharashtra' },
  { name: 'Patna', coords: [25.5941, 85.1376], population: '2.9M', state: 'Bihar' },
  { name: 'Vadodara', coords: [22.3072, 73.1812], population: '2.4M', state: 'Gujarat' },
  { name: 'Ghaziabad', coords: [28.6692, 77.4538], population: '2.9M', state: 'Uttar Pradesh' },
  { name: 'Ludhiana', coords: [30.9010, 75.8573], population: '2.1M', state: 'Punjab' },
  { name: 'Agra', coords: [27.1767, 78.0081], population: '2.1M', state: 'Uttar Pradesh' },
  { name: 'Nashik', coords: [19.9975, 73.7898], population: '2.4M', state: 'Maharashtra' },
  { name: 'Faridabad', coords: [28.4089, 77.3178], population: '2.2M', state: 'Haryana' },
  { name: 'Meerut', coords: [28.9845, 77.7064], population: '2.0M', state: 'Uttar Pradesh' },
  { name: 'Rajkot', coords: [22.3039, 70.8022], population: '1.8M', state: 'Gujarat' },
  { name: 'Kalyan-Dombivali', coords: [19.2403, 73.1305], population: '2.1M', state: 'Maharashtra' },
  { name: 'Vasai-Virar', coords: [19.4912, 72.8396], population: '1.8M', state: 'Maharashtra' },
  { name: 'Varanasi', coords: [25.3176, 82.9739], population: '1.7M', state: 'Uttar Pradesh' },
  { name: 'Srinagar', coords: [34.0837, 74.7973], population: '1.5M', state: 'Jammu & Kashmir' },
  { name: 'Dhanbad', coords: [23.7957, 86.4304], population: '1.5M', state: 'Jharkhand' },
  { name: 'Jodhpur', coords: [26.2389, 73.0243], population: '1.7M', state: 'Rajasthan' },
  { name: 'Amritsar', coords: [31.6340, 74.8723], population: '1.3M', state: 'Punjab' },
  { name: 'Raipur', coords: [21.2514, 81.6296], population: '1.6M', state: 'Chhattisgarh' },
  { name: 'Allahabad', coords: [25.4358, 81.8463], population: '1.5M', state: 'Uttar Pradesh' },
  { name: 'Coimbatore', coords: [11.0168, 76.9558], population: '2.5M', state: 'Tamil Nadu' },
  { name: 'Guwahati', coords: [26.1445, 91.7362], population: '1.3M', state: 'Assam' },
  { name: 'Kochi', coords: [9.9312, 76.2673], population: '2.5M', state: 'Kerala' },
  { name: 'Trivandrum', coords: [8.5241, 76.9366], population: '1.2M', state: 'Kerala' },
  { name: 'Goa', coords: [15.4909, 73.8278], population: '0.7M', state: 'Goa' },
  { name: 'Chandigarh', coords: [30.7333, 76.7794], population: '1.2M', state: 'Chandigarh' },
  { name: 'Dehradun', coords: [30.3165, 78.0322], population: '0.9M', state: 'Uttarakhand' },
  { name: 'Shimla', coords: [31.1048, 77.1734], population: '0.2M', state: 'Himachal Pradesh' }
];

const App = () => {
  const [location, setLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [mapType, setMapType] = useState('streets-v9');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [followUser, setFollowUser] = useState(true);
  const [camera, setCamera] = useState(null);
  const [defaultZoom] = useState(5); // Default zoom level to show state names

  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const searchAnimValue = useRef(new Animated.Value(-100)).current;
  const bottomSheetAnimValue = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    requestLocationPermission();

    return () => {
      // Cleanup: stop watching location when component unmounts
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show you on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          startWatchingLocation();
        } else {
          console.log('Location permission denied');
          setPermissionDenied(true);
          setIsLoading(false);
        }
      } else {
        // For iOS
        startWatchingLocation();
      }
    } catch (err) {
      console.warn('Permission error:', err);
      setErrorMessage('Permission request failed');
      setPermissionDenied(true);
      setIsLoading(false);
    }
  };

  const startWatchingLocation = () => {
    console.log('Starting to watch location...');

    // Set default location to center of India if no location is available
    const defaultLocation = {
      latitude: 20.5937, // Center of India
      longitude: 78.9629
    };

    // Get initial position with more lenient settings
    Geolocation.getCurrentPosition(
      position => {
        console.log('Got position:', position);
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        setIsLoading(false);
        setErrorMessage('');

        // Set default camera after getting location
        const newCamera = {
          centerCoordinate: [longitude, latitude],
          zoomLevel: defaultZoom,
        };
        setCamera(newCamera);
        if (mapRef.current && mapRef.current.setCamera) {
          mapRef.current.setCamera(newCamera);
        }
      },
      error => {
        console.log('Error getting location:', error);
        // Use default location if GPS fails
        setLocation(defaultLocation);
        setIsLoading(false);
        setErrorMessage('Using default location - GPS unavailable');

        // Set default camera for default location
        const newCamera = {
          centerCoordinate: [defaultLocation.longitude, defaultLocation.latitude],
          zoomLevel: defaultZoom,
        };
        setCamera(newCamera);
        if (mapRef.current && mapRef.current.setCamera) {
          mapRef.current.setCamera(newCamera);
        }
      },
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 30000, // Increased timeout
        maximumAge: 10000,
      },
    );

    // Watch for location changes in real-time
    watchIdRef.current = Geolocation.watchPosition(
      position => {
        console.log('Location updated:', position);
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        setErrorMessage('');

        // Update camera only if following user
        if (followUser && mapRef.current) {
          const newCamera = {
            centerCoordinate: [longitude, latitude],
            zoomLevel: 15,
          };
          setCamera(newCamera);
          if (mapRef.current.setCamera) {
            mapRef.current.setCamera(newCamera);
          }
        }
      },
      error => {
        console.log('Error watching location:', error);
        handleLocationError(error);
      },
      {
        enableHighAccuracy: false,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
  };

  // Enhanced functions for Google Maps-like experience
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    Animated.timing(searchAnimValue, {
      toValue: showSearch ? -100 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const searchPlaces = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulated search results - in real app, you'd use Google Places API
      const mockResults = [
        {
          id: 1,
          name: 'Central Park',
          address: 'New York, NY 10024',
          coordinates: {
            latitude: location.latitude + 0.01,
            longitude: location.longitude + 0.01,
          },
          type: 'park',
          rating: 4.8,
        },
        {
          id: 2,
          name: 'Times Square',
          address: 'Manhattan, NY 10036',
          coordinates: {
            latitude: location.latitude - 0.005,
            longitude: location.longitude + 0.008,
          },
          type: 'landmark',
          rating: 4.6,
        },
        {
          id: 3,
          name: 'Brooklyn Bridge',
          address: 'New York, NY 10038',
          coordinates: {
            latitude: location.latitude - 0.01,
            longitude: location.longitude - 0.005,
          },
          type: 'bridge',
          rating: 4.7,
        },
      ].filter(place =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPlace = (place) => {
    setSelectedPlace(place);
    setRouteCoordinates([location, place.coordinates]);
    setMarkers([...markers, place]);

    if (mapRef.current) {
      const newCamera = {
        centerCoordinate: [place.coordinates.longitude, place.coordinates.latitude],
        zoomLevel: 30,
      };
      setCamera(newCamera);
      if (mapRef.current.setCamera) {
        mapRef.current.setCamera(newCamera);
      }
    }

    setShowSearch(false);
    Animated.timing(searchAnimValue, {
      toValue: -100,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Show bottom sheet
    Animated.timing(bottomSheetAnimValue, {
      toValue: height * 0.3,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const centerMapOnUser = () => {
    if (location) {
      const newCamera = {
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 15,
      };
      setCamera(newCamera);
      if (mapRef.current && mapRef.current.setCamera) {
        mapRef.current.setCamera(newCamera);
      }
      setFollowUser(true);
    }
  };

  const zoomToCurrentLocation = () => {
    if (location) {
      const newCamera = {
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 18, // Higher zoom for closer view
      };
      setCamera(newCamera);
      if (mapRef.current && mapRef.current.setCamera) {
        mapRef.current.setCamera(newCamera);
      }
      setFollowUser(true);
    }
  };

  const toggleMapType = () => {
    const types = ['streets-v9', 'satellite-v9', 'dark-v9', 'light-v9'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const addRandomMarker = () => {
    const newMarker = {
      id: Date.now(),
      coordinates: {
        latitude: location.latitude + (Math.random() - 0.5) * 0.02,
        longitude: location.longitude + (Math.random() - 0.5) * 0.02,
      },
      title: `Point ${markers.length + 1}`,
      description: 'Custom marker',
    };
    setMarkers([...markers, newMarker]);
  };

  const handleLocationError = error => {
    let message = 'Unable to get location';
    
    switch (error.code) {
      case 1:
        message = 'Location permission denied. Please enable it in settings.';
        setPermissionDenied(true);
        break;
      case 2:
        message = 'Location unavailable. Please check if GPS is enabled.';
        break;
      case 3:
        message = 'Location request timed out. Please try again.';
        break;
      case 5:
        message = 'Location services are disabled. Please enable them in settings.';
        break;
      default:
        message = `Location error: ${error.message || 'Unknown error'}`;
    }
    
    setErrorMessage(message);
    setIsLoading(false);
    
    Alert.alert(
      'Location Error',
      message,
      [
        {text: 'OK'},
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Getting your location...</Text>
        <Text style={styles.subText}>This may take a few seconds</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Permission denied</Text>
        <Text style={styles.subText}>
          {errorMessage || 'Please enable location permissions in your device settings to use this app.'}
        </Text>
        <Text 
          style={styles.linkText}
          onPress={() => Linking.openSettings()}>
          Open Settings
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Unable to get location</Text>
        <Text style={styles.subText}>
          {errorMessage || 'Please check if location services are enabled'}
        </Text>
        <Text 
          style={styles.linkText}
          onPress={() => Linking.openSettings()}>
          Open Settings
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <MapLibreGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={`https://demotiles.maplibre.org/mapbox/${mapType}-style.json`}
          onDidFinishLoadingMap={() => console.log('Map ready')}
          onRegionDidChange={() => setFollowUser(false)}
          camera={camera || {
            centerCoordinate: [78.9629, 20.5937], // Center of India
            zoomLevel: defaultZoom,
          }}>

          {/* User location marker */}
          {location && (
            <MapLibreGL.PointAnnotation
              id="user-location"
              coordinate={[location.longitude, location.latitude]}
              title="Your Location">
              <View style={styles.userMarkerContainer}>
                <View style={styles.userMarkerOuter}>
                  <View style={styles.userMarkerInner} />
                </View>
              </View>
            </MapLibreGL.PointAnnotation>
          )}

          {/* Accuracy circle around user location */}
          {location && (
            <MapLibreGL.ShapeSource
              id="accuracy-circle"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [location.longitude, location.latitude],
                },
              }}>
              <MapLibreGL.CircleLayer
                id="accuracy-circle-layer"
                style={{
                  circleRadius: 50,
                  circleColor: 'rgba(66, 133, 244, 0.1)',
                  circleStrokeColor: 'rgba(66, 133, 244, 0.3)',
                  circleStrokeWidth: 2,
                }}
              />
            </MapLibreGL.ShapeSource>
          )}

          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <MapLibreGL.ShapeSource
              id="route"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates.map(coord => [coord.longitude, coord.latitude]),
                },
              }}>
              <MapLibreGL.LineLayer
                id="route-layer"
                style={{
                  lineColor: '#4285F4',
                  lineWidth: 4,
                  lineDasharray: [10, 5],
                }}
              />
            </MapLibreGL.ShapeSource>
          )}

          {/* State name labels */}
          {INDIAN_STATES.map((state) => (
            <MapLibreGL.PointAnnotation
              key={state.name}
              id={`state-${state.name}`}
              coordinate={[state.coords[1], state.coords[0]]}
              title={state.name}>
              <View style={styles.stateLabel}>
                <Text style={styles.stateLabelText}>{state.name}</Text>
              </View>
            </MapLibreGL.PointAnnotation>
          ))}

          {/* City markers */}
          {INDIAN_CITIES.map((city) => (
            <MapLibreGL.PointAnnotation
              key={city.name}
              id={`city-${city.name}`}
              coordinate={[city.coords[1], city.coords[0]]}
              title={`${city.name}, ${city.state} (Pop: ${city.population})`}>
              <View style={styles.cityMarker}>
                <View style={styles.cityMarkerDot} />
                <View style={styles.cityLabel}>
                  <Text style={styles.cityLabelText}>{city.name}</Text>
                  <Text style={styles.cityPopText}>{city.population}</Text>
                </View>
              </View>
            </MapLibreGL.PointAnnotation>
          ))}

          {/* Additional markers */}
          {markers.map((marker) => (
            <MapLibreGL.PointAnnotation
              key={marker.id}
              id={marker.id.toString()}
              coordinate={[marker.coordinates.longitude, marker.coordinates.latitude]}
              title={marker.title}>
              <View style={styles.customMarker}>
                <View style={styles.customMarkerInner} />
              </View>
            </MapLibreGL.PointAnnotation>
          ))}
        </MapLibreGL.MapView>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {top: searchAnimValue}
          ]}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a place"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchPlaces(text);
              }}
              onFocus={() => setShowSearch(true)}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#4285F4" style={styles.searchLoader} />
            )}
          </View>

          {showSearch && searchResults.length > 0 && (
            <ScrollView style={styles.searchResults}>
              {searchResults.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.searchResultItem}
                  onPress={() => selectPlace(place)}>
                  <View>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeAddress}>{place.address}</Text>
                    <View style={styles.placeMeta}>
                      <Text style={styles.placeType}>{place.type}</Text>
                      <Text style={styles.placeRating}>⭐ {place.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleSearch}>
            <Text style={styles.controlIcon}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={centerMapOnUser}>
            <Text style={styles.controlIcon}>📍</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={zoomToCurrentLocation}>
            <Text style={styles.controlIcon}>🎯</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <Text style={styles.controlIcon}>🗺️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={addRandomMarker}>
            <Text style={styles.controlIcon}>📍+</Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.mapTypeText}>{mapType.toUpperCase()}</Text>
        </View>

        {/* Bottom Sheet for Selected Place */}
        {selectedPlace && (
          <Animated.View
            style={[
              styles.bottomSheet,
              {bottom: bottomSheetAnimValue}
            ]}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>{selectedPlace.name}</Text>
            <Text style={styles.bottomSheetAddress}>{selectedPlace.address}</Text>
            <View style={styles.bottomSheetActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  map: {
    flex: 1,
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#4285F4',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Enhanced marker styles
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarkerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    borderWidth: 4,
    borderColor: '#fff',
  },

  // Custom marker styles
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarkerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // State label styles
  stateLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stateLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // City marker styles
  cityMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 2,
  },
  cityLabel: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 40,
  },
  cityLabelText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  cityPopText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.8,
  },

  // Search styles
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchLoader: {
    marginLeft: 10,
  },
  searchResults: {
    backgroundColor: 'white',
    marginTop: 8,
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeType: {
    fontSize: 12,
    color: '#4285F4',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  placeRating: {
    fontSize: 12,
    color: '#666',
  },

  // Map controls
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 100,
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  controlIcon: {
    fontSize: 24,
  },

  // Location info
  locationInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  mapTypeText: {
    fontSize: 10,
    color: '#4285F4',
    fontWeight: '600',
    marginTop: 4,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bottomSheetAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },  
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default App;