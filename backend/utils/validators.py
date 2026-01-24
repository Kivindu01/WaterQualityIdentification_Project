def validate_required_fields(data: dict, required_fields: list):
    """
    Ensure required fields exist in request payload.
    """
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")


def validate_numeric(value, field_name: str):
    """
    Ensure value can be converted to float.
    """
    try:
        return float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a numeric value")


def validate_ranges(raw_ph: float, turbidity: float, conductivity: float):
    """
    Validate water quality parameter ranges.
    """

    if not (0.0 <= raw_ph <= 14.0):
        raise ValueError("raw_ph must be between 0 and 14")

    if turbidity < 0:
        raise ValueError("raw_turbidity must be >= 0")

    if conductivity < 0:
        raise ValueError("raw_conductivity must be >= 0")


def validate_password(password: str):
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters long")
