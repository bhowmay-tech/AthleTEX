import random

class MatchLensService:
    @staticmethod
    def analyze_match(video_path: str, filename: str) -> dict:
        """
        AI engine parsing match footage for player tracking, ball telemetry,
        and high-performance analytics reporting.
        """
        # Simulated detailed tracking telemetry
        total_distance_km = round(random.uniform(8.5, 11.8), 2)
        top_speed_kmh = round(random.uniform(28.4, 34.8), 1)
        avg_speed_kmh = round(random.uniform(5.8, 7.2), 1)
        possession_pct = random.randint(45, 62)
        
        # Simulated heatmap points on a standard 100x100 pitch coordinates
        heatmap_points = [
            {"x": int(random.gauss(60, 15)), "y": int(random.gauss(50, 20)), "intensity": round(random.uniform(0.3, 0.95), 2)}
            for _ in range(80)
        ]
        # Keep values inside 0-100 pitch boundaries
        for p in heatmap_points:
            p["x"] = max(0, min(100, p["x"]))
            p["y"] = max(0, min(100, p["y"]))
            
        # Action highlight timeline logs
        highlights = [
            {"minute": 12, "action": "Sprint Interception", "speed_kmh": 31.2, "x": 42, "y": 18, "type": "interception"},
            {"minute": 34, "action": "Counter-attack Key Pass", "speed_kmh": 22.4, "x": 65, "y": 72, "type": "pass"},
            {"minute": 56, "action": "Shot on Target", "speed_kmh": 29.8, "x": 88, "y": 48, "type": "shot"},
            {"minute": 78, "action": "Goal Assist", "speed_kmh": 26.5, "x": 92, "y": 35, "type": "assist"}
        ]
        
        return {
            "file_analyzed": filename,
            "tactical_insights": {
                "general_shape": "High-pressing mid-block transitions",
                "possession_efficiency": f"{possession_pct}% team contribution",
                "heat_density": "Dominates right half-space & interior channels"
            },
            "performance_metrics": {
                "total_distance_km": total_distance_km,
                "top_speed_kmh": top_speed_kmh,
                "avg_speed_kmh": avg_speed_kmh,
                "accelerations_count": random.randint(18, 35),
                "decelerations_count": random.randint(15, 30),
                "sprints_count": random.randint(12, 24)
            },
            "heatmap": heatmap_points,
            "highlights_timeline": highlights
        }
