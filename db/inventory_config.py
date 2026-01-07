# db/inventory_config.py
from typing import Dict, Optional, Tuple

# Format: tool_type -> (rows, columns)
INVENTORY_TOOL_MAP: Dict[str, Tuple[int, int]] = {
    "alps": (1, 1),
    "bioshake": (1, 1),
    "bravo": (3, 3),
    "cytation": (1, 1),
    "hamilton": (5, 11),
    "hig_centrifuge": (2, 1),
    "liconic": (10, 5),
    "microserve": (50, 14),
    "opentrons2": (4, 3),
    "plateloc": (1, 1),
    "spectramax": (1, 1),
    "vcode": (1, 1),
    "vprep": (3, 2),
    "xpeel": (1, 1),
}


def get_inventory_config(tool_type: str) -> Optional[Tuple[int, int]]:
    """Get the inventory configuration for a tool type."""
    return INVENTORY_TOOL_MAP.get(tool_type.lower())
