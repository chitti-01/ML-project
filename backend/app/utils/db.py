import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
db = None

async def get_db():
    return db

# Robust in-memory Mock DB fallback if MongoDB is not running
class MockCursor:
    def __init__(self, data):
        self.data = data

    async def to_list(self, length: int):
        return self.data[:length]

class MockCollection:
    def __init__(self):
        self._data = {}

    def find(self, query=None):
        return MockCursor(list(self._data.values()))

    async def find_one(self, query):
        _id = query.get("_id")
        return self._data.get(_id)

    async def count_documents(self, query=None):
        return len(self._data)

    async def insert_one(self, item):
        _id = item.get("_id")
        self._data[_id] = item
        return item

    async def insert_many(self, items):
        for item in items:
            _id = item.get("_id")
            self._data[_id] = item
        return items

    async def update_one(self, query, update):
        _id = query.get("_id")
        if _id in self._data:
            set_dict = update.get("$set", {})
            for k, v in set_dict.items():
                self._data[_id][k] = v
            class MockUpdateResult:
                modified_count = 1
            return MockUpdateResult()
        class MockUpdateResult:
            modified_count = 0
        return MockUpdateResult()

    async def delete_one(self, query):
        _id = query.get("_id")
        if _id in self._data:
            del self._data[_id]
            class MockDeleteResult:
                deleted_count = 1
            return MockDeleteResult()
        class MockDeleteResult:
            deleted_count = 0
        return MockDeleteResult()

class MockDB:
    def __init__(self):
        self.inventory = MockCollection()
        self.recommendations = MockCollection()
        self.orders_received = MockCollection()
        self.orders_placed = MockCollection()
        self.notifications = MockCollection()
        self.report_logs = MockCollection()

async def connect_to_mongo():
    global client, db
    try:
        # Set server selection timeout to 1500ms to fail fast if Mongo is offline
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1500)
        db = client[settings.DATABASE_NAME]
        
        # Test connection by running a light command
        await client.admin.command('ping')
        print("Connected to MongoDB successfully!")
        await init_db()
    except Exception as e:
        print(f"MongoDB connection failed ({e}). Falling back to robust In-Memory Database...")
        client = None
        db = MockDB()
        await init_db()

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")

async def init_db():
    from app.utils.seed_data import seed_db
    # Simple check if DB has data
    count = await db.inventory.count_documents({})
    if count == 0:
        print("Seeding database with initial data...")
        await seed_db(db)

