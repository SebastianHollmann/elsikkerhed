import logging
from src.models import TestStatus

def validate_rcd_test(tripping_time_ms: float, rated_current_ma: float = 30) -> TestStatus:
    """
    Validerer RCD-test i henhold til DS/HD 60364-6

    Args:
        tripping_time_ms: Udløsningstid i millisekunder
        rated_current_ma: Mærkestrømen i milliampere (standard: 30 mA)

    Returns:
        TestStatus: PASS/FAIL/WARNING
    """
    # For Type A RCD med 30 mA
    if rated_current_ma == 30:
        if tripping_time_ms <= 200:  # Hurtig udløsning er god
            return TestStatus.PASS
        elif tripping_time_ms <= 300:  # 300 ms max for Type A
            return TestStatus.PASS
        elif tripping_time_ms <= 400:  # Lidt tolerance
            return TestStatus.WARNING
        else:
            return TestStatus.FAIL
    # Andre typer RCD Tilføjes nedenunder her
    else:
        logging.warning(f"No specific validation for RCD with rated current: {rated_current_ma} mA")
        return TestStatus.FAIL

