import time
import logging
from functools import wraps
from typing import Callable, Any

logger = logging.getLogger(__name__)

def retry_on_exception(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """
    Exponential backoff retry decorator.
    A hallmark of robust service-to-service communication.
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    logger.warning(
                        "Attempt %d/%d failed: %s. Retrying in %.2fs...",
                        attempt + 1, max_retries, e, delay
                    )
                    time.sleep(delay)
                    delay *= backoff_factor
            
            logger.error("All %d retries failed for %s.", max_retries, func.__name__)
            raise last_exception
        return wrapper
    return decorator
