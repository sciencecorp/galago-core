"""teing migration script

Revision ID: 3f4ae18641de
Revises: xxxx
Create Date: 2025-10-27 09:26:59.077598

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f4ae18641de'
down_revision: Union[str, Sequence[str], None] = 'xxxx'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create a test table
    op.create_table(
        'test_migration_table',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
    )
    
    # Create an index
    op.create_index('ix_test_migration_table_name', 'test_migration_table', ['name'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the index first
    op.drop_index('ix_test_migration_table_name', table_name='test_migration_table')
    
    # Drop the table
    op.drop_table('test_migration_table')