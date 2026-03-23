import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Scissors, AlertCircle, CheckCircle2, Loader2, ChevronLeft, ChevronRight, LayoutList, Plus, UserPlus, X, Brain, Phone } from 'lucide-react';

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
// 2. 광고 컴포넌트
// ==========================================
const AdBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adPushed = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !adPushed.current) {
          const ins = container.querySelector('ins');
          if (ins && container.offsetWidth > 0) {
            adPushed.current = true;
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (e: any) {
              if (!e.message?.includes("already have ads") && !e.message?.includes("availableWidth=0")) {
                console.error("AdSense error", e);
              }
            }
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-w-[200px] min-h-[50px] overflow-hidden block">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%' }}
           data-ad-client="ca-pub-7204177319630647"
           data-ad-slot=""
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

// ==========================================
// 3. 메인 앱 컴포넌트
// ==========================================
export default function App() {
  // 튜토리얼 상태 관리
  const getNextMonthFirstDay = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const day = String(nextMonth.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('tutorialCompleted') !== 'true';
  });
  const [tutorialStep, setTutorialStep] = useState(1);
  const [tutDateTimes, setTutDateTimes] = useState<{date: string, time: string, isWeekly?: boolean}[]>([{ date: getNextMonthFirstDay(), time: '10:00', isWeekly: false }]);
  const [tutName, setTutName] = useState('');
  const [tutPhone, setTutPhone] = useState('');
  const [tutLocation, setTutLocation] = useState('');
  const [tutSkills, setTutSkills] = useState<string[]>([]);
  const [isTutSubmitting, setIsTutSubmitting] = useState(false);

  const addTutDateTime = () => {
    setTutDateTimes([...tutDateTimes, { date: getNextMonthFirstDay(), time: '10:00', isWeekly: false }]);
  };

  const removeTutDateTime = (index: number) => {
    setTutDateTimes(tutDateTimes.filter((_, i) => i !== index));
  };

  const updateTutDateTime = (index: number, field: 'date' | 'time' | 'isWeekly', value: string | boolean) => {
    const newDateTimes = [...tutDateTimes];
    newDateTimes[index] = { ...newDateTimes[index], [field]: value };
    setTutDateTimes(newDateTimes);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setTutPhone(formatted);
  };

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

  // 모바일 하단 광고 상태
  const [showMobileAd, setShowMobileAd] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMobileAd(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  // 날짜 키 정규화 헬퍼 함수 (타임존 문제 방지)
  const normalizeDateKey = (dateStr: string) => {
    if (!dateStr) return '';
    let key = dateStr;
    if (key.includes('T')) key = key.split('T')[0];
    else if (key.includes(' ')) key = key.split(' ')[0];
    
    const parts = key.split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    
    // Fallback: Date 객체로 파싱 (타임존 문제 주의)
    try {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {}
    
    return key;
  };

  // 날짜별 스케줄 그룹화 ('2026-03-15' 형태의 키 사용)
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const dateKey = normalizeDateKey(schedule.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const volunteersByDate = volunteers.reduce((acc, vol) => {
    const dateKey = normalizeDateKey(vol.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(vol);
    return acc;
  }, {} as Record<string, Volunteer[]>);

  // 날짜 및 시간 포맷팅 헬퍼 함수
  const formatDisplayDate = (dateStr: string) => {
    return normalizeDateKey(dateStr);
  };

  const formatDisplayTime = (timeStr: string) => {
    // 정규식으로 HH:mm 추출 (예: "09:30", "14:00:00", "Sat Dec 30 1899 09:30:00 GMT+0827")
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return timeStr;
  };

  const handleTutorialSubmit = async () => {
    if (!tutPhone) {
      alert('연락처를 입력해주세요.');
      return;
    }
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(tutPhone)) {
      alert("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }

    setIsTutSubmitting(true);
    try {
      // 매주 반복일 경우 날짜 확장 (총 4주)
      const expandedDateTimes: {date: string, time: string}[] = [];
      tutDateTimes.forEach(dt => {
        expandedDateTimes.push({ date: dt.date, time: dt.time });
        if (dt.isWeekly) {
          for (let i = 1; i < 4; i++) {
            const nextDate = new Date(dt.date);
            nextDate.setDate(nextDate.getDate() + (i * 7));
            const year = nextDate.getFullYear();
            const month = String(nextDate.getMonth() + 1).padStart(2, '0');
            const day = String(nextDate.getDate()).padStart(2, '0');
            expandedDateTimes.push({ date: `${year}-${month}-${day}`, time: dt.time });
          }
        }
      });

      if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert('가상으로 등록되었습니다!');
        localStorage.setItem('tutorialCompleted', 'true');
        setShowTutorial(false);
        return;
      }

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addVolunteer',
          name: tutName,
          phone: tutPhone,
          location: tutLocation,
          dates: expandedDateTimes,
          skills: tutSkills.join(', ')
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('서버 응답 오류 (구글 스크립트 배포 버전을 확인해주세요)');
      }

      if (data.success) {
        alert('봉사 가능일이 등록되었습니다! 달력에서 일정을 확인해보세요.');
        localStorage.setItem('tutorialCompleted', 'true');
        setShowTutorial(false);
        fetchSchedules(); // 데이터 새로고침
      } else {
        throw new Error(data.error || '등록 실패');
      }
    } catch (err: any) {
      alert('오류가 발생했습니다: ' + err.message + '\n\n(달력 화면으로 이동합니다.)');
      localStorage.setItem('tutorialCompleted', 'true');
      setShowTutorial(false);
    } finally {
      setIsTutSubmitting(false);
    }
  };

  // ==========================================
  // 6. UI 렌더링
  // ==========================================
  if (showTutorial) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-8">
          {/* 진행률 바 */}
          <div className="flex gap-2 mb-8">
            <div className={`h-2 flex-1 rounded-full transition-colors ${tutorialStep >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full transition-colors ${tutorialStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full transition-colors ${tutorialStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>

          {tutorialStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">다음 달 미용 봉사,<br/>언제 가능하신가요?</h2>
                <p className="text-gray-500 mt-2 text-sm">원하시는 날짜와 시간을 선택해주세요.</p>
              </div>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 pb-2">
                {tutDateTimes.map((dt, index) => (
                  <div key={index} className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 relative">
                    {tutDateTimes.length > 1 && (
                      <button 
                        onClick={() => removeTutDateTime(index)} 
                        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 shadow-sm border border-gray-200 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">날짜</label>
                        <input 
                          type="date" 
                          value={dt.date} 
                          onChange={e => updateTutDateTime(index, 'date', e.target.value)} 
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">시간</label>
                        <input 
                          type="time" 
                          value={dt.time} 
                          onChange={e => updateTutDateTime(index, 'time', e.target.value)} 
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group w-fit">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={dt.isWeekly || false} 
                          onChange={e => updateTutDateTime(index, 'isWeekly', e.target.checked)} 
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">매주 반복 (해당 요일 4주간)</span>
                    </label>
                  </div>
                ))}
                
                <button 
                  onClick={addTutDateTime}
                  className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  날짜 추가하기
                </button>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => { 
                    const isValid = tutDateTimes.every(dt => dt.date && dt.time);
                    if(isValid) setTutorialStep(2); 
                    else alert('모든 날짜와 시간을 선택해주세요.'); 
                  }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  다음으로
                </button>
                <button 
                  onClick={() => { localStorage.setItem('tutorialCompleted', 'true'); setShowTutorial(false); }} 
                  className="w-full py-3 mt-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          )}

          {tutorialStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">감사합니다!<br/>성함이 어떻게 되시나요?</h2>
              </div>
              <div className="pt-4">
                <input 
                  type="text" 
                  placeholder="홍길동" 
                  value={tutName} 
                  onChange={e => setTutName(e.target.value)} 
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg text-center transition-all" 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setTutorialStep(1)} 
                  className="w-1/3 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  이전
                </button>
                <button 
                  onClick={() => { if(tutName.trim()) setTutorialStep(3); else alert('이름을 입력해주세요.'); }} 
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  다음으로
                </button>
              </div>
            </div>
          )}

          {tutorialStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">연락처를 남겨주세요.</h2>
                <p className="text-gray-500 mt-2 text-sm">일정 안내를 위해 필요합니다.</p>
              </div>
              <div className="pt-4">
                <input 
                  type="tel" 
                  placeholder="010-1234-5678" 
                  value={tutPhone} 
                  onChange={handlePhoneChange} 
                  maxLength={13}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg text-center transition-all" 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setTutorialStep(2)} 
                  className="w-1/3 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  이전
                </button>
                <button 
                  onClick={() => {
                    const phoneRegex = /^010-\d{4}-\d{4}$/;
                    if (!phoneRegex.test(tutPhone)) {
                      alert("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
                      return;
                    }
                    setTutorialStep(4);
                  }} 
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  다음으로
                </button>
              </div>
            </div>
          )}

          {tutorialStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">마지막으로<br/>지역과 스킬을 선택해주세요.</h2>
              </div>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">활동 가능 지역</label>
                  <input
                    type="text"
                    value={tutLocation}
                    onChange={(e) => setTutLocation(e.target.value)}
                    placeholder="예: 천안, 아산 등 직접 입력"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-2"
                  />
                  <div className="flex gap-2">
                    {['천안', '아산'].map(loc => (
                      <button
                        key={loc}
                        onClick={() => setTutLocation(loc)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${tutLocation === loc ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">보유 스킬 (다중 선택 가능)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['네일', '염색', '파마', '커트'].map(skill => (
                      <button
                        key={skill}
                        onClick={() => {
                          if (tutSkills.includes(skill)) {
                            setTutSkills(tutSkills.filter(s => s !== skill));
                          } else {
                            setTutSkills([...tutSkills, skill]);
                          }
                        }}
                        className={`py-3 rounded-xl border font-medium transition-all ${tutSkills.includes(skill) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setTutorialStep(3)} 
                  className="w-1/3 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  이전
                </button>
                <button 
                  onClick={() => {
                    if (!tutLocation) {
                      alert('활동 가능 지역을 선택해주세요.');
                      return;
                    }
                    if (tutSkills.length === 0) {
                      alert('보유 스킬을 1개 이상 선택해주세요.');
                      return;
                    }
                    handleTutorialSubmit();
                  }} 
                  disabled={isTutSubmitting} 
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 shadow-md hover:shadow-lg"
                >
                  {isTutSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  완료 및 달력 보기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="w-full mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Scissors className="w-6 h-6" />
            미용 봉사
          </h1>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://brain-games-for-dementia-prevention.vercel.janggostory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">두뇌게임</span>
            </a>
            <button
              onClick={() => { setShowTutorial(true); setTutorialStep(1); }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">봉사자 등록</span>
            </button>
            {/* 뷰 모드 전환 토글 */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">달력</span>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">목록</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (광고 포함) */}
      <div className="flex justify-center w-full mx-auto pb-24 xl:pb-0">
        {/* 왼쪽 광고 영역 (큰 화면에서만 표시) */}
        <aside className="hidden xl:block w-[240px] shrink-0 pt-8 pl-4">
          <div className="sticky top-24 bg-gray-100 border border-gray-200 rounded-2xl h-[600px] flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm overflow-hidden relative">
            <AdBanner />
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 w-full px-4 py-8">
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
              <div className="overflow-x-auto pb-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full">
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
                    <div key={`empty-${idx}`} className="min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-gray-100 bg-gray-50/50"></div>
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
                      <div key={day} className={`min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-gray-100 transition-colors hover:bg-gray-50 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex flex-wrap justify-between items-start mb-1 gap-1">
                          <div className={`text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                            {day}
                          </div>
                        </div>
                        
                        {/* 해당 날짜의 봉사자 표시 */}
                        <div className="space-y-1 sm:space-y-1.5 mb-1 sm:mb-1.5">
                          {dayVolunteers.length > 0 && (
                            <div className="text-[10px] sm:text-xs p-1 sm:p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 truncate">
                              <div className="font-semibold flex justify-between items-center">
                                <span className="flex items-center gap-1">
                                  <UserPlus className="w-3 h-3" />
                                  봉사자 {dayVolunteers.length}명
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* 해당 날짜의 스케줄 표시 */}
                        <div className="space-y-1 sm:space-y-1.5">
                          {daySchedules.map((schedule, idx) => {
                            const isClosed = schedule.status.toUpperCase() !== 'OPEN' || schedule.currentVolunteers >= schedule.maxVolunteers;
                            const timeStr = formatDisplayTime(schedule.time);
                            const color = getFacilityColor(schedule.facilityName);
                            
                            return (
                              <div 
                                key={`${schedule.id}-${idx}`}
                                onClick={() => setSelectedSchedule(schedule)}
                                className={`text-[10px] sm:text-xs p-1 sm:p-1.5 rounded cursor-pointer truncate transition-all ${
                                  isClosed 
                                    ? 'bg-gray-100 text-gray-500 line-through opacity-70' 
                                    : `${color.bg} ${color.text} ${color.hover} hover:shadow-sm`
                                }`}
                              >
                                <div className="font-semibold mb-0.5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-0.5 xl:gap-1">
                                  <span className="truncate w-full">{timeStr} {schedule.facilityName}</span>
                                  <span className={`shrink-0 text-[9px] sm:text-[10px] px-1 rounded font-bold ${isClosed ? 'bg-gray-200 text-gray-500' : color.badge}`}>
                                    {schedule.currentVolunteers}/{schedule.maxVolunteers}
                                  </span>
                                </div>
                                {schedule.location && (
                                  <div className="hidden sm:flex items-center gap-1 text-[9px] sm:text-[10px] opacity-80">
                                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
              </div>
            )}

            {/* 목록 뷰 (기존 카드 형태) */}
            {viewMode === 'list' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schedules.map((schedule, idx) => {
                  const isClosed = schedule.status.toUpperCase() !== 'OPEN' || schedule.currentVolunteers >= schedule.maxVolunteers;
                  
                  return (
                    <div key={`${schedule.id}-${idx}`} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
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
            <AdBanner />
          </div>
        </aside>
      </div>

      {/* 신청 모달 (팝업) */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0">
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
            
            <form onSubmit={handleApply} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
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
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-bold">새 공고 등록하기</h3>
              <p className="text-sm text-gray-500 mt-1">요양원/주간보호센터의 미용 봉사 일정을 등록합니다.</p>
            </div>
            
            <form onSubmit={handleAddSchedule} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
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
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-bold text-emerald-700">봉사 가능일 등록</h3>
              <p className="text-sm text-gray-500 mt-1">미용 봉사가 가능한 날짜와 정보를 등록해주세요.</p>
            </div>
            
            <form onSubmit={handleRegisterVolunteer} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all mb-2"
                  placeholder="예: 천안, 아산 등 직접 입력"
                />
                <div className="flex gap-2">
                  {['천안', '아산'].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setVolLocation(loc)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-all ${volLocation === loc ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
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

      {/* 모바일 하단 고정 광고 영역 */}
      <div 
        className={`xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out ${
          showMobileAd ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="relative w-full h-[60px] sm:h-[90px] flex items-center justify-center">
          <button 
            onClick={() => setShowMobileAd(false)}
            className="absolute -top-8 right-2 bg-white text-gray-500 rounded-t-lg px-3 py-1 text-xs font-medium shadow-sm border border-b-0 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <div className="w-full h-full overflow-hidden">
            <AdBanner />
          </div>
        </div>
      </div>
    </div>
  );
}

