type ProfileType = "Frontend" | "Backend" | "QA" | "HR" | "Design" | "Other";

type ContractType = "B2B" | "UoP" | "Mandate" | "Other";

type EmploymentType = "full-time" | "part-time" | "contract";

type NoticePeriod =
  | "ASAP"
  | "1 week"
  | "2 weeks"
  | "1 month"
  | "2 months"
  | "3 months";

interface Url {
  label?: string;
  href: string;
}

interface Salary {
  currency: string;
  value: string;
}

interface Social {
  id: string;
  url: Url;
}

interface Location {
  remote: boolean;
  label: string;
  latitude: number;
  longitude: number;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  date: string;
  location: Location;
  url: Url;
}

interface Education {
  id: string;
  profession: string;
  date: string;
  institution: string;
  area: string;
}

interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface Profile {
  id: string;
  title: string;
  profileType: ProfileType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentJobTitle: string;
  location: Location;
  relocation: boolean;
  contractType: ContractType;
  employmentType: EmploymentType;
  skills: string[];
  education?: Education[];
  experience: Experience[];
  salaryExpectation: Salary;
  noticePeriod: NoticePeriod;
  socials: Social[];
  languages: Language[];
}
