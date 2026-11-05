from enum import Enum


class Category(str, Enum):
    CAREER = "career"
    BUSINESS = "business"
    CONTENT = "content"
    SALES = "sales"
    CUSTOMER_SUPPORT = "customer_support"
    DOCUMENTS = "documents"
    AUTOMATION = "automation"
    PRODUCTIVITY = "productivity"


CATEGORY_LABELS: dict[str, str] = {
    "career": "Career",
    "business": "Business",
    "content": "Content",
    "sales": "Sales",
    "customer_support": "Customer Support",
    "documents": "Documents",
    "automation": "Automation",
    "productivity": "Productivity",
}


class Plan(str, Enum):
    FREE = "free"
    PRO = "pro"


class SolutionStatus(str, Enum):
    DRAFT = "draft"              # hidden from the public API
    AVAILABLE = "available"      # can be tried (execution wiring is a TODO)
    PREVIEW = "preview"          # visible, not usable; shows request/early-access CTA
    COMING_SOON = "coming_soon"  # visible, not usable


class OutputType(str, Enum):
    TEXT = "text"
    MESSAGE = "message"
    DOCUMENT = "document"
    TABLE = "table"


class Frequency(str, Enum):
    ONE_OFF = "one_off"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    OCCASIONALLY = "occasionally"


class WillingToPay(str, Enum):
    YES = "yes"
    MAYBE = "maybe"
    NO = "no"


class RequestStatus(str, Enum):
    NEW = "new"
    REVIEWING = "reviewing"
    PLANNED = "planned"
    SHIPPED = "shipped"
    DECLINED = "declined"
