import React, { useState, useEffect } from 'react';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API service for driver routes
const driverAPI = {
  // Get all generated routes (from Orders page)
  getAllRoutes: async (date = new Date().toISOString().split('T')[0]) => {
    try {
      // First try to get generated routes
      const routesResponse = await fetch(`${API_BASE_URL}/orders/get-routes?date=${date}`);
      if (routesResponse.ok) {
        const routesResult = await routesResponse.json();
        if (routesResult.success && routesResult.routes.length > 0) {
          console.log('Found generated routes:', routesResult.routes.length);
          return { success: true, routes: routesResult.routes };
        }
      }
      
      // If no generated routes, get orders and create basic routes
      const response = await fetch(`${API_BASE_URL}/orders/eligible?date=${date}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      
      return { success: true, orders: result.orders || [], routes: [] };
    } catch (error) {
      console.error('API Error - getAllRoutes:', error);
      throw new Error(`Failed to fetch routes: ${error.message}`);
    }
  },

  // Update delivery status from driver app
  updateDeliveryStatus: async (orderId, status, location = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/delivery-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          location: location,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - updateDeliveryStatus:', error);
      throw new Error(`Failed to update delivery status: ${error.message}`);
    }
  },

  // Get detailed route information
  getRouteDetails: async (routeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/route-details/${routeId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error - getRouteDetails:', error);
      throw new Error(`Failed to fetch route details: ${error.message}`);
    }
  }
};

// Depot Return Segments Component - Improved
const DepotReturnSegments = ({ route, onNavigateSegment }) => {
  const segments = route.route_segments || [];
  
  if (segments.length <= 1) return null;

  return (
    <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-sm font-bold text-white">{segments.length}</span>
        </div>
        <h4 className="text-lg font-semibold text-white">Multi-Segment Route</h4>
        <span className="ml-2 text-sm text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full">
          {segments.length} depot returns required
        </span>
      </div>
      
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-white">{index + 1}</span>
              </div>
              <div>
                <div className="font-medium text-white">
                  Segment {index + 1}: {segment.orders?.length || 0} orders
                </div>
                <div className="text-sm text-gray-400">
                  Est. {Math.round(segment.estimated_duration_minutes || 0)} min • 
                  {(segment.total_distance_km || 0).toFixed(1)} km
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {segment.return_to_depot && (
                <span className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-1 rounded-full">
                  🔄 Return to depot
                </span>
              )}
              <button
                onClick={() => onNavigateSegment(route, segment)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Navigate
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-xl">
        💡 <strong>Multi-segment route:</strong> You'll need to return to depot between segments to reload/restock.
      </div>
    </div>
  );
};

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'generated': return 'bg-gray-500';
    case 'pending': return 'bg-yellow-500';
    case 'assigned': return 'bg-blue-500';
    case 'dispatched': return 'bg-indigo-500';
    case 'in_progress': return 'bg-purple-500';
    case 'in_route': return 'bg-purple-500';
    case 'completed': return 'bg-green-600';
    case 'delivered': return 'bg-green-500';
    case 'failed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'generated': return 'Generated';
    case 'pending': return 'Pending';
    case 'assigned': return 'Assigned';
    case 'dispatched': return 'Dispatched';
    case 'in_progress': return 'In Progress';
    case 'in_route': return 'In Route';
    case 'completed': return 'Completed';
    case 'delivered': return 'Delivered';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
};

// Format duration helper
const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}min`;
};

// Format distance helper
const formatDistance = (km) => {
  if (!km) return '0 km';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
};

// Main DriverRoutes Component
const DriverRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [liveUpdateEnabled, setLiveUpdateEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load driver routes
  const loadDriverRoutes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await driverAPI.getAllRoutes();
      
      if (result.success) {
        // If we have generated routes, use them (these are the proper separate zones)
        if (result.routes && result.routes.length > 0) {
          // Filter routes to only show ones assigned to the logged-in driver
          const savedUser = localStorage.getItem('xruto_user');
          const currentUser = savedUser ? JSON.parse(savedUser) : null;
          let filteredRoutes = result.routes;
          
          if (currentUser && currentUser.role === 'driver') {
            filteredRoutes = result.routes.filter(route => {
              // Match by driver email (links USERS account to MOCK_DRIVERS record)
              if (route.driver_email && currentUser.email) {
                return route.driver_email.toLowerCase() === currentUser.email.toLowerCase();
              }
              return false;
            });
            console.log(`Driver ${currentUser.email}: showing ${filteredRoutes.length} of ${result.routes.length} routes`);
          }
          
          console.log('Using generated routes:', filteredRoutes.length);
          setRoutes(filteredRoutes);
        } else if (result.orders && result.orders.length > 0) {
          // If no generated routes but we have orders, create basic routes by postcode
          console.log('Creating basic routes from orders:', result.orders.length);
          const ordersByPostcode = result.orders.reduce((acc, order) => {
            const postcodeArea = order.postcode.split(' ')[0];
            if (!acc[postcodeArea]) acc[postcodeArea] = [];
            acc[postcodeArea].push(order);
            return acc;
          }, {});

          const mockRoutes = Object.entries(ordersByPostcode).map(([postcode, orders], index) => {
            const totalDistance = orders.reduce((sum, order) => sum + (order.distance_from_depot_km || 5), 0);
            const estimatedDuration = orders.length * 10; // 10 min per order
            const completedOrders = orders.filter(order => order.status === 'delivered').length;
            
            return {
              id: `route-${index + 1}`,
              route_name: `Route ${String.fromCharCode(65 + index)} - ${postcode}`,
              status: completedOrders === orders.length ? 'completed' : completedOrders > 0 ? 'in_route' : 'assigned',
              total_orders: orders.length,
              completed_orders: completedOrders,
              estimated_duration_minutes: estimatedDuration,
              total_distance_km: totalDistance,
              zone_color: ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5],
              depot_returns_needed: Math.ceil(orders.length / 10), // 1 return per 10 orders
              route_segments: [{
                orders: orders.map(order => ({
                  ...order,
                  id: order.id,
                  customer_name: order.customer_name,
                  delivery_address: order.delivery_address,
                  latitude: order.latitude,
                  longitude: order.longitude,
                  status: order.status || 'pending'
                })),
                estimated_duration_minutes: estimatedDuration,
                total_distance_km: totalDistance,
                return_to_depot: true
              }]
            };
          });

          setRoutes(mockRoutes);
        } else {
          // No orders or routes
          setRoutes([]);
        }
        setLastUpdate(new Date());
      } else {
        throw new Error(result.message || 'Failed to load routes');
      }
    } catch (error) {
      console.error('Failed to load driver routes:', error);
      setError(error.message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  // Live updates
  useEffect(() => {
    let interval;
    if (liveUpdateEnabled) {
      interval = setInterval(loadDriverRoutes, 30000); // Update every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveUpdateEnabled]);

  // Initial load
  useEffect(() => {
    loadDriverRoutes();
  }, []);

  // Navigate to full route
  const navigateToRoute = (route) => {
    // Check for pre-built navigation URL from backend
    if (route.navigation_url) {
      const navUrl = typeof route.navigation_url === 'object' ? route.navigation_url.url : route.navigation_url;
      if (navUrl && navUrl.startsWith('http')) {
        console.log('Using backend navigation URL:', navUrl);
        window.open(navUrl, '_blank');
        return;
      }
    }

    // Get all orders from all segments
    const allOrders = route.route_segments?.flatMap(segment => segment.orders || []) || [];
    
    if (allOrders.length === 0) {
      alert('No orders found in this route');
      return;
    }

    // Filter orders with valid coordinates
    const ordersWithCoords = allOrders.filter(order => 
      order.latitude && order.longitude && 
      !isNaN(order.latitude) && !isNaN(order.longitude)
    );
    
    if (ordersWithCoords.length === 0) {
      alert('No valid coordinates found for orders in this route');
      return;
    }
    
    // Build Google Maps driving URL with depot as origin and return
    const waypoints = ordersWithCoords
      .map(order => `${order.latitude},${order.longitude}`)
      .join('/');
    
    const navigationUrl = `https://www.google.com/maps/dir/${waypoints}/?travelmode=driving`;
    console.log('Opening navigation URL:', navigationUrl);
    window.open(navigationUrl, '_blank');
  };

  // Navigate to specific segment
  const navigateToSegment = (route, segment) => {
    const segmentOrders = segment.orders || [];
    
    if (segmentOrders.length === 0) {
      alert('No orders found in this segment');
      return;
    }

    // Filter orders with valid coordinates
    const ordersWithCoords = segmentOrders.filter(order => 
      order.latitude && order.longitude && 
      !isNaN(order.latitude) && !isNaN(order.longitude)
    );
    
    if (ordersWithCoords.length === 0) {
      alert('No valid coordinates found for orders in this segment');
      return;
    }
    
    // Use Google Maps for navigation
    const waypoints = ordersWithCoords
      .map(order => `${order.latitude},${order.longitude}`)
      .join('/');
    
    const navigationUrl = `https://www.google.com/maps/dir/${waypoints}/?travelmode=driving`;
    console.log('Opening segment navigation URL:', navigationUrl);
    window.open(navigationUrl, '_blank');
  };

  // Update delivery status
  const updateOrderStatus = async (orderId, newStatus, notes = '') => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      await driverAPI.updateDeliveryStatus(orderId, newStatus);
      // Optimistically update local state so UI reflects immediately without a full reload
      setRoutes(prev => prev.map(route => ({
        ...route,
        completed_orders: route.route_segments?.flatMap(s => s.orders || []).filter(o => o.id === orderId ? newStatus === 'delivered' : o.status === 'delivered').length ?? route.completed_orders,
        route_segments: route.route_segments?.map(seg => ({
          ...seg,
          orders: seg.orders?.map(o => o.id === orderId ? { ...o, status: newStatus } : o) || []
        }))
      })));
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert(`Failed to update order status: ${error.message}`);
    }
  };

  // Navigate to a single stop
  const navigateToStop = (order) => {
    if (!order.latitude || !order.longitude) {
      alert('No coordinates available for this stop');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Loading state
  if (loading && routes.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your routes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && routes.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Routes</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadDriverRoutes}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Driver Routes</h1>
              <p className="text-gray-400">
                All Routes • {routes.length} assigned routes • 
                {routes.reduce((sum, r) => sum + (r.total_orders || 0), 0)} total orders
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Live Updates Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Live Updates</span>
                <button 
                  onClick={() => setLiveUpdateEnabled(!liveUpdateEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    liveUpdateEnabled ? 'bg-green-500' : 'bg-gray-300'
                  } relative`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    liveUpdateEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
              
              {/* Refresh Button */}
              <button 
                onClick={loadDriverRoutes}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>🔄</span>
                )}
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Live Update Status */}
          {liveUpdateEnabled && (
            <div className="mt-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full inline-block">
              🟢 Live updates enabled • Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-blue-400">
              {routes.length}
            </div>
            <div className="text-gray-400">Active Routes</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-green-400">
              {routes.reduce((sum, r) => sum + (r.completed_orders || 0), 0)}
            </div>
            <div className="text-gray-400">Orders Completed</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-orange-400">
              {routes.reduce((sum, r) => sum + (r.total_orders || 0) - (r.completed_orders || 0), 0)}
            </div>
            <div className="text-gray-400">Orders Remaining</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-purple-400">
              {routes.reduce((sum, r) => sum + (r.depot_returns_needed || 1), 0)}
            </div>
            <div className="text-gray-400">Depot Returns</div>
          </div>
        </div>

        {/* No Routes Message */}
        {routes.length === 0 && (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">🚛</div>
            <h2 className="text-xl font-semibold mb-2 text-white">No Routes Assigned</h2>
            <p className="text-gray-400 mb-4">Waiting for route assignments from dispatch</p>
            <button 
              onClick={loadDriverRoutes}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Check for Updates
            </button>
          </div>
        )}

        {/* Routes List */}
        <div className="space-y-6">
          {routes.map((route) => (
            <div key={route.id || route.route_id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Route Header */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: route.zone_color || '#FF6B35' }}
                    ></div>
                    <h2 className="text-xl font-bold text-white">{route.route_name}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(route.status)}`}>
                    {getStatusText(route.status)}
                  </span>
                </div>

                {/* Route Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-200">{formatDuration(route.estimated_duration_minutes)}</div>
                    <div className="text-sm text-gray-400">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-200">{formatDistance(route.total_distance_km)}</div>
                    <div className="text-sm text-gray-400">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-200">{route.total_orders || 0}</div>
                    <div className="text-sm text-gray-400">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{route.depot_returns_needed || 1}</div>
                    <div className="text-sm text-gray-400">Depot Returns</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{route.completed_orders || 0} of {route.total_orders || 0} completed</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${route.total_orders > 0 ? ((route.completed_orders || 0) / route.total_orders) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigateToRoute(route)}
                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-xl hover:bg-orange-600 transition-colors font-medium"
                  >
                    🧭 Navigate Full Route
                  </button>
                  <button
                    onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                    className="flex-1 bg-white/10 border border-white/10 text-white py-2 px-4 rounded-xl hover:bg-white/20 transition-colors font-medium"
                  >
                    {selectedRoute === route.id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>

              {/* Route Details (Collapsible) */}
              {selectedRoute === route.id && (
                <div className="p-6">
                  {/* Depot Return Segments */}
                  <DepotReturnSegments 
                    route={route} 
                    onNavigateSegment={navigateToSegment}
                  />

                  {/* Orders List */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
                    <div className="space-y-2">
                      {route.route_segments?.flatMap(segment => segment.orders || []).map((order, index) => (
                        <div key={order.id || index} className="flex items-start justify-between p-3 bg-white/5 border border-white/10 rounded-xl gap-2">
                          <div className="flex items-start space-x-3 min-w-0">
                            <div className="text-sm font-medium text-gray-400 mt-0.5">#{index + 1}</div>
                            <div className="min-w-0">
                              <div className="font-medium text-white">{order.customer_name}</div>
                              <div className="text-sm text-gray-400 truncate">{order.delivery_address}</div>
                              <div className="text-xs text-gray-500">{order.postcode}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <button
                              onClick={() => navigateToStop(order)}
                              className="px-2 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              🧭 Navigate
                            </button>
                            {order.status !== 'delivered' && order.status !== 'failed' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                  ✓ Done
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'failed')}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                >
                                  ✗ Failed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverRoutes;