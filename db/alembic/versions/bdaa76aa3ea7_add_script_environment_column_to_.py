# alembic/versions/xxxx_add_script_environment_column.py
"""add script_environment column to scripts table

Revision ID: xxxx
Revises: 
Create Date: 2025-xx-xx
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'xxxx'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use batch mode for SQLite
    with op.batch_alter_table('scripts', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('script_environment', sa.String(), nullable=False, server_default='global')
        )


def downgrade() -> None:
    with op.batch_alter_table('scripts', schema=None) as batch_op:
        batch_op.drop_column('script_environment')