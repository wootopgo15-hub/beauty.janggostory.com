import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Scissors, AlertCircle, CheckCircle2, Loader2, ChevronLeft, ChevronRight, LayoutList, Plus, UserPlus, X } from 'lucide-react';

// ==========================================
// 1. 타입 정의 (TypeScript Interfaces)
// ==========================================
interface Schedule {
  id: string;
  facilityName: string;
  location: string;
  managerPhone?: string;
  date: string; // 예: '2026-03-15'
  time: string; // 예: '14:00'
  skills: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
}

interface Volunteer {
  id: string;
  name: string;
  date: string;
  time: string;
}

// ==========================================
// 1-1. 유틸리티 함수 (색상 생성)
// ==========================================
const facilityColors = [
  { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200', badge: 'bg-white/60 text-indigo-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200', badge: 'bg-white/60 text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200', badge: 'bg-white/60 text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-200', badge: 'bg-white/60 text-rose-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200', badge: 'bg-white/60 text-purple-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200', badge: 'bg-white/60 text-cyan-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200', badge: 'bg-white/60 text-pink-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200', badge: 'bg-white/60 text-orange-700' },
];

const getFacilityColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % facilityColors.length;
  return facilityColors[index];
};

// ==========================================
// 2. 메인 앱 컴포넌트
// ==========================================
export default function App() {
  // 상태 관리
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 뷰 모드 및 달력 상태 관리
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 모달 상태 관리
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 공고 등록 모달 상태 관리
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newManagerPhone, setNewManagerPhone] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newMaxVolunteers, setNewMaxVolunteers] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // 봉사자 등록 모달 상태 관리
  const [isVolModalOpen, setIsVolModalOpen] = useState(false);
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volLocation, setVolLocation] = useState('');
  const [volDateTimes, setVolDateTimes] = useState([{ date: '', time: '' }]);
  const [volSkills, setVolSkills] = useState('');
  const [isRegisteringVol, setIsRegisteringVol] = useState(false);

  const addDateTimeRow = () => setVolDateTimes([...volDateTimes, { date: '', time: '' }]);
  const removeDateTimeRow = (index: number) => setVolDateTimes(volDateTimes.filter((_, i) => i !== index));
  const updateDateTimeRow = (index: number, field: 'date' | 'time', value: string) => {
    const newDateTimes = [...volDateTimes];
    newDateTimes[index][field] = value;
    setVolDateTimes(newDateTimes);
  };

  // ⚠️ 중요: 구글 앱스 스크립트 배포 후 얻은 웹앱 URL을 여기에 입력하세요!
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5kGrufoEkT51E0ayzCdChV1-okPCwQJiD3c18OOAnbWK3q-pX7PsHel2697m82GxM/exec';

  // ==========================================
  // 3. 데이터 불러오기 (GET 요청)
  // ==========================================
  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        setTimeout(() => {
          setSchedules([
            { id: '1', facilityName: '행복 요양원', location: '서울시 강남구', managerPhone: '010-1111-2222', date: '2026-03-15', time: '14:00', skills: '컷트, 염색', maxVolunteers: 5, currentVolunteers: 2, status: 'OPEN' },
            { id: '2', facilityName: '사랑 실버타운', location: '서울시 서초구', managerPhone: '010-3333-4444', date: '2026-03-20', time: '10:00', skills: '컷트, 네일', maxVolunteers: 3, currentVolunteers: 3, status: 'CLOSED' },
            { id: '3', facilityName: '희망 복지관', location: '경기도 성남시', managerPhone: '010-5555-6666', date: '2026-03-25', time: '13:00', skills: '컷트', maxVolunteers: 4, currentVolunteers: 1, status: 'OPEN' },
          ]);
          setVolunteers([
            { id: 'v1', name: '홍길동', date: '2026-03-15', time: '10:00' },
            { id: 'v2', name: '김철수', date: '2026-03-15', time: '14:00' },
            { id: 'v3', name: '이영희', date: '2026-03-16', time: '13:00' },
          ]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getSchedules`, {
        method: 'GET',
        redirect: 'follow',
      });
      
      // 응답이 HTML(에러 페이지)로 오는지 확인
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          setSchedules(data.data);
          if (data.volunteers) setVolunteers(data.volunteers);
        } else {
          throw new Error(data.error || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (e) {
        // JSON 파싱 실패 시 구글 스크립트 에러일 확률이 높음
        throw new Error('구글 스크립트 응답 오류. (새 버전으로 배포되지 않았을 수 있습니다.)');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message.includes('CORS')) {
        setError('서버 연결 실패 (CORS 에러). 구글 앱스 스크립트에서 코드를 수정한 후 반드시 [새 배포]를 진행해야 합니다. (기존 배포 덮어쓰기 아님)');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ==========================================
  // 4. 봉사 신청하기 (POST 요청)
  // ==========================================
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !volunteerName || !volunteerPhone) return;

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(volunteerPhone)) {
      alert("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert('구글 앱스 스크립트 URL이 설정되지 않아 가상으로 신청 완료 처리됩니다.');
        setSelectedSchedule(null);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow', // 구글 스크립트 리다이렉션 처리 필수
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'apply',
          scheduleId: selectedSchedule.id,
          volunteerName: volunteerName,
          phone: volunteerPhone,
          scheduleDate: formatDisplayDate(selectedSchedule.date),
          scheduleTime: formatDisplayTime(selectedSchedule.time)
        })
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          alert('신청이 완료되었습니다!');
          setSelectedSchedule(null);
          setVolunteerName('');
          setVolunteerPhone('');
          fetchSchedules(); 
        } else {
          throw new Error(data.error || '신청 처리 중 오류가 발생했습니다.');
        }
      } catch (e) {
        console.error("Parse error:", text);
        throw new Error('구글 스크립트 응답 오류. (새 버전으로 배포되지 않았을 수 있습니다.)');
      }
    } catch (err: any) {
      console.error("Apply error:", err);
      if (err.message === 'Failed to fetch' || err.message.includes('CORS')) {
        alert('서버 연결 실패 (CORS 에러). 구글 앱스 스크립트에서 코드를 수정한 후 반드시 [새 배포]를 진행해야 합니다.');
      } else {
        alert(`신청 실패: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // 4-1. 공고 등록하기 (POST 요청)
  // ==========================================
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacilityName || !newLocation || !newManagerPhone || !newDate || !newTime || !newSkills || newMaxVolunteers < 1) return;

    setIsAdding(true);
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addSchedule',
          facilityName: newFacilityName,
          location: newLocation,
          managerPhone: newManagerPhone,
          date: newDate,
          time: newTime,
          skills: newSkills,
          maxVolunteers: newMaxVolunteers
        })
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          alert('공고가 성공적으로 등록되었습니다!');
          setIsAddModalOpen(false);
          setNewFacilityName('');
          setNewLocation('');
          setNewManagerPhone('');
          setNewDate('');
          setNewTime('');
          setNewSkills('');
          setNewMaxVolunteers(1);
          fetchSchedules();
        } else {
          throw new Error(data.error || '등록 처리 중 오류가 발생했습니다.');
        }
      } catch (e) {
        throw new Error('구글 스크립트 응답 오류. (새 버전으로 배포되지 않았을 수 있습니다.)');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message.includes('CORS')) {
        alert('서버 연결 실패 (CORS 에러). 구글 앱스 스크립트에서 코드를 수정한 후 반드시 [새 배포]를 진행해야 합니다.');
      } else {
        alert(`등록 실패: ${err.message}`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // ==========================================
  // 4-2. 봉사자 가능일 등록하기 (POST 요청)
  // ==========================================
  const handleRegisterVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    const validDateTimes = volDateTimes.filter(dt => dt.date && dt.time);
    if (!volName || !volPhone || !volLocation || !volSkills || validDateTimes.length === 0) {
      alert("모든 필수 정보를 입력하고 최소 1개 이상의 날짜/시간을 지정해주세요.");
      return;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(volPhone)) {
      alert("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }

    setIsRegisteringVol(true);
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addVolunteer',
          name: volName,
          phone: volPhone,
          location: volLocation,
          dates: validDateTimes, // [{date, time}] 형태로 전송
          skills: volSkills
        })
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          alert('봉사 가능 일정이 성공적으로 등록되었습니다!');
          setIsVolModalOpen(false);
          setVolName('');
          setVolPhone('');
          setVolLocation('');
          setVolDateTimes([{ date: '', time: '' }]);
          setVolSkills('');
        } else {
          throw new Error(data.error || '등록 처리 중 오류가 발생했습니다.');
        }
      } catch (e) {
        throw new Error('구글 스크립트 응답 오류. (새 버전으로 배포되지 않았을 수 있습니다.)');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message.includes('CORS')) {
        alert('서버 연결 실패 (CORS 에러). 구글 앱스 스크립트에서 코드를 수정한 후 반드시 [새 배포]를 진행해야 합니다.');
      } else {
        alert(`등록 실패: ${err.message}`);
      }
    } finally {
      setIsRegisteringVol(false);
    }
  };

  // ==========================================
  // 5. 달력 로직 (Calendar Logic)
  // ==========================================
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 현재 달의 일수와 시작 요일 계산
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // 날짜별 스케줄 그룹화 ('2026-03-15' 형태의 키 사용)
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    try {
      const dateObj = new Date(schedule.date);
      let dateKey = schedule.date;
      
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      } else if (schedule.date.includes('T')) {
        dateKey = schedule.date.split('T')[0];
      } else if (schedule.date.includes(' ')) {
        dateKey = schedule.date.split(' ')[0];
      }
      
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(schedule);
    } catch (e) {
      console.error("Date parsing error:", e);
    }
    return acc;
  }, {} as Record<string, Schedule[]>);

  const volunteersByDate = volunteers.reduce((acc, vol) => {
    try {
      const dateObj = new Date(vol.date);
      let dateKey = vol.date;
      
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      } else if (vol.date.includes('T')) {
        dateKey = vol.date.split('T')[0];
      } else if (vol.date.includes(' ')) {
        dateKey = vol.date.split(' ')[0];
      }
      
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(vol);
    } catch (e) {
      console.error("Date parsing error:", e);
    }
    return acc;
  }, {} as Record<string, Volunteer[]>);

  // 날짜 및 시간 포맷팅 헬퍼 함수
  const formatDisplayDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {}
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    if (dateStr.includes(' ')) return dateStr.split(' ')[0];
    return dateStr;
  };

  const formatDisplayTime = (timeStr: string) => {
    // 정규식으로 HH:mm 추출 (예: "09:30", "14:00:00", "Sat Dec 30 1899 09:30:00 GMT+0827")
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return timeStr;
  };

  // ==========================================
  // 6. UI 렌더링
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Scissors className="w-6 h-6" />
            미용 봉사 매칭
          </h1>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsVolModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">봉사자 등록</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">공고 등록</span>
            </button>
            {/* 뷰 모드 전환 토글 */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                달력
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutList className="w-4 h-4" />
                목록
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (광고 포함) */}
      <div className="flex justify-center max-w-[1600px] mx-auto w-full">
        {/* 왼쪽 광고 영역 (큰 화면에서만 표시) */}
        <aside className="hidden xl:block w-[240px] shrink-0 pt-8 pl-4">
          <div className="sticky top-24 bg-gray-100 border border-gray-200 rounded-2xl h-[600px] flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 text-white">
              <span className="text-xs tracking-widest uppercase mb-1 opacity-80">Advertisement</span>
              <span className="font-bold">광고 영역</span>
            </div>
            <img src="https://picsum.photos/seed/ad1/240/600" alt="광고" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 max-w-6xl w-full px-4 py-8">
        {/* 로딩 및 에러 상태 표시 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p>공고를 불러오는 중입니다...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-2xl mx-auto mt-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">오류가 발생했습니다</h2>
            </div>
            
            <div className="text-gray-700 space-y-4">
              <p className="text-lg font-medium text-red-600 bg-red-50 p-4 rounded-xl">
                {error}
              </p>
              
              {error.includes('CORS') && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4">
                  <h3 className="font-bold text-gray-900 mb-3">🛠️ 1분 해결 가이드 (반드시 순서대로 진행해주세요)</h3>
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>구글 앱스 스크립트 편집기 화면으로 이동합니다.</li>
                    <li>우측 상단의 파란색 <strong>[배포]</strong> 버튼을 누릅니다.</li>
                    <li><strong>[배포 관리]</strong>를 클릭합니다.</li>
                    <li>왼쪽 목록에서 현재 배포를 클릭하고, 우측 상단의 <strong>연필 모양 아이콘(수정)</strong>을 누릅니다.</li>
                    <li className="text-indigo-700 font-bold bg-indigo-50 p-2 rounded">
                      [버전] 이라고 적힌 드롭다운을 클릭하고, 반드시 "새 버전"을 선택합니다.
                    </li>
                    <li>하단의 <strong>[배포]</strong> 버튼을 클릭합니다.</li>
                    <li>이 화면을 <strong>새로고침(F5)</strong> 하시면 정상 작동합니다!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* 달력 뷰 */}
            {viewMode === 'calendar' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* 달력 컨트롤러 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <div key={day} className={`py-3 text-center text-sm font-semibold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 auto-rows-fr">
                  {/* 시작 요일 전까지 빈 칸 채우기 */}
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="min-h-[120px] p-2 border-b border-r border-gray-100 bg-gray-50/50"></div>
                  ))}
                  
                  {/* 실제 날짜 렌더링 */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    // 날짜 키 생성 (예: 2026-03-05 -> 한자리 수일 경우 0을 붙여줌)
                    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(day).padStart(2, '0');
                    const dateKey = `${currentMonth.getFullYear()}-${monthStr}-${dayStr}`;
                    
                    const daySchedules = schedulesByDate[dateKey] || [];
                    const dayVolunteers = volunteersByDate[dateKey] || [];
                    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

                    return (
                      <div key={day} className={`min-h-[120px] p-2 border-b border-r border-gray-100 transition-colors hover:bg-gray-50 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                            {day}
                          </div>
                          {dayVolunteers.length > 0 && (
                            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              예비 {dayVolunteers.length}명
                            </div>
                          )}
                        </div>
                        
                        {/* 해당 날짜의 스케줄 표시 */}
                        <div className="space-y-1.5">
                          {daySchedules.map(schedule => {
                            const isClosed = schedule.status.toUpperCase() !== 'OPEN' || schedule.currentVolunteers >= schedule.maxVolunteers;
                            const timeStr = formatDisplayTime(schedule.time);
                            const color = getFacilityColor(schedule.facilityName);
                            
                            return (
                              <div 
                                key={schedule.id}
                                onClick={() => setSelectedSchedule(schedule)}
                                className={`text-xs p-1.5 rounded-md cursor-pointer truncate transition-all ${
                                  isClosed 
                                    ? 'bg-gray-100 text-gray-500 line-through opacity-70' 
                                    : `${color.bg} ${color.text} ${color.hover} hover:shadow-sm`
                                }`}
                              >
                                <div className="font-semibold mb-0.5 flex justify-between items-start gap-1">
                                  <span className="truncate">{timeStr} {schedule.facilityName}</span>
                                  <span className={`shrink-0 text-[10px] px-1 rounded font-bold ${isClosed ? 'bg-gray-200 text-gray-500' : color.badge}`}>
                                    {schedule.currentVolunteers}/{schedule.maxVolunteers}
                                  </span>
                                </div>
                                {schedule.location && (
                                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{schedule.location}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 목록 뷰 (기존 카드 형태) */}
            {viewMode === 'list' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schedules.map((schedule) => {
                  const isClosed = schedule.status.toUpperCase() !== 'OPEN' || schedule.currentVolunteers >= schedule.maxVolunteers;
                  
                  return (
                    <div key={schedule.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{schedule.facilityName}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-700'}`}>
                          {isClosed ? '마감됨' : '모집중'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-6 flex-1">
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          {formatDisplayDate(schedule.date)} {formatDisplayTime(schedule.time)}
                        </div>
                        {schedule.location && (
                          <div className="flex items-center text-sm text-gray-600 gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {schedule.location}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <Scissors className="w-4 h-4 text-gray-400" />
                          필요 분야: {schedule.skills}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          모집 인원: <span className="font-semibold text-indigo-600">{schedule.currentVolunteers}</span> / {schedule.maxVolunteers}명
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedSchedule(schedule)}
                        disabled={isClosed}
                        className={`w-full py-3 rounded-xl font-medium transition-colors mt-auto ${
                          isClosed 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                        }`}
                      >
                        {isClosed ? '신청 마감' : '신청하기'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        </main>

        {/* 오른쪽 광고 영역 (큰 화면에서만 표시) */}
        <aside className="hidden xl:block w-[240px] shrink-0 pt-8 pr-4">
          <div className="sticky top-24 bg-gray-100 border border-gray-200 rounded-2xl h-[600px] flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 text-white">
              <span className="text-xs tracking-widest uppercase mb-1 opacity-80">Advertisement</span>
              <span className="font-bold">광고 영역</span>
            </div>
            <img src="https://picsum.photos/seed/ad2/240/600" alt="광고" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </aside>
      </div>

      {/* 신청 모달 (팝업) */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">봉사 신청하기</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedSchedule.facilityName} - {formatDisplayDate(selectedSchedule.date)} {formatDisplayTime(selectedSchedule.time)}</p>
              {selectedSchedule.location && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {selectedSchedule.location}
                </p>
              )}
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>모집 현황: {selectedSchedule.currentVolunteers}명 신청 완료 / 총 {selectedSchedule.maxVolunteers}명 필요</span>
              </div>
            </div>
            
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  required
                  pattern="010-[0-9]{4}-[0-9]{4}"
                  title="010-xxxx-xxxx 형식으로 입력해주세요."
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSchedule(null)}
                  className="flex-1 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (selectedSchedule.status.toUpperCase() !== 'OPEN' || selectedSchedule.currentVolunteers >= selectedSchedule.maxVolunteers)}
                  className="flex-1 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:bg-gray-400"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isSubmitting ? '처리중...' : '확정하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 공고 등록 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">새 공고 등록하기</h3>
              <p className="text-sm text-gray-500 mt-1">요양원/주간보호센터의 미용 봉사 일정을 등록합니다.</p>
            </div>
            
            <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기관명</label>
                <input
                  type="text"
                  required
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="예: 행복 요양원"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">지역 (주소)</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="예: 서울시 강남구"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자 전화번호</label>
                <input
                  type="tel"
                  required
                  value={newManagerPhone}
                  onChange={(e) => setNewManagerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="예: 010-1234-5678"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">필요 기술</label>
                <input
                  type="text"
                  required
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="예: 컷트, 염색, 네일아트"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">모집 인원 (명)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newMaxVolunteers || ''}
                  onChange={(e) => setNewMaxVolunteers(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:bg-gray-400"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 봉사자 등록 모달 */}
      {isVolModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-emerald-700">봉사 가능일 등록</h3>
              <p className="text-sm text-gray-500 mt-1">미용 봉사가 가능한 날짜와 정보를 등록해주세요.</p>
            </div>
            
            <form onSubmit={handleRegisterVolunteer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input
                    type="text"
                    required
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                  <input
                    type="tel"
                    required
                    pattern="010-[0-9]{4}-[0-9]{4}"
                    title="010-xxxx-xxxx 형식으로 입력해주세요."
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">선호 지역</label>
                <input
                  type="text"
                  required
                  value={volLocation}
                  onChange={(e) => setVolLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="예: 서울시 강남구, 천안시 등"
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">가능 날짜 및 시간</label>
                {volDateTimes.map((dt, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="date"
                      required
                      value={dt.date}
                      onChange={(e) => updateDateTimeRow(index, 'date', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                    <input
                      type="time"
                      required
                      value={dt.time}
                      onChange={(e) => updateDateTimeRow(index, 'time', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDateTimeRow(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDateTimeRow}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors px-2 py-1 rounded-md hover:bg-emerald-50 w-fit"
                >
                  <Plus className="w-4 h-4" /> 날짜/시간 추가
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">보유 기술</label>
                <input
                  type="text"
                  required
                  value={volSkills}
                  onChange={(e) => setVolSkills(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="예: 컷트, 염색, 펌 등"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsVolModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringVol}
                  className="flex-1 py-3 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:bg-gray-400"
                >
                  {isRegisteringVol ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

