import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import { createServer } from 'http';
import { Sequelize } from 'sequelize-typescript';
import UserModel from './models/users.model.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

// ตั้งค่า Sequelize
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: '127.0.0.1', // ใช้ localhost สำหรับ MySQL
  username: 'root', // หรือ 'my_user' หากสร้างผู้ใช้ใหม่
  password: 'password', // รหัสผ่านของ root หรือผู้ใช้
  database: 'my_database', // ชื่อฐานข้อมูล
  models: [UserModel], // โมเดลที่ใช้
});

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error: any) => {
    console.error('Error syncing database:', error);
  });

// Middleware สำหรับจัดการข้อผิดพลาด
server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

app.prepare().then(() => {
  server.use(express.json());

  server.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express!' });
  });

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  // สร้าง HTTP Server
  const httpServer = createServer(server);

  // ปิดการเชื่อมต่อฐานข้อมูลเมื่อเซิร์ฟเวอร์หยุดทำงาน
  process.on('SIGINT', async () => {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  });

  httpServer.listen(3000, () => {
    console.log('> HTTP Server ready on http://localhost:3000');
  });
});
