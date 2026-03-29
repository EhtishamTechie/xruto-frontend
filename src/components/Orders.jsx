// ── Legacy commented-out version removed ──────────────────────────────────────

// const ordersAPI = {
//   getEligibleOrders: async (date) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/eligible?date=${date}`);
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       return response.json();
//     } catch (error) {
//       console.error('API Error - getEligibleOrders:', error);
//       throw new Error(`Failed to fetch orders: ${error.message}`);
//     }
//   },

//   generateClusters: async (selectedPostcodes, maxZones = 5) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/generate-clusters`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           selected_postcodes: selectedPostcodes,
//           clustering_algorithm: 'kmeans',
//           max_zones: maxZones,
//           date: new Date().toISOString().split('T')[0]
//         })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       return response.json();
//     } catch (error) {
//       console.error('API Error - generateClusters:', error);
//       throw new Error(`Failed to generate clusters: ${error.message}`);
//     }
//   },

//   generateRoutes: async (zones) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/generate-routes`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           zones,
//           date: new Date().toISOString().split('T')[0]
//         })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       return response.json();
//     } catch (error) {
//       console.error('API Error - generateRoutes:', error);
//       throw new Error(`Failed to generate routes: ${error.message}`);
//     }
//   },

//   getAvailableDrivers: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/available-drivers`);
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       return response.json();
//     } catch (error) {
//       console.error('API Error - getAvailableDrivers:', error);
//       throw new Error(`Failed to fetch drivers: ${error.message}`);
//     }
//   },

//   autoAssignDrivers: async (routes) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/auto-assign-drivers`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ routes, method: 'round_robin' })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       return response.json();
//     } catch (error) {
//       console.error('API Error - autoAssignDrivers:', error);
//       throw new Error(`Failed to auto-assign drivers: ${error.message}`);
//     }
//   },

//   assignDriver: async (routeId, driverId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/assign-driver`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ route_id: routeId, driver_id: driverId })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       return response.json();
//     } catch (error) {
//       console.error('API Error - assignDriver:', error);
//       throw new Error(`Failed to assign driver: ${error.message}`);
//     }
//   },

//   dispatchRoutes: async (routeIds) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/dispatch-routes`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ route_ids: routeIds })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       return response.json();
//     } catch (error) {
//       console.error('API Error - dispatchRoutes:', error);
//       throw new Error(`Failed to dispatch routes: ${error.message}`);
//     }
//   },

//   getRouteDetails: async (routeId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/route-details/${routeId}`);
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       return response.json();
//     } catch (error) {
//       console.error('API Error - getRouteDetails:', error);
//       throw new Error(`Failed to fetch route details: ${error.message}`);
//     }
//   },

//   updateDeliveryStatus: async (orderId, status, notes = '') => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/orders/delivery-status/${orderId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           status, 
//           notes,
//           delivered_at: status === 'delivered' ? new Date().toISOString() : null
//         })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       return response.json();
//     } catch (error) {
//       console.error('API Error - updateDeliveryStatus:', error);
//       throw new Error(`Failed to update delivery status: ${error.message}`);
//     }
//   }
// };

// const Orders = () => {
//   const [activeTab, setActiveTab] = useState(1);
//   const [selectedPostcodes, setSelectedPostcodes] = useState([]);
//   const [availablePostcodes, setAvailablePostcodes] = useState([]);
//   const [eligibleOrders, setEligibleOrders] = useState([]);
//   const [previewZones, setPreviewZones] = useState([]);
//   const [generatedRoutes, setGeneratedRoutes] = useState([]);
//   const [availableDrivers, setAvailableDrivers] = useState([]);
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [routeOrders, setRouteOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const ordersData = await ordersAPI.getEligibleOrders(
//         new Date().toISOString().split('T')[0]
//       );
      
//       if (ordersData.success) {
//         setEligibleOrders(ordersData.orders);
//         setAvailablePostcodes(ordersData.postcode_options);
        
//         if (ordersData.orders.length === 0) {
//           setError('No eligible orders found for today. Please check your database or add sample orders.');
//         }
//       } else {
//         throw new Error(ordersData.message || 'Failed to load orders');
//       }
      
//       const driversData = await ordersAPI.getAvailableDrivers();
//       if (driversData.success) {
//         setAvailableDrivers(driversData.drivers);
        
//         if (driversData.drivers.length === 0) {
//           setError('No available drivers found. Please add drivers in the Admin section.');
//         }
//       }
      
//     } catch (error) {
//       console.error('Failed to load initial data:', error);
//       setError(`Failed to load data: ${error.message}. Please check your backend connection.`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (error || success) {
//       const timer = setTimeout(() => {
//         setError('');
//         setSuccess('');
//       }, 6000);
//       return () => clearTimeout(timer);
//     }
//   }, [error, success]);

//   const handlePostcodeToggle = (postcode) => {
//     setSelectedPostcodes(prev => 
//       prev.includes(postcode) 
//         ? prev.filter(p => p !== postcode)
//         : [...prev, postcode]
//     );
//   };

//   const previewClustering = async () => {
//     if (selectedPostcodes.length === 0) {
//       setError('Please select at least one postcode area to generate clusters');
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.generateClusters(selectedPostcodes, 5);
      
//       if (result.success) {
//         setPreviewZones(result.zones);
//         setSuccess(`Generated ${result.zones.length} zones from ${result.total_orders} orders using K-means clustering`);
//       } else {
//         throw new Error(result.message || 'Clustering failed');
//       }
//     } catch (error) {
//       setError(`Clustering failed: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateRoutesFromZones = async () => {
//     if (previewZones.length === 0) {
//       setError('No zones available. Please generate clusters first.');
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.generateRoutes(previewZones);
      
//       if (result.success) {
//         setGeneratedRoutes(result.routes);
//         setSuccess(`Generated ${result.routes.length} optimized routes`);
//         setActiveTab(2);
//       } else {
//         throw new Error(result.message || 'Route generation failed');
//       }
//     } catch (error) {
//       setError(`Route generation failed: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const assignDriverToRoute = async (routeId, driverId) => {
//     if (!driverId) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.assignDriver(routeId, driverId);
      
//       if (result.success) {
//         setGeneratedRoutes(prev => prev.map(route => 
//           route.route_id === routeId 
//             ? { 
//                 ...route, 
//                 driver_id: driverId, 
//                 driver_name: `${result.driver.name} (${result.driver.mpg} MPG)`, 
//                 status: 'assigned' 
//               }
//             : route
//         ));
//         setSuccess('Driver assigned successfully');
//       } else {
//         throw new Error(result.message || 'Driver assignment failed');
//       }
//     } catch (error) {
//       setError(`Failed to assign driver: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const autoAssignAllDrivers = async () => {
//     if (generatedRoutes.length === 0) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.autoAssignDrivers(generatedRoutes);
      
//       if (result.success) {
//         setGeneratedRoutes(result.routes);
//         setSuccess(`Auto-assigned drivers to all routes`);
//       } else {
//         throw new Error(result.message || 'Auto-assignment failed');
//       }
//     } catch (error) {
//       setError(`Failed to auto-assign drivers: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmRoutes = () => {
//     const unassignedRoutes = generatedRoutes.filter(route => !route.driver_id);
    
//     if (unassignedRoutes.length > 0) {
//       setError(`Please assign drivers to all routes. ${unassignedRoutes.length} routes still need driver assignment.`);
//       return;
//     }
    
//     setActiveTab(3);
//     setSuccess('Routes confirmed and ready for dispatch to drivers.');
//   };

//   const dispatchAllRoutes = async () => {
//     const routeIds = generatedRoutes.map(route => route.route_id);
    
//     if (routeIds.length === 0) return;
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.dispatchRoutes(routeIds);
      
//       if (result.success) {
//         setGeneratedRoutes(prev => prev.map(route => ({
//           ...route,
//           status: 'dispatched',
//           dispatched_at: new Date().toISOString()
//         })));
//         setSuccess(`All ${routeIds.length} routes dispatched successfully!`);
//       } else {
//         throw new Error(result.message || 'Dispatch failed');
//       }
//     } catch (error) {
//       setError(`Failed to dispatch routes: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewRouteDetails = async (routeId) => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.getRouteDetails(routeId);
      
//       if (result.success) {
//         setRouteOrders(result.orders);
//         setSelectedRoute(generatedRoutes.find(r => r.route_id === routeId));
//       } else {
//         throw new Error(result.message || 'Failed to load route details');
//       }
//     } catch (error) {
//       setError(`Failed to load route details: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await ordersAPI.updateDeliveryStatus(orderId, newStatus);
      
//       if (result.success) {
//         setRouteOrders(prev => prev.map(order => 
//           order.id === orderId ? { ...order, delivery_status: newStatus } : order
//         ));

//         if (result.route_progress && selectedRoute) {
//           setGeneratedRoutes(prev => prev.map(route =>
//             route.route_id === selectedRoute.route_id
//               ? { 
//                   ...route, 
//                   completed_orders: result.route_progress.completed,
//                   progress_percentage: result.route_progress.percentage,
//                   status: result.route_progress.percentage === 100 ? 'completed' : 'in_progress'
//                 }
//               : route
//           ));
//         }
        
//         setSuccess(`Order marked as ${newStatus}`);
//       } else {
//         throw new Error(result.message || 'Status update failed');
//       }
//     } catch (error) {
//       setError(`Failed to update order status: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'generated': 'bg-gray-100 text-gray-800',
//       'assigned': 'bg-blue-100 text-blue-800',
//       'dispatched': 'bg-green-100 text-green-800',
//       'in_progress': 'bg-yellow-100 text-yellow-800',
//       'completed': 'bg-green-100 text-green-800'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const formatDuration = (minutes) => {
//     if (minutes < 60) return `${minutes}min`;
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}min`;
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">xRuto Route Optimization</h1>
//         <p className="text-gray-600">AI-powered clustering and route optimization using HERE Maps navigation</p>
//         <p className="text-xs text-gray-500 mt-1">API: {API_BASE_URL}</p>
//         {availableDrivers.length === 0 && eligibleOrders.length > 0 && (
//           <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
//             ⚠️ No drivers available. Please add drivers in the Admin section before creating routes.
//           </div>
//         )}
//       </div>

//       {/* Status Messages */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//             </svg>
//             {error}
//           </div>
//         </div>
//       )}
      
//       {success && (
//         <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             {success}
//           </div>
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl">
//             <div className="flex items-center space-x-3">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <span className="text-lg">Processing optimization...</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tab Navigation */}
//       <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
//         {[
//           { id: 1, label: 'Filter Orders', desc: 'Select areas & generate zones', count: eligibleOrders.length },
//           { id: 2, label: 'Route Review', desc: 'Assign drivers & optimize', count: generatedRoutes.length },
//           { id: 3, label: 'Route Dispatch', desc: 'Monitor & dispatch routes', count: generatedRoutes.filter(r => r.status === 'dispatched').length }
//         ].map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`flex-1 px-4 py-3 text-center rounded-md transition-colors relative ${
//               activeTab === tab.id 
//                 ? 'bg-blue-500 text-white shadow-md' 
//                 : 'text-gray-600 hover:bg-gray-100'
//             }`}
//           >
//             <div className="font-medium">{tab.label}</div>
//             <div className="text-xs opacity-75">{tab.desc}</div>
//             {tab.count > 0 && (
//               <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center ${
//                 activeTab === tab.id ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'
//               }`}>
//                 {tab.count}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* Optimization Summary */}
//       <div className="mb-6 bg-white rounded-lg shadow-md p-4">
//         <h2 className="text-lg font-semibold mb-3 flex items-center">
//           <span className="mr-2">📊</span>
//           Route Optimization Summary
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-3 bg-blue-50 rounded-lg">
//             <div className="text-2xl font-bold text-blue-600">{eligibleOrders.length}</div>
//             <div className="text-sm text-blue-800">Total Orders</div>
//           </div>
//           <div className="text-center p-3 bg-green-50 rounded-lg">
//             <div className="text-2xl font-bold text-green-600">{previewZones.length}</div>
//             <div className="text-sm text-green-800">Generated Zones</div>
//           </div>
//           <div className="text-center p-3 bg-purple-50 rounded-lg">
//             <div className="text-2xl font-bold text-purple-600">{generatedRoutes.length}</div>
//             <div className="text-sm text-purple-800">Optimized Routes</div>
//           </div>
//           <div className="text-center p-3 bg-orange-50 rounded-lg">
//             <div className="text-2xl font-bold text-orange-600">{availableDrivers.length}</div>
//             <div className="text-sm text-orange-800">Available Drivers</div>
//           </div>
//         </div>
//         <div className="mt-3 text-sm text-gray-600 text-center">
//           Navigation powered by HERE Maps - click "View in HERE Maps" buttons to open optimized routes
//         </div>
//       </div>

//       {/* Tab 1: Filter Orders */}
//       {activeTab === 1 && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Postcode Selection */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-xl font-semibold mb-4">Select Delivery Areas</h2>
            
//             <div className="mb-4 p-4 bg-blue-50 rounded-lg">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-blue-600 font-semibold">{eligibleOrders.length}</span>
//                   <span className="text-blue-800 ml-1">Total Orders</span>
//                 </div>
//                 <div>
//                   <span className="text-blue-600 font-semibold">{selectedPostcodes.length}</span>
//                   <span className="text-blue-800 ml-1">Selected Areas</span>
//                 </div>
//               </div>
//             </div>
            
//             {availablePostcodes.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 <div className="text-4xl mb-2">📦</div>
//                 <p>No postcode areas found</p>
//                 <p className="text-sm">Please check your orders data</p>
//               </div>
//             ) : (
//               <div className="space-y-3 max-h-80 overflow-y-auto">
//                 {availablePostcodes.map(postcode => {
//                   const ordersInPostcode = eligibleOrders.filter(o => o.postcode.startsWith(postcode));
//                   return (
//                     <label key={postcode} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedPostcodes.includes(postcode)}
//                           onChange={() => handlePostcodeToggle(postcode)}
//                           className="h-4 w-4 text-blue-600 rounded mr-3"
//                         />
//                         <span className="font-medium">{postcode}</span>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-sm font-semibold">{ordersInPostcode.length} orders</div>
//                         <div className="text-xs text-gray-500">
//                           £{ordersInPostcode.reduce((sum, o) => sum + (o.order_value || 0), 0).toFixed(2)}
//                         </div>
//                       </div>
//                     </label>
//                   );
//                 })}
//               </div>
//             )}

//             <div className="mt-6 space-y-3">
//               <button
//                 onClick={previewClustering}
//                 disabled={selectedPostcodes.length === 0 || loading}
//                 className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//               >
//                 {loading ? 'Generating Clusters...' : 'Generate Clusters using AI'}
//               </button>
              
//               {previewZones.length > 0 && (
//                 <button
//                   onClick={generateRoutesFromZones}
//                   disabled={loading}
//                   className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-medium"
//                 >
//                   Generate Optimized Routes →
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Zone Preview */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-xl font-semibold mb-4">Clustering Preview</h2>
//             {previewZones.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 <div className="text-6xl mb-4">🗺️</div>
//                 <p className="text-lg mb-2">No clusters generated yet</p>
//                 <p className="text-sm">Select postcode areas and click "Generate Clusters" to see AI-powered zones</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="text-sm text-gray-600 mb-4">
//                   Generated {previewZones.length} zones using K-means clustering algorithm
//                 </div>
//                 {previewZones.map(zone => (
//                   <div key={zone.zone_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <div 
//                           className="w-4 h-4 rounded-full mr-3"
//                           style={{ backgroundColor: zone.color_hex }}
//                         ></div>
//                         <h3 className="font-medium">{zone.zone_name}</h3>
//                       </div>
//                       <span className="text-sm font-semibold text-gray-700">{zone.total_orders} orders</span>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div className="text-gray-600">
//                         <span className="font-medium">Duration:</span> ~{formatDuration(zone.estimated_duration)}
//                       </div>
//                       <div className="text-gray-600">
//                         <span className="font-medium">Value:</span> £{zone.total_value || 0}
//                       </div>
//                       <div className="text-gray-600">
//                         <span className="font-medium">Weight:</span> {zone.total_weight_kg || 0}kg
//                       </div>
//                       <div className="text-gray-600">
//                         <span className="font-medium">Efficiency:</span> {zone.efficiency_score || 85}%
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Tab 2: Route Review */}
//       {activeTab === 2 && (
//         <div className="space-y-6">
//           <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
//             <div>
//               <h2 className="text-xl font-semibold">Route Optimization Results</h2>
//               <p className="text-gray-600">{generatedRoutes.length} routes generated from {previewZones.length} zones</p>
//             </div>
//             <div className="space-x-3">
//               <button
//                 onClick={autoAssignAllDrivers}
//                 disabled={loading || availableDrivers.length === 0}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//               >
//                 Auto-Assign Drivers
//               </button>
//               <button
//                 onClick={confirmRoutes}
//                 disabled={loading || generatedRoutes.some(r => !r.driver_id)}
//                 className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
//               >
//                 Confirm Routes →
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {generatedRoutes.map(route => (
//               <div key={route.route_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-4 h-4 rounded-full mr-3"
//                       style={{ backgroundColor: route.zone_color }}
//                     ></div>
//                     <h3 className="font-semibold text-gray-900">{route.route_name}</h3>
//                   </div>
//                   <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(route.status)}`}>
//                     {route.status}
//                   </span>
//                 </div>

//                 <div className="space-y-3 mb-4">
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span className="text-gray-600">Orders:</span>
//                       <span className="font-medium ml-1">{route.total_orders}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Distance:</span>
//                       <span className="font-medium ml-1">{route.total_distance_miles} mi</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Duration:</span>
//                       <span className="font-medium ml-1">{formatDuration(route.estimated_duration_minutes)}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Fuel Cost:</span>
//                       <span className="font-medium ml-1">£{route.estimated_fuel_cost}</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-gray-600">Efficiency Score:</span>
//                     <div className="flex items-center">
//                       <span className="font-medium text-green-600 mr-1">{route.route_efficiency_score}%</span>
//                       <span className="text-xs text-gray-500">({route.source || 'optimized'})</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Assign Driver:
//                     </label>
//                     <select
//                       value={route.driver_id || ''}
//                       onChange={(e) => assignDriverToRoute(route.route_id, e.target.value)}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       disabled={loading}
//                     >
//                       <option value="">Select Driver</option>
//                       {availableDrivers.map(driver => (
//                         <option key={driver.id} value={driver.id}>
//                           {driver.name} ({driver.mpg} MPG)
//                         </option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   {route.driver_id && (
//                     <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center">
//                       <span className="mr-1">✓</span>
//                       <span>Assigned to {route.driver_name}</span>
//                     </div>
//                   )}

//                   {route.navigation_url && (
//                     <a
//                       href={route.navigation_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="block w-full text-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
//                     >
//                       🗺️ Open in HERE Maps
//                     </a>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Tab 3: Route Dispatch */}
//       {activeTab === 3 && (
//         <div className="space-y-6">
//           <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
//             <div>
//               <h2 className="text-xl font-semibold">Route Dispatch Control</h2>
//               <p className="text-gray-600">Monitor and dispatch confirmed routes to drivers</p>
//             </div>
//             <button
//               onClick={dispatchAllRoutes}
//               disabled={loading || generatedRoutes.every(r => r.status === 'dispatched')}
//               className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Dispatching...' : 'Dispatch All Routes'}
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {generatedRoutes.map(route => (
//               <div key={route.route_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center">
//                     <div 
//                       className="w-4 h-4 rounded-full mr-3"
//                       style={{ backgroundColor: route.zone_color }}
//                     ></div>
//                     <h3 className="font-semibold">{route.route_name}</h3>
//                   </div>
//                   <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(route.status)}`}>
//                     {route.status}
//                   </span>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex justify-between text-sm mb-1">
//                     <span>Progress</span>
//                     <span>{route.progress_percentage || 0}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-green-500 h-2 rounded-full transition-all duration-300"
//                       style={{ width: `${route.progress_percentage || 0}%` }}
//                     ></div>
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {route.completed_orders || 0}/{route.total_orders} deliveries completed
//                   </div>
//                 </div>

//                 <div className="space-y-2 text-sm mb-4">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Driver:</span>
//                     <span className="font-medium">{route.driver_name || 'Unassigned'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Distance:</span>
//                     <span>{route.total_distance_miles} mi</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Est. Duration:</span>
//                     <span>{formatDuration(route.estimated_duration_minutes)}</span>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <button
//                     onClick={() => viewRouteDetails(route.route_id)}
//                     disabled={loading}
//                     className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-50"
//                   >
//                     View Order Details
//                   </button>
                  
//                   {route.navigation_url && (
//                     <a
//                       href={route.navigation_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
//                     >
//                       🧭 Navigate Route
//                     </a>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Route Details Modal */}
//           {selectedRoute && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-96 overflow-hidden">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <div className="flex items-center">
//                       <h3 className="text-lg font-semibold mr-4">{selectedRoute.route_name} - Delivery Checklist</h3>
//                       {selectedRoute.navigation_url && (
//                         <a
//                           href={selectedRoute.navigation_url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
//                         >
//                           🗺️ Open Route
//                         </a>
//                       )}
//                     </div>
//                     <button
//                       onClick={() => setSelectedRoute(null)}
//                       className="text-gray-400 hover:text-gray-600 text-xl"
//                     >
//                       ×
//                     </button>
//                   </div>
                  
//                   <div className="overflow-y-auto max-h-80">
//                     <div className="space-y-3">
//                       {routeOrders.map(order => (
//                         <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
//                           <div className="flex-1">
//                             <div className="flex items-center mb-1">
//                               <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
//                                 #{order.sequence_number}
//                               </span>
//                               <span className="font-medium">{order.customer_name}</span>
//                             </div>
//                             <div className="text-sm text-gray-600">{order.delivery_address}</div>
//                             <div className="text-xs text-gray-500">{order.postcode}</div>
//                             {order.special_instructions && (
//                               <div className="text-xs text-orange-600 mt-1">
//                                 Note: {order.special_instructions}
//                               </div>
//                             )}
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             {order.delivery_status === 'delivered' ? (
//                               <span className="text-green-600 font-medium flex items-center">
//                                 <span className="mr-1">✓</span>
//                                 Delivered
//                               </span>
//                             ) : (
//                               <button
//                                 onClick={() => updateOrderStatus(order.id, 'delivered')}
//                                 disabled={loading}
//                                 className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
//                               >
//                                 Mark Delivered
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;
import React, { useState, useEffect } from 'react';
import PDFUpload from './PDFUpload';
import TextBulkUpload from './TextBulkUpload';

// API service configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ordersAPI = {
  getEligibleOrders: async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/eligible?date=${date}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('API Error - getEligibleOrders:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  },

  generateClusters: async (selectedPostcodes, maxZones = 5) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/generate-clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_postcodes: selectedPostcodes,
          clustering_algorithm: 'kmeans',
          max_zones: maxZones,
          date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - generateClusters:', error);
      throw new Error(`Failed to generate clusters: ${error.message}`);
    }
  },

  generateRoutes: async (zones) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/generate-routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zones,
          date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - generateRoutes:', error);
      throw new Error(`Failed to generate routes: ${error.message}`);
    }
  },

  getAvailableDrivers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/available-drivers`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('API Error - getAvailableDrivers:', error);
      throw new Error(`Failed to fetch drivers: ${error.message}`);
    }
  },

  autoAssignDrivers: async (routes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/auto-assign-drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routes, method: 'round_robin' })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - autoAssignDrivers:', error);
      throw new Error(`Failed to auto-assign drivers: ${error.message}`);
    }
  },

  assignDriver: async (routeId, driverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route_id: routeId, driver_id: driverId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - assignDriver:', error);
      throw new Error(`Failed to assign driver: ${error.message}`);
    }
  },

  dispatchRoutes: async (routeIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/dispatch-routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route_ids: routeIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - dispatchRoutes:', error);
      throw new Error(`Failed to dispatch routes: ${error.message}`);
    }
  },

  resetOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/reset`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Error - resetOrders:', error);
      throw new Error(`Failed to reset orders: ${error.message}`);
    }
  }
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState(0); // Changed to start with upload tab
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text', 'pdf', or 'excel'
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);
  const [selectedPostcodes, setSelectedPostcodes] = useState([]);
  const [availablePostcodes, setAvailablePostcodes] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [previewZones, setPreviewZones] = useState([]);
  const [generatedRoutes, setGeneratedRoutes] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const ordersData = await ordersAPI.getEligibleOrders(
        new Date().toISOString().split('T')[0]
      );
      
      if (ordersData.success) {
        setEligibleOrders(ordersData.orders);
        setAvailablePostcodes(ordersData.postcode_options);
        
        if (ordersData.orders.length === 0) {
          setError('No eligible orders found for today.');
        }
      } else {
        throw new Error(ordersData.message || 'Failed to load orders');
      }
      
      const driversData = await ordersAPI.getAvailableDrivers();
      if (driversData.success) {
        setAvailableDrivers(driversData.drivers);
        
        if (driversData.drivers.length === 0) {
          setError('No available drivers found. Please add drivers in Admin.');
        }
      }
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle new orders uploaded via PDF
  const handleOrdersUploaded = async (newOrders) => {
    try {
      setSuccess(`Successfully uploaded ${newOrders.length} orders from PDF`);
      
      // Reload orders data to include new orders
      await loadInitialData();
      
      // Switch to filter orders tab to review the uploaded orders
      setActiveTab(1);
    } catch (error) {
      console.error('Error handling uploaded orders:', error);
      setError('Failed to process uploaded orders');
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handlePostcodeToggle = (postcode) => {
    setSelectedPostcodes(prev => 
      prev.includes(postcode) 
        ? prev.filter(p => p !== postcode)
        : [...prev, postcode]
    );
  };

  const previewClustering = async () => {
    if (selectedPostcodes.length === 0) {
      setError('Please select at least one postcode area');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await ordersAPI.generateClusters(selectedPostcodes, 5);
      
      if (result.success) {
        setPreviewZones(result.zones);
        setSuccess(`Generated ${result.zones.length} zones from ${result.total_orders} orders`);
      } else {
        throw new Error(result.message || 'Clustering failed');
      }
    } catch (error) {
      setError(`Clustering failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetOrders = async () => {
    setResetting(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await ordersAPI.resetOrders();
      
      if (result.success) {
        setSuccess(`Successfully reset ${result.deletedCount} orders`);
        // Refresh the data after reset
        await loadInitialData();
        setShowResetConfirm(false);
      } else {
        throw new Error(result.message || 'Reset failed');
      }
    } catch (error) {
      setError(`Reset failed: ${error.message}`);
    } finally {
      setResetting(false);
    }
  };

  const generateRoutesFromZones = async () => {
    if (previewZones.length === 0) {
      setError('No zones available. Please generate clusters first.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await ordersAPI.generateRoutes(previewZones);
      
      if (result.success) {
        setGeneratedRoutes(result.routes);
        setSuccess(`Generated ${result.routes.length} optimized routes with depot returns`);
        setActiveTab(2);
      } else {
        throw new Error(result.message || 'Route generation failed');
      }
    } catch (error) {
      setError(`Route generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const assignDriverToRoute = async (routeId, driverId) => {
    if (!driverId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await ordersAPI.assignDriver(routeId, driverId);
      
      if (result.success) {
        setGeneratedRoutes(prev => prev.map(route => 
          route.route_id === routeId 
            ? { 
                ...route, 
                driver_id: driverId, 
                driver_name: result.driver.name, 
                status: 'assigned' 
              }
            : route
        ));
        setSuccess('Driver assigned successfully');
      } else {
        throw new Error(result.message || 'Driver assignment failed');
      }
    } catch (error) {
      setError(`Failed to assign driver: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignAllDrivers = async () => {
    if (generatedRoutes.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await ordersAPI.autoAssignDrivers(generatedRoutes);
      
      if (result.success) {
        setGeneratedRoutes(result.routes);
        setSuccess(`Auto-assigned drivers to all routes`);
      } else {
        throw new Error(result.message || 'Auto-assignment failed');
      }
    } catch (error) {
      setError(`Failed to auto-assign drivers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmRoutes = () => {
    const unassignedRoutes = generatedRoutes.filter(route => !route.driver_id);
    
    if (unassignedRoutes.length > 0) {
      setError(`Please assign drivers to all routes. ${unassignedRoutes.length} routes need drivers.`);
      return;
    }
    
    setActiveTab(3);
    setSuccess('Routes confirmed and ready for dispatch.');
  };

  const dispatchAllRoutes = async () => {
    const routeIds = generatedRoutes.map(route => route.route_id);
    
    if (routeIds.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await ordersAPI.dispatchRoutes(routeIds);
      
      if (result.success) {
        setGeneratedRoutes(prev => prev.map(route => ({
          ...route,
          status: 'dispatched',
          dispatched_at: new Date().toISOString()
        })));
        setSuccess(`All ${routeIds.length} routes dispatched successfully!`);
      } else {
        throw new Error(result.message || 'Dispatch failed');
      }
    } catch (error) {
      setError(`Failed to dispatch routes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'generated': return 'bg-gray-500/20 text-gray-300';
      case 'assigned': return 'bg-blue-500/20 text-blue-300';
      case 'dispatched': return 'bg-green-500/20 text-green-300';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-transparent min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">xRuto Route Optimization</h1>
          <p className="text-gray-400">AI-powered clustering with depot return logic</p>
        </div>
        
        {/* Reset Orders Button */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Orders: {eligibleOrders.length}</span>
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={resetting || loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {resetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Reset Orders</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1835] border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-lg text-white">Processing optimization...</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
        {[
          { id: 0, label: 'Upload Orders', desc: 'From PDF file', count: 0 },
          { id: 1, label: 'Filter Orders', desc: 'Select & cluster', count: eligibleOrders.length },
          { id: 2, label: 'Route Review', desc: 'Assign drivers', count: generatedRoutes.length },
          { id: 3, label: 'Dispatch', desc: 'Send to drivers', count: generatedRoutes.filter(r => r.status === 'dispatched').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-center rounded-md transition-colors relative ${
              activeTab === tab.id 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <div className="font-medium">{tab.label}</div>
            <div className="text-xs opacity-75">{tab.desc}</div>
            {tab.count > 0 && (
              <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center ${
                activeTab === tab.id ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Optimization Summary */}
      <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
          <span className="mr-2">📊</span>
          Enhanced Route Optimization Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-500/10 rounded-xl">
            <div className="text-2xl font-bold text-blue-400">{eligibleOrders.length}</div>
            <div className="text-sm text-blue-300">Total Orders</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-xl">
            <div className="text-2xl font-bold text-green-400">{previewZones.length}</div>
            <div className="text-sm text-green-300">Generated Zones</div>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded-xl">
            <div className="text-2xl font-bold text-purple-400">{generatedRoutes.length}</div>
            <div className="text-sm text-purple-300">Optimized Routes</div>
          </div>
          <div className="text-center p-3 bg-orange-500/10 rounded-xl">
            <div className="text-2xl font-bold text-orange-400">
              {generatedRoutes.reduce((sum, r) => sum + (r.depot_returns_count || 0), 0)}
            </div>
            <div className="text-sm text-orange-300">Depot Returns</div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-400 text-center">
          ✨ Enhanced with realistic time calculation & depot return logic
        </div>
      </div>

      {/* Tab 0: Upload Orders */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Upload Method Selector */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Choose Upload Method</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setUploadMethod('text')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  uploadMethod === 'text'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                📝 Text Copy-Paste
                <div className="text-xs mt-1 opacity-75">
                  Fastest & Easiest
                </div>
              </button>
              <button
                onClick={() => setUploadMethod('pdf')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  uploadMethod === 'pdf'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                📄 PDF Upload
                <div className="text-xs mt-1 opacity-75">
                  From PDF files
                </div>
              </button>
              <button
                onClick={() => setUploadMethod('excel')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  uploadMethod === 'excel'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                📊 Excel Upload
                <div className="text-xs mt-1 opacity-75">
                  .xlsx / .xls files
                </div>
              </button>
            </div>
          </div>

          {/* Upload Interface */}
          <div className="flex justify-center">
            {uploadMethod === 'text' ? (
              <TextBulkUpload onOrdersUploaded={handleOrdersUploaded} />
            ) : uploadMethod === 'pdf' ? (
              <PDFUpload onOrdersUploaded={handleOrdersUploaded} />
            ) : (
              /* Excel Upload */
              <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Upload Excel File</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Accepts <span className="text-orange-400">.xlsx</span> / <span className="text-orange-400">.xls</span> files.
                  Expected columns: <span className="text-gray-300">Order ID, Customer Name, Address, Lat, Lon, Meal Qty</span>
                </p>
                <label className="block w-full cursor-pointer border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange-400/50 transition-colors">
                  <span className="text-4xl mb-3 block">📊</span>
                  <span className="text-gray-300 font-medium">{excelFile ? excelFile.name : 'Click to choose Excel file'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={e => { setExcelFile(e.target.files[0] || null); setExcelResult(null); }}
                  />
                </label>
                {excelFile && (
                  <button
                    disabled={excelUploading}
                    onClick={async () => {
                      setExcelUploading(true);
                      setExcelResult(null);
                      try {
                        const form = new FormData();
                        form.append('excelFile', excelFile);
                        const res = await fetch(`${API_BASE_URL}/orders/upload-excel`, { method: 'POST', body: form });
                        const data = await res.json();
                        if (data.success) {
                          setExcelResult({ type: 'success', message: data.message, count: data.insertedCount });
                          setExcelFile(null);
                          if (handleOrdersUploaded) handleOrdersUploaded(data.orders);
                        } else {
                          setExcelResult({ type: 'error', message: data.message });
                        }
                      } catch (err) {
                        setExcelResult({ type: 'error', message: err.message });
                      } finally {
                        setExcelUploading(false);
                      }
                    }}
                    className="mt-4 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold transition-colors"
                  >
                    {excelUploading ? 'Uploading…' : 'Upload Excel Orders'}
                  </button>
                )}
                {excelResult && (
                  <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${excelResult.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {excelResult.type === 'success' ? `✅ ${excelResult.message}` : `❌ ${excelResult.message}`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Filter Orders */}
      {activeTab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Postcode Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Select Delivery Areas</h2>
            
            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-400 font-semibold">{eligibleOrders.length}</span>
                  <span className="text-blue-300 ml-1">Total Orders</span>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold">{selectedPostcodes.length}</span>
                  <span className="text-blue-300 ml-1">Selected Areas</span>
                </div>
              </div>
            </div>
            
            {availablePostcodes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📦</div>
                <p>No postcode areas found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availablePostcodes.map(postcode => {
                  const ordersInPostcode = eligibleOrders.filter(o => o.postcode.startsWith(postcode));
                  const avgDistance = ordersInPostcode.reduce((sum, o) => sum + (o.distance_from_depot_km || 0), 0) / ordersInPostcode.length;
                  
                  return (
                    <label key={postcode} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPostcodes.includes(postcode)}
                          onChange={() => handlePostcodeToggle(postcode)}
                          className="h-4 w-4 text-blue-600 rounded mr-3"
                        />
                        <div>
                          <span className="font-medium text-white">{postcode}</span>
                          <div className="text-xs text-gray-400">
                            Avg {avgDistance.toFixed(1)}km from depot
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{ordersInPostcode.length} orders</div>
                        <div className="text-xs text-gray-400">
                          £{ordersInPostcode.reduce((sum, o) => sum + (o.order_value || 0), 0).toFixed(2)}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={previewClustering}
                disabled={selectedPostcodes.length === 0 || loading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Generate Clusters with AI'}
              </button>
              
              {previewZones.length > 0 && (
                <button
                  onClick={generateRoutesFromZones}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-medium"
                >
                  Generate Optimized Routes →
                </button>
              )}
            </div>
          </div>

          {/* Zone Preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Clustering Preview</h2>
            {previewZones.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg mb-2">No clusters generated yet</p>
                <p className="text-sm">Select postcodes and click "Generate Clusters"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4">
                  Generated {previewZones.length} zones using enhanced K-means clustering
                </div>
                {previewZones.map(zone => (
                  <div key={zone.zone_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: zone.color_hex }}
                        ></div>
                        <h3 className="font-medium text-white">{zone.zone_name}</h3>
                      </div>
                      <span className="text-sm font-semibold text-gray-300">{zone.total_orders} orders</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-gray-400">
                        <span className="font-medium text-gray-300">Distance:</span> {zone.route_distance_km?.toFixed(1) || 'N/A'}km
                      </div>
                      <div className="text-gray-400">
                        <span className="font-medium text-gray-300">Duration:</span> ~{formatDuration(zone.estimated_duration)}
                      </div>
                      <div className="text-gray-400">
                        <span className="font-medium text-gray-300">Value:</span> £{zone.total_value || 0}
                      </div>
                      <div className="text-gray-400">
                        <span className="font-medium text-gray-300">Returns:</span> {zone.depot_returns_needed || 0}x
                      </div>
                    </div>
                    {zone.depot_returns_needed > 1 && (
                      <div className="mt-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg">
                        🔄 Route includes {zone.depot_returns_needed} depot return(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Route Review */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white">Enhanced Route Results</h2>
              <p className="text-gray-400">{generatedRoutes.length} routes with realistic calculations</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={autoAssignAllDrivers}
                disabled={loading || availableDrivers.length === 0}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50"
              >
                Auto-Assign Drivers
              </button>
              <button
                onClick={confirmRoutes}
                disabled={loading || generatedRoutes.some(r => !r.driver_id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Confirm Routes →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedRoutes.map(route => (
              <div key={route.route_id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: route.zone_color }}
                    ></div>
                    <h3 className="font-semibold text-white">{route.route_name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Orders:</span>
                      <span className="font-medium ml-1 text-white">{route.total_orders}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Distance:</span>
                      <span className="font-medium ml-1 text-white">{route.total_distance_km?.toFixed(1)}km</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="font-medium ml-1 text-white">{formatDuration(route.estimated_duration_minutes)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Fuel:</span>
                      <span className="font-medium ml-1 text-white">£{route.estimated_fuel_cost}</span>
                    </div>
                  </div>
                  
                  {route.depot_returns_count > 0 && (
                    <div className="flex items-center justify-between text-sm bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg">
                      <span className="text-orange-400">🔄 Depot Returns:</span>
                      <span className="font-medium text-orange-300">{route.depot_returns_count}x</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Efficiency:</span>
                    <span className="font-medium text-green-400">{Number(route.route_efficiency_score).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Assign Driver:
                    </label>
                    <select
                      value={route.driver_id || ''}
                      onChange={(e) => assignDriverToRoute(route.route_id, e.target.value)}
                      className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                      disabled={loading}
                    >
                      <option value="" className="bg-gray-800 text-white">Select Driver</option>
                      {availableDrivers.map(driver => (
                        <option key={driver.id} value={driver.id} className="bg-gray-800 text-white">
                          {driver.name} ({driver.mpg} MPG)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {route.driver_id && (
                    <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg flex items-center">
                      <span className="mr-1">✓</span>
                      <span>Assigned to {route.driver_name}</span>
                    </div>
                  )}

                  {route.navigation_url && (
                    <a
                      href={route.navigation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-3 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 text-sm font-medium"
                    >
                      🗺️ View Route Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dispatch */}
      {activeTab === 3 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div>
              <h2 className="text-xl font-semibold text-white">Route Dispatch Control</h2>
              <p className="text-gray-400">Monitor and dispatch routes to drivers</p>
            </div>
            <button
              onClick={dispatchAllRoutes}
              disabled={loading || generatedRoutes.every(r => r.status === 'dispatched')}
              className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Dispatching...' : 'Dispatch All Routes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedRoutes.map(route => (
              <div key={route.route_id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: route.zone_color }}
                    ></div>
                    <h3 className="font-semibold text-white">{route.route_name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-gray-300">{route.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${route.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {route.completed_orders || 0}/{route.total_orders} deliveries completed
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driver:</span>
                    <span className="font-medium text-white">{route.driver_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance:</span>
                    <span className="text-white">{route.total_distance_km?.toFixed(1)}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{formatDuration(route.estimated_duration_minutes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Depot Returns:</span>
                    <span className="font-medium text-orange-400">{route.depot_returns_count || 0}x</span>
                  </div>
                </div>

                {route.depot_returns_count > 1 && (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <div className="text-xs text-orange-400 font-medium mb-1">
                      Multi-Segment Route
                    </div>
                    <div className="text-xs text-orange-300">
                      Driver will return to depot {route.depot_returns_count} times during this route
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {route.navigation_url && (
                    <a
                      href={route.navigation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                    >
                      🧭 Navigate Route
                    </a>
                  )}
                  
                  {route.status === 'dispatched' && (
                    <div className="text-center text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg">
                      ✓ Dispatched at {new Date(route.dispatched_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1835] border border-white/10 p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Reset All Orders</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300">
                Are you sure you want to delete all {eligibleOrders.length} orders? This will permanently remove all order data from the database.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="flex-1 px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetOrders}
                disabled={resetting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {resetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset All Orders</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;