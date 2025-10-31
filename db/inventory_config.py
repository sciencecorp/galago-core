# db/inventory_config.py
from typing import Dict, Tuple

# Format: tool_type -> (rows, columns)
INVENTORY_TOOL_MAP: Dict[str, Tuple[int, int]] = {
    "bravo": (3, 3),
    "opentrons2": (3, 4),
}

def get_inventory_config(tool_type: str) -> Tuple[int, int] | None:
    """Get the inventory configuration for a tool type."""
    return INVENTORY_TOOL_MAP.get(tool_type.lower())