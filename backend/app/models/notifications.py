from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Notification(BaseModel):
    id: Optional[str] = None
    type: str # 'new_order', 'supplier_order', 'low_stock', 'demand_spike', 'recommendation_executed', 'report_sent'
    message: str
    read: bool = False
    created_at: datetime = datetime.utcnow()

class ReportLog(BaseModel):
    id: Optional[str] = None
    report_type: str
    sent_at: datetime
    status: str
