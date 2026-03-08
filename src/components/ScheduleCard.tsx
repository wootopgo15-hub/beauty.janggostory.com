import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Schedule } from '../types';
import { cn } from '../lib/utils';
import { Calendar, Users, Scissors } from 'lucide-react';

interface ScheduleCardProps {
  schedule: Schedule;
  onApply: (scheduleId: string) => void;
  isApplied: boolean;
  isLoading: boolean;
}

export function ScheduleCard({ schedule, onApply, isApplied, isLoading }: ScheduleCardProps) {
  const isClosed = schedule.status === 'CLOSED' || schedule.currentVolunteers >= schedule.maxVolunteers;
  const date = new Date(schedule.date);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 transition-all hover:shadow-md">
      {/* 상단: 기관명 및 상태 뱃지 */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-slate-800">{schedule.facilityName}</h3>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold",
            isClosed
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          )}
        >
          {isClosed ? '마감' : '모집중'}
        </span>
      </div>

      {/* 중단: 상세 정보 */}
      <div className="flex flex-col gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{format(date, 'M월 d일 (E) a h:mm', { locale: ko })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span>모집 인원: {schedule.currentVolunteers} / {schedule.maxVolunteers}명</span>
        </div>
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1 flex-wrap">
            {schedule.requiredSkills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 하단: 설명 및 버튼 */}
      <p className="text-sm text-slate-500 line-clamp-2 mt-2">{schedule.description}</p>

      <button
        onClick={() => onApply(schedule.id)}
        disabled={isClosed || isApplied || isLoading}
        className={cn(
          "mt-2 w-full py-2.5 rounded-xl font-medium transition-colors",
          isApplied
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : isClosed
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]"
        )}
      >
        {isLoading ? '처리 중...' : isApplied ? '신청 완료' : isClosed ? '마감됨' : '원터치 신청'}
      </button>
    </div>
  );
}
