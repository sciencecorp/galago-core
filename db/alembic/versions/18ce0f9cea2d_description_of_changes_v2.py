"""description of changes v2

Revision ID: 18ce0f9cea2d
Revises: 80b6b51f5a16
Create Date: 2025-10-24 21:09:58.199133

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '18ce0f9cea2d'
down_revision: Union[str, Sequence[str], None] = '80b6b51f5a16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
