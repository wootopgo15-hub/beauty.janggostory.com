import React, { useState } from 'react';

// 현재 로그인된 기관 (테스트용 하드코딩)
const CURRENT_FACILITY = {
  id: 'f1',
  name: '행복요양원'
};

export function FacilityDashboard() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState(3);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSkills = ['컷트', '파마', '염색', '네일아트', '마사지'];

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || skills.length === 0) {
      alert('날짜, 시간, 필요 분야를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 날짜와 시간을 ISO 문자열로 결합
      const dateTime = new Date(\`\${date}T\${time}\`).toISOString();

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: CURRENT_FACILITY.id,
          facilityName: CURRENT_FACILITY.name,
          date: dateTime,
          requiredSkills: skills,
          maxVolunteers,
          description
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('공고가 성공적으로 등록되었습니다.');
        // 폼 초기화
        setDate('');
        setTime('');
        setSkills([]);
        setDescription('');
      }
    } catch (error) {
      alert('공고 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">새 봉사 공고 등록</h1>
        <p className="text-slate-500 mt-1">봉사자가 필요한 날짜와 상세 내용을 입력해주세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">날짜</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">시간</label>
            <input 
              type="time" 
              value={time}
              onChange={e => setTime(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">모집 인원 (명)</label>
          <input 
            type="number" 
            min="1" max="20"
            value={maxVolunteers}
            onChange={e => setMaxVolunteers(parseInt(e.target.value))}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">필요 미용 분야 (다중 선택)</label>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                  skills.includes(skill)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                } border\`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">상세 설명</label>
          <textarea 
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="예: 어르신들 컷트 및 파마 봉사 부탁드립니다."
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '등록 중...' : '공고 등록하기'}
        </button>
      </form>
    </div>
  );
}
