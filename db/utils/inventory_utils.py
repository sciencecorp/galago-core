# db/utils/inventory_utils.py
from sqlalchemy.orm import Session
from db.models import inventory_models  # Import the module itself
from db.inventory_config import get_inventory_config
import logging

logger = logging.getLogger(__name__)


def create_default_inventory_nests(
    db: Session, tool_id: int
) -> list[inventory_models.Nest]:
    """
    Create default inventory nests for a tool based on its type.
    """
    # Get the tool
    tool = (
        db.query(inventory_models.Tool)
        .filter(inventory_models.Tool.id == tool_id)
        .first()
    )
    if not tool:
        raise ValueError(f"Tool with id {tool_id} not found")

    # Check if this tool type should have inventory nests
    inventory_config = get_inventory_config(tool.type)
    if not inventory_config:
        logger.info(
            f"Tool type '{tool.type}' is not in inventory map, skipping nest creation"
        )
        return []

    rows, columns = inventory_config

    # Check if nests already exist for this tool
    existing_nests = (
        db.query(inventory_models.Nest)
        .filter(inventory_models.Nest.tool_id == tool_id)
        .all()
    )
    if existing_nests:
        logger.warning(
            f"Tool {tool.name} (id: {tool_id}) already has {len(existing_nests)} nests"
        )
        return existing_nests

    # Create nests
    created_nests = []
    for row in range(0, rows):
        for column in range(0, columns):
            nest = inventory_models.Nest(
                name=f"{tool.name}_R{row}C{column}",
                row=row,
                column=column,
                tool_id=tool_id,
                status=inventory_models.NestStatus.empty,
            )
            db.add(nest)
            created_nests.append(nest)

    db.commit()

    # Refresh all nests to get their IDs
    for nest in created_nests:
        db.refresh(nest)

    logger.info(
        f"Created {len(created_nests)} inventory nests for tool '{tool.name}' ({rows}x{columns})"
    )
    return created_nests


def recreate_inventory_nests(
    db: Session, tool_id: int, force: bool = False
) -> list[inventory_models.Nest]:
    """
    Recreate inventory nests for a tool. Optionally delete existing nests first.

    Args:
        db: Database session
        tool_id: ID of the tool
        force: If True, delete existing nests before creating new ones

    Returns:
        List of created Nest objects
    """
    tool = (
        db.query(inventory_models.Tool)
        .filter(inventory_models.Tool.id == tool_id)
        .first()
    )
    if not tool:
        raise ValueError(f"Tool with id {tool_id} not found")

    if force:
        # Delete existing nests
        db.query(inventory_models.Nest).filter(
            inventory_models.Nest.tool_id == tool_id
        ).delete()
        db.commit()
        logger.info(f"Deleted existing nests for tool '{tool.name}'")

    return create_default_inventory_nests(db, tool_id)
