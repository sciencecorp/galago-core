"""Add protocol processes and command groups

Revision ID: 20f71c412a5e
Revises: 
Create Date: 2025-11-02 03:23:49.445494

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '20f71c412a5e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()
    
    # If protocols table doesn't exist, create ALL tables from scratch
    if 'protocols' not in existing_tables:
        # Import models to get all table definitions
        from models.db_session import Base
        Base.metadata.create_all(conn)
        return
    
    # Otherwise, perform incremental migration
    # Create protocol_processes table if it doesn't exist
    if 'protocol_processes' not in existing_tables:
        op.create_table(
            'protocol_processes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('position', sa.Integer(), nullable=False),
            sa.Column('advanced_parameters', sa.JSON(), nullable=True),
            sa.Column('protocol_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.CheckConstraint("name <> ''", name='check_non_empty_name'),
            sa.ForeignKeyConstraint(['protocol_id'], ['protocols.id'], ),
            sa.PrimaryKeyConstraint('id')
        )

    # Create protocol_command_groups table if it doesn't exist
    if 'protocol_command_groups' not in existing_tables:
        op.create_table(
            'protocol_command_groups',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('process_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.CheckConstraint("name <> ''", name='check_non_empty_name'),
            sa.ForeignKeyConstraint(['process_id'], ['protocol_processes.id'], ),
            sa.PrimaryKeyConstraint('id')
        )

    # Create protocol_commands table if it doesn't exist
    if 'protocol_commands' not in existing_tables:
        op.create_table(
            'protocol_commands',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('tool_type', sa.String(), nullable=False),
            sa.Column('tool_id', sa.String(), nullable=False),
            sa.Column('label', sa.String(), nullable=False),
            sa.Column('command', sa.String(), nullable=False),
            sa.Column('params', sa.JSON(), nullable=False),
            sa.Column('protocol_id', sa.Integer(), nullable=True),
            sa.Column('process_id', sa.Integer(), nullable=True),
            sa.Column('command_group_id', sa.Integer(), nullable=True),
            sa.Column('position', sa.Integer(), nullable=False),
            sa.Column('advanced_parameters', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.CheckConstraint("name <> ''", name='check_non_empty_name'),
            sa.ForeignKeyConstraint(['command_group_id'], ['protocol_command_groups.id'], ),
            sa.ForeignKeyConstraint(['process_id'], ['protocol_processes.id'], ),
            sa.ForeignKeyConstraint(['protocol_id'], ['protocols.id'], ),
            sa.PrimaryKeyConstraint('id')
        )

    # Drop commands column from protocols if it exists
    columns = [col['name'] for col in inspector.get_columns('protocols')]
    if 'commands' in columns:
        with op.batch_alter_table('protocols', schema=None) as batch_op:
            batch_op.drop_column('commands')


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()
    
    # Drop the new tables if they exist
    if 'protocol_commands' in existing_tables:
        op.drop_table('protocol_commands')
    if 'protocol_command_groups' in existing_tables:
        op.drop_table('protocol_command_groups')
    if 'protocol_processes' in existing_tables:
        op.drop_table('protocol_processes')
    
    # Restore commands column to protocols if protocols table exists
    if 'protocols' in existing_tables:
        columns = [col['name'] for col in inspector.get_columns('protocols')]
        if 'commands' not in columns:
            with op.batch_alter_table('protocols', schema=None) as batch_op:
                batch_op.add_column(sa.Column('commands', sqlite.JSON(), nullable=False, server_default='[]'))