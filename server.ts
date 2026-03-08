import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. DB 스키마 설계 (SQLite)
const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT, -- 'VOLUNTEER' 또는 'FACILITY'
    noshowCount INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    facilityId TEXT,
    facilityName TEXT,
    date TEXT,
    requiredSkills TEXT, -- JSON 배열 형태의 문자열
    maxVolunteers INTEGER,
    currentVolunteers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'CLOSED'
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    scheduleId TEXT,
    volunteerId TEXT,
    volunteerName TEXT,
    appliedAt TEXT,
    status TEXT DEFAULT 'APPROVED'
  );
`);

// 테스트용 초기 데이터 삽입
const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name, role) VALUES (?, ?, ?)');
insertUser.run('v1', '홍길동 (봉사자)', 'VOLUNTEER');
insertUser.run('f1', '행복요양원', 'FACILITY');

// API: 전체 공고 목록 조회
app.get('/api/schedules', (req, res) => {
  const schedules = db.prepare('SELECT * FROM schedules ORDER BY date ASC').all();
  res.json(schedules.map((s: any) => ({
    ...s,
    requiredSkills: JSON.parse(s.requiredSkills)
  })));
});

// API: 기관의 공고 등록
app.post('/api/schedules', (req, res) => {
  const { facilityId, facilityName, date, requiredSkills, maxVolunteers, description } = req.body;
  const id = Math.random().toString(36).substring(2, 9);
  
  db.prepare(`
    INSERT INTO schedules (id, facilityId, facilityName, date, requiredSkills, maxVolunteers, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, facilityId, facilityName, date, JSON.stringify(requiredSkills), maxVolunteers, description);
  
  res.json({ success: true, id });
});

// API: 봉사자의 원터치 신청 내역 조회
app.get('/api/applications/:volunteerId', (req, res) => {
  const apps = db.prepare('SELECT * FROM applications WHERE volunteerId = ?').all(req.params.volunteerId);
  res.json(apps);
});

// 2. 핵심 로직: 원터치 신청 및 동시성 제어 (Transaction)
app.post('/api/applications', (req, res) => {
  const { scheduleId, volunteerId, volunteerName } = req.body;

  // 트랜잭션을 통해 오버부킹 방지
  const applyTransaction = db.transaction(() => {
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(scheduleId) as any;
    
    if (!schedule) throw new Error('존재하지 않는 공고입니다.');
    if (schedule.status !== 'OPEN' || schedule.currentVolunteers >= schedule.maxVolunteers) {
      throw new Error('이미 마감된 공고입니다.');
    }

    // 중복 신청 방지
    const existing = db.prepare('SELECT * FROM applications WHERE scheduleId = ? AND volunteerId = ?').get(scheduleId, volunteerId);
    if (existing) throw new Error('이미 신청한 공고입니다.');

    // 인원 증가 및 상태 업데이트
    const newCount = schedule.currentVolunteers + 1;
    const newStatus = newCount >= schedule.maxVolunteers ? 'CLOSED' : 'OPEN';
    
    db.prepare('UPDATE schedules SET currentVolunteers = ?, status = ? WHERE id = ?')
      .run(newCount, newStatus, scheduleId);

    // 신청 내역 저장
    const appId = Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO applications (id, scheduleId, volunteerId, volunteerName, appliedAt, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(appId, scheduleId, volunteerId, volunteerName, new Date().toISOString(), 'APPROVED');
    
    return appId;
  });

  try {
    const appId = applyTransaction();
    res.json({ success: true, applicationId: appId });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Vite 미들웨어 설정 (개발 환경)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
