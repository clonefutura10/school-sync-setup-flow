
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
    setupTimestamp: new Date().toISOString()
  };

  // Store multiple keys for different access patterns
  localStorage.setItem('setupSchoolId', schoolData.schoolId);
  localStorage.setItem('schedulerData', JSON.stringify(schedulerData));
  localStorage.setItem('setupComplete', 'true');
  
  // Also store individual components
  localStorage.setItem('schoolInfo', JSON.stringify(schoolData));
  
  console.log('Data passed to scheduler:', schedulerData);
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
      setupComplete: localStorage.getItem('setupComplete') === 'true'
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
};
