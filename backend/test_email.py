import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

def test_send():
    print(f"Connecting to {SMTP_HOST}:{SMTP_PORT} as {EMAIL_ADDRESS}...")
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = EMAIL_ADDRESS
        msg['Subject'] = "Test Email from Backend"
        
        msg.attach(MIMEText("<h2>Test</h2><p>If you see this, SMTP works!</p>", 'html'))
        
        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.set_debuglevel(1)
            server.ehlo()
            server.starttls()
            server.ehlo()
            
        print("Logging in...")
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        print("Sending message...")
        server.send_message(msg)
        server.quit()
        print("Success!")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_send()
