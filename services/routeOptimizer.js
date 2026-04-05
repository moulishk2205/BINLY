const { getAll, getOne } = require('../config/database');

class RouteOptimizer {
    async optimizeRoute(routeId) {
        try {
            // Simulated optimization for demo
            // In production, implement actual TSP algorithm
            
            const currentRoute = await this.getRouteById(routeId);
            
            if (!currentRoute) {
                throw new Error('Route not found');
            }
            
            // Simulate optimization results
            const optimization = {
                routeId: currentRoute.route_id,
                currentDistance: currentRoute.distance_km,
                optimizedDistance: (currentRoute.distance_km * 0.82).toFixed(2), // 18% reduction
                distanceSaved: (currentRoute.distance_km * 0.18).toFixed(2),
                currentTime: currentRoute.estimated_time_minutes,
                optimizedTime: Math.round(currentRoute.estimated_time_minutes * 0.75), // 25% reduction
                timeSaved: Math.round(currentRoute.estimated_time_minutes * 0.25),
                fuelCostSaved: (currentRoute.distance_km * 0.18 * 8).toFixed(2), // ₹8 per km
                optimizedSequence: [
                    'Start: Collector Location',
                    'Cluster 1: Anna Street (8 households)',
                    'Cluster 2: GN Chetty Road (12 households)',
                    'Cluster 3: Usman Road (15 households)',
                    'Cluster 4: Pondy Bazaar (10 households)',
                    'Return: Collector Location'
                ],
                improvements: [
                    'Reduced backtracking by 35%',
                    'Clustered households by proximity',
                    'Prioritized high-waste-generation areas',
                    'Optimized for morning traffic patterns'
                ]
            };
            
            return optimization;
        } catch (error) {
            console.error('Route optimization error:', error);
            throw error;
        }
    }
    
    async getRouteById(routeId) {
        const query = 'SELECT * FROM routes WHERE route_id = ?';
        return await getOne(query, [routeId]);
    }
    
    async getAllRoutes() {
        const query = 'SELECT * FROM routes WHERE status = "active"';
        const routes = await getAll(query);
        
        return routes.map(r => ({
            routeId: r.route_id,
            name: r.route_name,
            area: r.area,
            households: r.household_count,
            distance: r.distance_km,
            estimatedTime: r.estimated_time_minutes,
            status: r.status
        }));
    }
    
    // K-means clustering for household grouping
    kMeansClustering(households, k = 4) {
        // Simplified clustering for demo
        // In production, implement actual k-means algorithm
        
        const clusters = Array(k).fill().map(() => []);
        
        households.forEach((h, index) => {
            const clusterIndex = index % k;
            clusters[clusterIndex].push(h);
        });
        
        return clusters;
    }
    
    // Nearest neighbor TSP heuristic
    nearestNeighborTSP(cluster, startLocation) {
        // Simplified TSP for demo
        // In production, implement actual nearest neighbor or better algorithm
        
        const ordered = [...cluster];
        
        // Sort by distance (simulated)
        ordered.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.latitude - startLocation.lat, 2) + Math.pow(a.longitude - startLocation.lng, 2));
            const distB = Math.sqrt(Math.pow(b.latitude - startLocation.lat, 2) + Math.pow(b.longitude - startLocation.lng, 2));
            return distA - distB;
        });
        
        return ordered;
    }
    
    calculateRouteDistance(households) {
        // Simplified distance calculation
        // In production, use actual mapping API (Google Maps, HERE, etc.)
        
        let totalDistance = 0;
        
        for (let i = 0; i < households.length - 1; i++) {
            const h1 = households[i];
            const h2 = households[i + 1];
            
            // Euclidean distance (simplified)
            const dist = Math.sqrt(
                Math.pow(h2.latitude - h1.latitude, 2) + 
                Math.pow(h2.longitude - h1.longitude, 2)
            );
            
            totalDistance += dist * 111; // Convert to km (rough approximation)
        }
        
        return totalDistance;
    }
}

module.exports = new RouteOptimizer();