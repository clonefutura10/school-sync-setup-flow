
export const passDataToScheduler = (schoolData: any) => {
  // Store comprehensive data for the scheduler
  const schedulerData = {
    schoolId: schoolData.schoolId,
    schoolInfo: {
      name: schoolData.name,
      address: schoolData.address,
      phone: schoolData.phone,
      email: schoolData.email,
      principal_name: schoolData.principal_name,
      academic_year: schoolData.academic_year,
      timezone: schoolData.timezone
    },
    students: schoolData.students || [],
    teachers: schoolData.teachers || [],
    subjects: schoolData.subjects || [],
    classes: schoolData.classes || [],
    timeSlots: schoolData.timeSlots || [],
    setupTimestamp: new Date().toISOString()
  };

  // Store multiple keys for different access patterns
  localStorage.setItem('setupSchoolId', schoolData.schoolId);
  localStorage.setItem('schedulerData', JSON.stringify(schedulerData));
  localStorage.setItem('setupComplete', 'true');
  
  // Also store individual components for easier access
  localStorage.setItem('schoolInfo', JSON.stringify(schoolData));
  localStorage.setItem('schoolStudents', JSON.stringify(schoolData.students || []));
  localStorage.setItem('schoolTeachers', JSON.stringify(schoolData.teachers || []));
  localStorage.setItem('schoolSubjects', JSON.stringify(schoolData.subjects || []));
  localStorage.setItem('schoolClasses', JSON.stringify(schoolData.classes || []));
  localStorage.setItem('schoolTimeSlots', JSON.stringify(schoolData.timeSlots || []));
  
  console.log('Complete data passed to scheduler:', schedulerData);
};

export const getSchedulerData = () => {
  try {
    const schedulerData = localStorage.getItem('schedulerData');
    const setupSchoolId = localStorage.getItem('setupSchoolId');
    const schoolInfo = localStorage.getItem('schoolInfo');
    
    return {
      schedulerData: schedulerData ? JSON.parse(schedulerData) : null,
      setupSchoolId,
      schoolInfo: schoolInfo ? JSON.parse(schoolInfo) : null,
      setupComplete: localStorage.getItem('setupComplete') === 'true',
      students: JSON.parse(localStorage.getItem('schoolStudents') || '[]'),
      teachers: JSON.parse(localStorage.getItem('schoolTeachers') || '[]'),
      subjects: JSON.parse(localStorage.getItem('schoolSubjects') || '[]'),
      classes: JSON.parse(localStorage.getItem('schoolClasses') || '[]'),
      timeSlots: JSON.parse(localStorage.getItem('schoolTimeSlots') || '[]')
    };
  } catch (error) {
    console.error('Error getting scheduler data:', error);
    return null;
  }
};

export const clearSchedulerData = () => {
  localStorage.removeItem('setupSchoolId');
  localStorage.removeItem('schedulerData');
  localStorage.removeItem('setupComplete');
  localStorage.removeItem('schoolInfo');
  localStorage.removeItem('schoolId');
  localStorage.removeItem('schoolStudents');
  localStorage.removeItem('schoolTeachers');
  localStorage.removeItem('schoolSubjects');
  localStorage.removeItem('schoolClasses');
  localStorage.removeItem('schoolTimeSlots');
};
