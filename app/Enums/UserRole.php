<?php

namespace App\Enums;

enum UserRole: string
{
    case PlatformSuperAdmin = 'platform_super_admin';
    case OrganizationAdmin = 'organization_admin';
    case SchoolAdmin = 'school_admin';
    case FinanceStaff = 'finance_staff';
    case AcademicCoordinator = 'academic_coordinator';
    case Teacher = 'teacher';
    case Guardian = 'guardian';
    case Student = 'student';
}
