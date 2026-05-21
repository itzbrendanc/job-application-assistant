from __future__ import annotations

from fastapi import APIRouter

from app.api.routers import applications, auth, cover_letters, jobs, privacy, profile
from app.api.routers.extension.router import router as extension_router
from app.api.routers.billing.router import router as billing_router
from app.api.routers.telemetry.router import router as telemetry_router
from app.api.routers.admin.analytics import router as admin_analytics_router
from app.api.routers.admin.feedback import router as admin_feedback_router
from app.api.routers.admin.beta_invites import router as admin_beta_invites_router
from app.api.routers.admin.waitlist import router as admin_waitlist_router
from app.api.routers.admin.support import router as admin_support_router
from app.api.routers import waitlist, support
from app.api.routers.public import router as public_router

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(jobs.router)
api_router.include_router(cover_letters.router)
api_router.include_router(applications.router)
api_router.include_router(privacy.router)
api_router.include_router(extension_router)
api_router.include_router(billing_router)
api_router.include_router(telemetry_router)
api_router.include_router(admin_analytics_router)
api_router.include_router(admin_feedback_router)
api_router.include_router(admin_beta_invites_router)
api_router.include_router(admin_waitlist_router)
api_router.include_router(admin_support_router)
api_router.include_router(waitlist.router)
api_router.include_router(support.router)
api_router.include_router(public_router)
