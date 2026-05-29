import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import uuid

from app.services.email_processor import email_processor
from app.utils.db import get_db

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def check_inbox_job():
    logger.info("Silent Background: check_inbox_job")
    db = await get_db()
    
    orders = email_processor.fetch_and_process_emails()
    if orders:
        logger.info(f"Processed {len(orders)} new orders from email")
        customer_orders = [o for o in orders if o['type'] == 'customer']
        supplier_orders = [o for o in orders if o['type'] == 'supplier']
        
        notifications = []
        if customer_orders:
            for co in customer_orders:
                co['_id'] = str(uuid.uuid4())
                del co['type']
            await db.orders_received.insert_many(customer_orders)
            notifications.append({
                "type": "new_order",
                "message": f"Received {len(customer_orders)} new customer orders via email.",
                "read": False,
                "created_at": datetime.utcnow()
            })
            
        if supplier_orders:
            for so in supplier_orders:
                so['_id'] = str(uuid.uuid4())
                del so['type']
            await db.orders_placed.insert_many(supplier_orders)
            notifications.append({
                "type": "supplier_order",
                "message": f"Automatically placed {len(supplier_orders)} restocking orders.",
                "read": False,
                "created_at": datetime.utcnow()
            })
            
        if notifications:
            await db.notifications.insert_many(notifications)

async def send_daily_report_job():
    logger.info("Silent Background: send_daily_report_job")
    report_html = """
    <h2>Daily Sales Report</h2>
    <p>Automated summary of today's activities.</p>
    """
    success = email_processor.send_automated_email(
        to_email=email_processor.email_address,
        subject="Daily Warehouse Report",
        body_html=report_html
    )
    if success:
        db = await get_db()
        await db.report_logs.insert_one({
            "report_type": "daily",
            "sent_at": datetime.utcnow(),
            "status": "success"
        })

async def check_stock_alerts_job():
    logger.info("Silent Background: check_stock_alerts_job")
    # Invisible background alert
    pass

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(check_inbox_job, IntervalTrigger(minutes=15), id='check_inbox', replace_existing=True)
        scheduler.add_job(send_daily_report_job, CronTrigger(hour=9, minute=0), id='daily_report', replace_existing=True)
        scheduler.add_job(check_stock_alerts_job, IntervalTrigger(hours=1), id='stock_alerts', replace_existing=True)
        scheduler.start()
        logger.info("Background Scheduler started")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background Scheduler stopped")
