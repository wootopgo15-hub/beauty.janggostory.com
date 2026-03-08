import React, { useEffect, useState } from 'react';
import { Schedule, Application } from '../types';
import { ScheduleCard } from '../components/ScheduleCard';

// 현재 로그인된 봉사자 (테스트용 하드코딩)
const CURRENT_VOLUNTEER = {
  id: 'v1',
  name: '홍길동 (봉사자)'
};

export function VolunteerDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [schedRes, appRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch(\`/api/applications/\${CURRENT_VOLUNTEER.id}\`)
      ]);
      const schedData = await schedRes.json();
      const appData = await appRes.json();
      setSchedules(schedData);
      setApplications(appData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (scheduleId: string) => {
    setLoadingId(scheduleId);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId,
          volunteerId: CURRENT_VOLUNTEER.id,
          volunteerName: CURRENT_VOLUNTEER.name
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('신청이 완료되었습니다!');
        fetchData(); // 데이터 새로고침
      } else {
        alert(\`신청 실패: \${data.message}\`);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setLoadingId(null);
    }
  };

  const appliedScheduleIds = new Set(applications.map(app => app.scheduleId));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">미용 봉사 찾기</h1>
        <p className="text-slate-500 mt-1">원하는 날짜와 장소의 봉사를 원터치로 신청하세요.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
            현재 등록된 공고가 없습니다.
          </div>
        ) : (
          schedules.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onApply={handleApply}
              isApplied={appliedScheduleIds.has(schedule.id)}
              isLoading={loadingId === schedule.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
