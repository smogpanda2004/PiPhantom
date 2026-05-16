import asyncio
import websockets
import statistics
import json
import time
import logging
import numpy as np
from sklearn.cluster import DBSCAN
from scipy.spatial.distance import cdist

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s [HUB] %(levelname)s: %(message)s')

# --- CONFIGURATION ---
WS_PORT = 8765
UDP_PORT = 8765
UDP_IP = "0.0.0.0"

# --- REGISTRY & STATE ---
nodes_meta = {}
windows = {}
variances = {}
last_seen = {}
active_targets = {} # Tracking state for IDs
target_counter = 0
SMOOTHING_FACTOR = 0.6

# --- DBSCAN MULTI-TARGET TRACKING LOGIC ---
def process_multi_targets(variances, nodes_meta, threshold=2.5):
    global target_counter, active_targets
    
    # 1. Identify active points
    points = []
    point_weights = []
    for node_name, var in variances.items():
        if var > threshold:
            node = nodes_meta[node_name]
            points.append([node['x'], node['y']])
            point_weights.append(var) # Use variance as weight for fluid movement
    
    if not points: return []

    # 2. DBSCAN Clustering
    clustering = DBSCAN(eps=5.0, min_samples=1).fit(points)
    labels = clustering.labels_
    
    new_clusters = []
    for label in set(labels):
        if label == -1: continue 
        
        # --- FLUID TRACKING MATH ---
        cluster_indices = np.where(labels == label)[0]
        pts = np.array(points)[cluster_indices]
        weights = np.array(point_weights)[cluster_indices]
        
        # Calculate Weighted Centroid: Target moves toward the node with highest variance!
        weighted_x = np.average(pts[:, 0], weights=weights)
        weighted_y = np.average(pts[:, 1], weights=weights)
        
        new_clusters.append({"x": weighted_x, "y": weighted_y})

    # 3. State Management (Same as before)
    final_targets = []
    updated_ids = set()
    for cluster in new_clusters:
        matched_id = None
        if active_targets:
            existing_ids = list(active_targets.keys())
            existing_coords = [[active_targets[tid]['x'], active_targets[tid]['y']] for tid in existing_ids]
            distances = cdist([[cluster['x'], cluster['y']]], existing_coords)[0]
            min_dist_idx = np.argmin(distances)
            if distances[min_dist_idx] < 2.0:
                matched_id = existing_ids[min_dist_idx]

        if matched_id is None:
            target_counter += 1
            matched_id = f"TGT-{target_counter:02d}"
        
        active_targets[matched_id] = {"x": cluster['x'], "y": cluster['y'], "last_seen": time.time()}
        final_targets.append({"id": matched_id, "x": float(cluster['x']), "y": float(cluster['y'])})
        updated_ids.add(matched_id)

    active_targets = {tid: val for tid, val in active_targets.items() if tid in updated_ids or (time.time() - val['last_seen'] < 1.0)}
    return final_targets

class SpatialUDPProtocol(asyncio.DatagramProtocol):
    def connection_made(self, transport): self.transport = transport
    def datagram_received(self, data, addr):
        try:
            payload = data.decode('utf-8').strip()
            parts = payload.split(',')
            if len(parts) >= 16:
                node_name = parts[0]
                node_x, node_y = float(parts[2]), float(parts[3])
                
                if node_name not in nodes_meta:
                    nodes_meta[node_name] = {"name": node_name, "loc": parts[1], "x": node_x, "y": node_y}
                    windows[node_name] = []
                    variances[node_name] = 0.0
                
                last_seen[node_name] = time.time()
                amplitudes = [int(x) for x in parts[5:15]]
                avg_amp = sum(amplitudes) / len(amplitudes)
                windows[node_name].append(avg_amp)
                if len(windows[node_name]) > 20: windows[node_name].pop(0)
                
                if len(windows[node_name]) > 2:
                    raw_var = statistics.variance(windows[node_name])
                    variances[node_name] = (raw_var * SMOOTHING_FACTOR) + (variances[node_name] * (1.0 - SMOOTHING_FACTOR))
        except: pass

async def hardware_loop(websocket):
    try:
        while True:
            current_time = time.time()
            statuses = {node: (current_time - ts < 2.0) for node, ts in last_seen.items()}
            
            # Logic integration: Calculate multiple targets
            targets = process_multi_targets(variances, nodes_meta, threshold=2.5)

            payload = {
                "variances": variances,
                "statuses": statuses,
                "nodes_meta": nodes_meta,
                "targets": targets # The new Multi-Target Array!
            }
            await websocket.send(json.dumps(payload))
            await asyncio.sleep(0.033) 
    except: pass

async def main():
    loop = asyncio.get_running_loop()
    await loop.create_datagram_endpoint(lambda: SpatialUDPProtocol(), local_addr=(UDP_IP, UDP_PORT))
    async with websockets.serve(hardware_loop, "0.0.0.0", WS_PORT): await asyncio.Future()

if __name__ == "__main__": asyncio.run(main())
