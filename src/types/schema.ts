// Firebase types
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
} | Date | any; // 'any' is used to accept Firebase FieldValue (like serverTimestamp)

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  role: 'user' | 'admin';
  status: 'active' | 'pending' | 'denied' | 'suspended';

  // Professional Details
  credentials?: string;
  npiNumber?: string;
  primaryState?: string;
  yearsExperience?: number;
  specialty?: string;
  certifyingBody?: string;
  certNumber?: string;
  certExpiration?: Timestamp | null;
  malpracticeNumber?: string;
  malpracticeCertNumber?: string;
  malpracticeCertExpiration?: Timestamp | null;

  settings: {
    emailNotifications: boolean;
    notificationsEnabled: boolean; // Global setting for in-app or overall
    alertSettings: {
      license180: boolean;
      license90: boolean;
      license60: boolean;
      license30: boolean;
      license7: boolean;
      deaExpiration: boolean;
      missingDocuments: boolean;
    };
    timezone: string;
  };
  stats: {
    totalStates: number;
    activeStates: number;
    pendingStates: number;
    readyStates: number;
  };
}

export interface InAppNotification {
  id?: string;
  userId: string;
  type: 'expiration' | 'document' | 'general';
  message: string;
  read: boolean;
  clearAllTrigger?: number; // timestamp when cleared
  createdAt: Timestamp;
}

export type ApplicationStatus = 'not_started' | 'researching' | 'in_progress' | 'submitted' | 'awaiting_documents' | 'awaiting_board' | 'active' | 'expired' | 'denied';
export type CredentialStatus = 'not_required' | 'not_started' | 'pending' | 'active' | 'expired' | 'inactive' | 'denied';
export type DeaStatus = 'not_required' | 'not_applied' | 'pending' | 'active' | 'expired';
export type ReadyStatus = 'ready' | 'almost_ready' | 'not_ready' | 'expired';

export interface StateLicense {
  id?: string;
  userId: string;
  stateCode: string;
  stateName: string;

  rnRequired: boolean;
  aprnRequired: boolean;

  rnStatus: CredentialStatus;
  rnLicenseNumber: string;
  rnIssueDate: Timestamp | null;
  rnExpirationDate: Timestamp | null;
  rnDocumentId?: string;
  isRnCompact?: boolean;
  rnCompactOriginalState?: string;

  aprnStatus: CredentialStatus;
  aprnLicenseNumber: string;
  aprnIssueDate: Timestamp | null;
  aprnExpirationDate: Timestamp | null;
  aprnDocumentId?: string;

  applicationStatus: ApplicationStatus;
  applicationStartedDate: Timestamp | null;
  applicationSubmittedDate: Timestamp | null;
  approvalDate: Timestamp | null;

  renewalWindowStart: Timestamp | null;
  lastRenewedDate: Timestamp | null;

  independentPractice: boolean;
  supervisionRequired: boolean;

  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone: string;
  supervisorDocumentIds: string[];

  deaRequired: boolean;
  deaStatus: DeaStatus;
  deaNumber: string;
  deaExpirationDate: Timestamp | null;
  deaDocumentId?: string;

  stateControlledSubstanceRequired: boolean;
  stateControlledSubstanceStatus: CredentialStatus;
  stateControlledSubstanceNumber: string;
  stateControlledSubstanceExpirationDate: Timestamp | null;
  stateControlledSubstanceDocumentId?: string;

  backgroundCheckRequired: boolean;
  backgroundCheckCompleted: boolean;
  backgroundCheckDocumentId?: string;
  fingerprintRequired: boolean;
  fingerprintCompleted: boolean;
  fingerprintDocumentId?: string;

  prescriberLicenseRequired?: boolean;
  ceuRequirementsNotes?: string;

  malpracticeRequired: boolean;
  malpracticeDocumentIds: string[];

  readyStatus: ReadyStatus;
  readinessScore: number;
  nextAction: string;
  notes: string;

  portalLinks?: {
    boardWebsite: string;
    renewalPage: string;
    ceRequirementPage: string;
  };

  costs?: {
    applicationFee: number;
    renewalFee: number;
    otherFees: number;
  };

  tags: string[];
  archived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DocumentCategory = 'rn_license' | 'aprn_license' | 'dea' | 'state_controlled_substance' | 'supervisor_agreement' | 'collaborative_agreement' | 'malpractice' | 'ceu_certificate' | 'background_check' | 'fingerprint' | 'board_correspondence' | 'application_receipt' | 'other';

export interface LicenseDocument {
  id?: string;
  userId: string;
  licenseId?: string;
  stateCode?: string;
  category: DocumentCategory;
  fileName: string;
  storagePath: string;
  downloadURL: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Timestamp;
  expirationDate?: Timestamp | null;
  issueDate?: Timestamp | null;
  version: number;
  notes: string;
}

export type CeuCategory = 'general' | 'pharmacology' | 'ethics' | 'controlled_substance' | 'prescribing' | 'jurisprudence' | 'other';

export interface CeuEntry {
  id?: string;
  userId: string;
  title: string;
  provider: string;
  courseDate: Timestamp;
  hours: number;
  category: CeuCategory;
  subCategory?: string;
  certificateDocumentId?: string;
  appliesToStates: string[];
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Added State Requirements reference schema to assist with calculations
export interface StateRequirements {
  stateCode: string;
  stateName: string;
  rnRequired: boolean;
  aprnRequired: boolean;
  independentPracticeAllowed: boolean;
  supervisionRequired: boolean;
  deaRequiredForControlledSubstances: boolean;
  stateControlledSubstanceRequired: boolean;
  ceuRequirements: {
    renewalCycleMonths: number;
    totalHoursRequired: number;
    pharmacologyHoursRequired: number;
    ethicsHoursRequired: number;
    controlledSubstanceHoursRequired: number;
    specialRequirementsNotes: string;
  };
  extraRequirements: {
    backgroundCheckRequired: boolean;
    fingerprintRequired: boolean;
  };
  links: {
    boardWebsite: string;
    renewalPage: string;
    ceRequirementsPage: string;
  };
  updatedAt: Timestamp;
}
