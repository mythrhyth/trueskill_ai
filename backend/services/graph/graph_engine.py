from typing import Dict, Any, List
from backend.schema.matching_schema import GraphNode, GraphEdge

def build_skill_graph(user_id: str, validated_skills: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs a visual representation of the candidate's skill network.
    Uses JSON-based nodes and edges for frontend visualization.
    
    Structure:
    (User) --HAS_SKILL--> (Skill) --VERIFIED_BY--> (Source)
    
    Args:
        user_id (str): The unique identifier of the user.
        validated_skills (List[Dict[str, Any]]): List of validated skills with contributing sources.
        
    Returns:
        Dict[str, Any]: A dictionary containing serialization-ready nodes and edges.
    """
    nodes = []
    edges = []
    
    # Tracking sets to avoid duplicates
    node_ids = set()
    edge_keys = set()

    # 1. ADD USER NODE (ROOT)
    user_node_id = f"user_{user_id}"
    if user_node_id not in node_ids:
        nodes.append(GraphNode(id=user_node_id, label="Candidate", type="User"))
        node_ids.add(user_node_id)

    # 2. PROCESS EACH VALIDATED SKILL
    if not isinstance(validated_skills, list):
        validated_skills = []

    for skill_data in validated_skills:
        skill_name = skill_data.get("name")
        if not skill_name:
            continue
            
        # Standardize skill ID for consistency
        skill_node_id = f"skill_{skill_name.lower().replace(' ', '_')}"
        
        # Add Skill Node
        if skill_node_id not in node_ids:
            nodes.append(GraphNode(id=skill_node_id, label=skill_name, type="Skill"))
            node_ids.add(skill_node_id)
            
        # Add Edge: User -> Skill (HAS_SKILL)
        edge_key = (user_node_id, skill_node_id, "HAS_SKILL")
        if edge_key not in edge_keys:
            edges.append(GraphEdge(
                source=user_node_id, 
                target=skill_node_id, 
                relation="HAS_SKILL"
            ))
            edge_keys.add(edge_key)
            
        # 3. ADD SOURCE NODES AND VERIFICATION EDGES
        explanations = skill_data.get("explanations", {}) or {}
        sources = explanations.get("contributing_sources", [])
        if not isinstance(sources, list):
            sources = []
            
        for source in sources:
            if not source:
                continue
                
            source_node_id = f"source_{source.lower().replace(' ', '_')}"
            
            # Add Source Node (e.g., GitHub, Resume)
            if source_node_id not in node_ids:
                nodes.append(GraphNode(
                    id=source_node_id, 
                    label=source.capitalize(), 
                    type="Source"
                ))
                node_ids.add(source_node_id)
                
            # Add Edge: Skill -> Source (VERIFIED_BY)
            source_edge_key = (skill_node_id, source_node_id, "VERIFIED_BY")
            if source_edge_key not in edge_keys:
                edges.append(GraphEdge(
                    source=skill_node_id, 
                    target=source_node_id, 
                    relation="VERIFIED_BY"
                ))
                edge_keys.add(source_edge_key)

    return {
        "nodes": nodes,
        "edges": edges
    }
