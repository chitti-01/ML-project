import imaplib
import smtplib
import email
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import re
import logging
from typing import Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailProcessor:
    def __init__(self):
        self.imap_host = settings.IMAP_HOST
        self.imap_port = settings.IMAP_PORT
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.email_address = settings.EMAIL_ADDRESS
        self.password = settings.EMAIL_APP_PASSWORD

    def _connect_imap(self):
        try:
            mail = imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
            mail.login(self.email_address, self.password)
            return mail
        except Exception as e:
            logger.error(f"IMAP connection failed silently: {e}")
            return None

    def fetch_and_process_emails(self) -> list[Dict[str, Any]]:
        mail = self._connect_imap()
        if not mail:
            return []

        orders = []
        try:
            mail.select("inbox")
            status, messages = mail.search(None, "UNSEEN")
            if status != "OK":
                return orders

            email_ids = messages[0].split()
            for eid in email_ids:
                res, msg_data = mail.fetch(eid, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        subject, encoding = decode_header(msg["Subject"])[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding if encoding else "utf-8")
                        
                        sender = msg.get("From")
                        body = ""
                        
                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                if content_type == "text/plain":
                                    try:
                                        body = part.get_payload(decode=True).decode()
                                    except:
                                        pass
                        else:
                            try:
                                body = msg.get_payload(decode=True).decode()
                            except:
                                pass

                        order = self._analyze_email(sender, subject, body)
                        if order:
                            orders.append(order)
                            
        except Exception as e:
            logger.error(f"Error processing emails: {e}")
        finally:
            try:
                mail.close()
                mail.logout()
            except:
                pass

        return orders

    def _analyze_email(self, sender: str, subject: str, body: str) -> Dict[str, Any] | None:
        subject_lower = subject.lower()
        body_lower = body.lower()
        
        # Internal invisible rules
        if 'newsletter' in subject_lower or 'promotion' in subject_lower:
            return None

        is_customer = 'order' in subject_lower and 'purchase' not in subject_lower
        is_supplier = 'restock' in subject_lower or 'purchase order' in subject_lower

        if not (is_customer or is_supplier):
            return None

        # Extract basic info
        product_match = re.search(r'(?i)product\s*:?\s*([A-Za-z0-9 ]+)', body)
        qty_match = re.search(r'(?i)quantity\s*:?\s*(\d+)', body)
        
        product = product_match.group(1).strip() if product_match else "Assorted Items"
        quantity = int(qty_match.group(1)) if qty_match else 1
        
        if is_customer:
            return {
                "type": "customer",
                "customer": sender.split('<')[0].strip(),
                "product": product,
                "quantity": quantity,
                "date": datetime.utcnow().strftime('%Y-%m-%d'),
                "status": "Pending",
                "priority": "Medium",
                "delivery": "TBD"
            }
        else:
            return {
                "type": "supplier",
                "supplier": sender.split('<')[0].strip(),
                "product": product,
                "quantity": quantity,
                "date": datetime.utcnow().strftime('%Y-%m-%d'),
                "status": "Requested",
                "arrival": "TBD"
            }

    def send_automated_email(self, to_email: str, subject: str, body_html: str) -> bool:
        if not self.password:
            logger.error("Silent SMTP skip: No password configured")
            return False
            
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_address
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body_html, 'html'))
            
            if self.smtp_port == 465:
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                server.ehlo()
                server.starttls()
                server.ehlo()
                
            server.login(self.email_address, self.password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            logger.error(f"Silent SMTP send failed: {e}")
            return False

email_processor = EmailProcessor()
