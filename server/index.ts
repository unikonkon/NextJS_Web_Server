import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import { Sequelize } from 'sequelize-typescript';
import UserModel from './models/users.model.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

// ตั้งค่า Sequelize
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: '127.0.0.1',
    username: 'root',
    password: 'password',
    database: 'my_database',
    models: [UserModel], // ระบุ models ที่จะใช้
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

  // ปิดการเชื่อมต่อฐานข้อมูลเมื่อเซิร์ฟเวอร์หยุดทำงาน
  process.on('SIGINT', async () => {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
