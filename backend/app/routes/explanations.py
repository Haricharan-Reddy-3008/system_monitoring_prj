from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database import get_supabase
from supabase import Client

router = APIRouter()

@router.get("/explanations/{project_id}")
async def get_explanations(project_id: str, supabase: Client = Depends(get_supabase)):
    """Get AI explanations for recent anomalies"""
    try:
        # Get recent unresolved anomalies
        anomalies_result = supabase.table("anomalies") \
            .select("*") \
            .eq("project_id", project_id) \
            .eq("resolved", False) \
            .order("detected_at", desc=True) \
            .limit(5) \
            .execute()
        
        if not anomalies_result.data:
            return {
                "project_id": project_id,
                "explanations": [],
                "message": "No active anomalies to explain"
            }
        
        explanations = []
        for anomaly in anomalies_result.data:
            explanation = {
                "anomaly_id": anomaly["id"],
                "type": anomaly["type"],
                "severity": anomaly["severity"],
                "detected_at": anomaly["detected_at"],
                "explanation": f"Detected {anomaly['type'].lower()} anomaly with {anomaly['severity']} severity. {anomaly['description']}",
                "recommendations": _get_recommendations(anomaly["type"], anomaly["severity"])
            }
            explanations.append(explanation)
        
        return {
            "project_id": project_id,
            "explanations": explanations
        }
    except Exception as e:
        print(f"Error generating explanations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/explanations/{project_id}/anomaly/{anomaly_id}")
async def get_anomaly_explanation(
    project_id: str,
    anomaly_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Get detailed AI explanation for a specific anomaly"""
    try:
        result = supabase.table("anomalies") \
            .select("*") \
            .eq("id", anomaly_id) \
            .eq("project_id", project_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Anomaly not found")
        
        anomaly = result.data[0]
        
        return {
            "anomaly_id": anomaly_id,
            "type": anomaly["type"],
            "severity": anomaly["severity"],
            "description": anomaly["description"],
            "detected_at": anomaly["detected_at"],
            "root_cause": _get_root_cause(anomaly["type"]),
            "explanation": f"This {anomaly['type'].lower()} anomaly indicates {_get_detailed_cause(anomaly['type'])}. The current metrics snapshot shows unusual patterns that deviate from normal baselines.",
            "recommendations": _get_recommendations(anomaly["type"], anomaly["severity"]),
            "metric_snapshot": anomaly["metric_snapshot"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _get_root_cause(anomaly_type: str) -> str:
    """Get root cause description based on anomaly type"""
    causes = {
        "high_cpu": "High CPU usage may indicate compute-intensive operations or inefficient code",
        "high_memory": "High memory usage suggests memory leaks or excessive data accumulation",
        "high_error_rate": "Elevated error rate indicates application issues or external service failures",
        "traffic_spike": "Sudden traffic increase may be legitimate or indicate bot activity",
        "latency_increase": "Increased latency suggests resource constraints or network issues",
        "log_spike": "Spike in logs indicates increased activity or potential issues"
    }
    return causes.get(anomaly_type, "Unusual system behavior detected")

def _get_detailed_cause(anomaly_type: str) -> str:
    """Get detailed cause description"""
    details = {
        "high_cpu": "your system is under significant computational load",
        "high_memory": "your system is consuming excessive RAM",
        "high_error_rate": "your application is experiencing failures",
        "traffic_spike": "your system is receiving unusual traffic volume",
        "latency_increase": "your system response times are degraded",
        "log_spike": "your system is generating excessive logs"
    }
    return details.get(anomaly_type, "your system behavior has changed significantly")

def _get_recommendations(anomaly_type: str, severity: str) -> list:
    """Get actionable recommendations"""
    base_recommendations = {
        "high_cpu": [
            "Check for CPU-intensive processes running on the system",
            "Review application code for optimization opportunities",
            "Monitor resource-hungry operations",
            "Consider load balancing or horizontal scaling"
        ],
        "high_memory": [
            "Check for memory leaks in application code",
            "Review memory usage patterns over time",
            "Consider implementing memory limits",
            "Restart services consuming excessive memory"
        ],
        "high_error_rate": [
            "Check application logs for error details",
            "Verify external service dependencies are available",
            "Review recent deployment changes",
            "Monitor database connection pool exhaustion"
        ],
        "traffic_spike": [
            "Monitor traffic patterns for legitimacy",
            "Check for bot or attack patterns",
            "Verify load balancer distribution",
            "Consider rate limiting if malicious"
        ],
        "latency_increase": [
            "Check network connectivity status",
            "Review database query performance",
            "Monitor resource utilization (CPU, memory, I/O)",
            "Check for external service slowness"
        ],
        "log_spike": [
            "Review log contents for error patterns",
            "Check application debug logging levels",
            "Monitor disk space for log storage",
            "Consider log retention policies"
        ]
    }
    
    recommendations = base_recommendations.get(anomaly_type, [
        "Investigate the anomaly cause",
        "Check system health metrics",
        "Review recent changes"
    ])
    
    # Add severity-specific recommendations
    if severity == "critical":
        recommendations.insert(0, "⚠️ URGENT: Immediate action required")
    elif severity == "high":
        recommendations.insert(0, "⚡ HIGH: Prompt investigation recommended")
    
    return recommendations
