export interface User {
  id: string;
  name: string;
  role: 'VOLUNTEER' | 'FACILITY';
  noshowCount: number;
}

export interface Schedule {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string; // ISO string
  requiredSkills: string[];
  maxVolunteers: number;
  currentVolunteers: number;
  status: 'OPEN' | 'CLOSED';
  description: string;
}

export interface Application {
  id: string;
  scheduleId: string;
  volunteerId: string;
  volunteerName: string;
  appliedAt: string;
  status: 'APPROVED' | 'CANCELED';
}
