"""Solutions module: a searchable library of business solutions/automations.

Services = what PLS Tech sells. Solutions = tools users can search for and use.
Mount with:  app.include_router(solutions_router, prefix="/api")
"""
from .router import router as solutions_router

__all__ = ["solutions_router"]
