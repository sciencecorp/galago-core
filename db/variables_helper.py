import json
import typing as t

class VariableHelpers:
    @staticmethod
    def parse_array_value(value: str) -> list[str]:
        """Parse comma-separated string into list of strings."""
        if not value or value.strip() == "":
            return []
        return [item.strip() for item in value.split(",") if item.strip()]
    
    @staticmethod
    def parse_json_value(value: str) -> t.Any:
        """Parse JSON string into Python object."""
        return json.loads(value)
    
    @staticmethod
    def parse_boolean_value(value: str) -> bool:
        """Parse string boolean into Python boolean."""
        return value.lower() == "true"
    
    @staticmethod
    def parse_number_value(value: str) -> float:
        """Parse string number into Python float."""
        return float(value)
    
    @staticmethod
    def format_array_value(items: list[str]) -> str:
        """Format list of strings into comma-separated string."""
        return ", ".join(str(item) for item in items)
    
    @staticmethod
    def format_json_value(obj: t.Any) -> str:
        """Format Python object into JSON string."""
        return json.dumps(obj, separators=(",", ":"))
    
    @staticmethod
    def get_parsed_value(variable: Variable) -> t.Any:
        """Get the parsed value based on the variable type."""
        if variable.type == "string":
            return variable.value
        elif variable.type == "number":
            return VariableHelpers.parse_number_value(variable.value)
        elif variable.type == "boolean":
            return VariableHelpers.parse_boolean_value(variable.value)
        elif variable.type == "array":
            return VariableHelpers.parse_array_value(variable.value)
        elif variable.type == "json":
            return VariableHelpers.parse_json_value(variable.value)
        else:
            return variable.value