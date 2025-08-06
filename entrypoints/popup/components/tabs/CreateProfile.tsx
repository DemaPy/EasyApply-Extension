import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { v4 as uuidv4 } from "uuid";
import TextareaAutosize from "react-textarea-autosize";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Switch } from "../../../components/ui/switch";
import { MultiSelect } from "../../../components/multi-select";
import { PlusCircle, X } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { DatePickerForm } from "../../../components/example-date-picker";
import { format } from "date-fns";
import { useTabContext } from "../../../context/tabContext";

// Invalid time value

const defaultValues: FormProfile = {
  title: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  skills: [],
  salaryExpectation: {
    value: "",
    currency: "",
  },
  noticePeriod: undefined,
  contractType: undefined,
  profileType: undefined,
  employmentType: undefined,
  currentJobTitle: "",
  relocation: false,
  location: {
    label: "",
    remote: false,
    latitude: undefined,
    longitude: undefined,
  },
  languages: [{ language: "", proficiency: "" }],
  education: [
    {
      profession: "",
      area: "",
      date: {
        start: "",
        end: "",
        ongoing: false,
      },
      institution: "",
    },
  ],
  socials: [
    {
      url: {
        href: "",
        label: "",
      },
    },
  ],
  experience: [
    {
      company: "",
      date: {
        start: "",
        end: "",
        ongoing: false,
      },
      description: "",
      location: {
        label: "",
        remote: false,
        latitude: undefined,
        longitude: undefined,
      },
      position: "",
      url: {
        href: "",
        label: "",
      },
    },
  ],
};

const FORM_STORAGE_KEY = "form_profile_data";

const PROFILE_TYPES = [
  "Frontend",
  "Backend",
  "QA",
  "HR",
  "Design",
  "Other",
] as const;
const CONTRACT_TYPES = ["B2B", "UoP", "Mandate", "Other"] as const;
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"] as const;
const NOTICE_PERIODS = [
  "ASAP",
  "1 week",
  "2 weeks",
  "1 month",
  "2 months",
  "3 months",
] as const;
const SKILLS = [
  // Frontend Frameworks
  { value: "react", label: "React.js" },
  { value: "next", label: "Next.js" },
  { value: "angular", label: "Angular.js" },
  { value: "vue", label: "Vue.js" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "svelte", label: "Svelte" },
  { value: "ember", label: "Ember.js" },
  { value: "solid", label: "Solid.js" },

  // Styling / UI
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "material-ui", label: "Material UI" },
  { value: "chakra-ui", label: "Chakra UI" },
  { value: "scss", label: "SCSS / SASS" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },

  // Backend Frameworks
  { value: "nodejs", label: "Node.js" },
  { value: "express", label: "Express.js" },
  { value: "nest", label: "Nest.js" },
  { value: "fastify", label: "Fastify" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "spring", label: "Spring Boot" },
  { value: "rails", label: "Ruby on Rails" },
  { value: "laravel", label: "Laravel" },

  // Databases
  { value: "postgresql", label: "PostgreSQL" },
  { value: "firebase", label: "Firebase" },
  { value: "supabase", label: "Supabase" },
  { value: "mysql", label: "MySQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "sqlite", label: "SQLite" },
  { value: "prisma", label: "Prisma ORM" },
  { value: "typeorm", label: "Type ORM" },

  // DevOps & Cloud
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud" },
  { value: "terraform", label: "Terraform" },

  // Testing
  { value: "jest", label: "Jest" },
  { value: "cypress", label: "Cypress" },
  { value: "playwright", label: "Playwright" },
  { value: "vitest", label: "Vitest" },

  // State Management
  { value: "redux", label: "Redux" },
  { value: "zustand", label: "Zustand" },
  { value: "mobx", label: "MobX" },
  { value: "recoil", label: "Recoil" },

  // Build Tools
  { value: "webpack", label: "Webpack" },
  { value: "vite", label: "Vite" },
  { value: "rollup", label: "Rollup" },
  { value: "esbuild", label: "esbuild" },

  // Programming Languages
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "csharp", label: "C#" },
];
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Italian",
  "Turkish",
  "Dutch",
  "Polish",
  "Swedish",
  "Norwegian",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Urdu",
  "Ukraine",
  "Bengali",
  "Tamil",
  "Telugu",
];
const LANGUAGE_LEVELS = [
  "Beginner - A1",
  "Elementary - A2",
  "Intermediate - B1",
  "Upper Intermediate - B2",
  "Advanced - C1",
  "Fluent - C1/C2",
  "Native - C2",
];

const ProfileTypeEnum = z.enum(PROFILE_TYPES);
const ContractTypeEnum = z.enum(CONTRACT_TYPES);
const EmploymentTypeEnum = z.enum(EMPLOYMENT_TYPES);
const NoticePeriodEnum = z.enum(NOTICE_PERIODS);

// ✅ Reusable schemas
const UrlSchema = z.object({
  label: z.string().optional(),
  href: z.string().url(), // enforce valid URL
});

const SalarySchema = z.object({
  currency: z.string(),
  value: z.string(),
});

const DateSchema = z.object({
  start: z.string({ message: "Start date is required" }),
  end: z.string({ message: "End date is required" }),
  ongoing: z.boolean(),
});

const LocationSchema = z.object({
  remote: z.boolean(),
  label: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const SocialSchema = z.object({
  id: z.string().optional(),
  url: UrlSchema,
});

const ExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(4, { message: "Company is required." }),
  position: z.string().min(4, { message: "Position is required." }),
  description: z.string().min(4, { message: "Description is required." }),
  date: DateSchema,
  location: LocationSchema,
  url: UrlSchema,
});

const EducationSchema = z.object({
  id: z.string().optional(),
  profession: z.string().min(4, { message: "Profession is required." }), // Make sure this is applied
  date: DateSchema,
  institution: z.string().min(4, { message: "Institution is required." }), // Make sure this is applied
  area: z.string().min(4, { message: "Area of study is required." }), // Make sure this is applied
});

const LanguageSchema = z.object({
  id: z.string().optional(),
  language: z.string(),
  proficiency: z.string(),
});

export const FormProfileSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  currentJobTitle: z.string(),
  location: LocationSchema,
  relocation: z.boolean(),
  profileType: ProfileTypeEnum.refine((val) => val !== null, {
    message: "Profile type is required",
  }).optional(),
  contractType: ContractTypeEnum.refine((val) => val !== null, {
    message: "Contract type is required",
  }).optional(),
  employmentType: EmploymentTypeEnum.refine((val) => val !== null, {
    message: "Employment type is required",
  }).optional(),
  noticePeriod: NoticePeriodEnum.refine((val) => val !== null, {
    message: "Notice period is required",
  }).optional(),
  skills: z.array(z.string()),
  education: z.array(EducationSchema).optional(),
  experience: z.array(ExperienceSchema),
  salaryExpectation: SalarySchema,
  socials: z.array(SocialSchema),
  languages: z.array(LanguageSchema),
});

type FormProfile = z.infer<typeof FormProfileSchema>;

export const CreateProfile = () => {
  const { setActiveTab } = useTabContext();
  const [editProfile, setEditProfile] = useState<null | FormProfile>(null);
  console.log(editProfile);

  useEffect(() => {
    browser.storage.local.get("editProfileId").then((data) => {
      const editProfileId = data.editProfileId;
      if (data.editProfileId) {
        browser.storage.local.get("profiles").then((data) => {
          const profiles: FormProfile[] = data.profiles;
          const profile = profiles.find((p) => p.id === editProfileId) ?? null;
          setEditProfile(profile);
        });
      }
    });
  }, []);

  const [experienceEditingIndex, setExperienceEditingIndex] = useState<
    null | number
  >(0);
  const [socialEditingIndex, setSocialEditingIndex] = useState<null | number>(
    0
  );
  const [educationEditingIndex, setEducationEditingIndex] = useState<
    null | number
  >(0);

  const form = useForm<FormProfile>({
    resolver: zodResolver(FormProfileSchema),
    mode: "onChange",
    defaultValues: {},
  });

  const { reset } = form;
  const formData = form.watch();

  useEffect(() => {
    browser.storage.local.get(FORM_STORAGE_KEY, (result) => {
      if (result[FORM_STORAGE_KEY]) {
        reset(result[FORM_STORAGE_KEY]);
      }
    });
  }, [reset]);

  useEffect(() => {
    browser.storage.local.set({ [FORM_STORAGE_KEY]: formData });
  }, [formData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = Object.values(formData).some((value) => !!value);
      if (hasData) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (editProfile) {
      reset(editProfile);
    }
  }, [editProfile, reset]);

  const { isValid, isSubmitting } = form.formState;

  const {
    fields: educationFields,
    append: addEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const {
    fields: socialFields,
    append: addSocial,
    remove: removeSocial,
  } = useFieldArray({
    control: form.control,
    name: "socials",
  });

  const {
    fields: languagesFields,
    append: addLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const {
    fields: experienceFields,
    append: addExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const watchedEducation = useWatch({
    control: form.control,
    name: "education",
  });

  const watchedExperience = useWatch({
    control: form.control,
    name: "experience",
  });

  function onSubmit(values: z.infer<typeof FormProfileSchema>) {
    if (values.experience.length === 0) {
      form.setError("experience", {
        message: "Experience required",
      });
      return;
    }

    if (values.socials.length === 0) {
      form.setError("socials", {
        message: "Socials required",
      });
      return;
    }

    if (values.languages.length === 0) {
      form.setError("languages", {
        message: "Languages required",
      });
      return;
    }

    saveProfile(values);
    browser.storage.local
      .remove([FORM_STORAGE_KEY, "editProfileId"])
      .then(() => {
        setActiveTab?.("profiles");
      });
  }

  async function saveProfile(profile: FormProfile) {
    const data = await browser.storage.local.get("profiles");
    const prevProfiles: FormProfile[] = data?.profiles;
    if (prevProfiles) {
      await browser.storage.local.set({
        profiles: profile.id
          ? prevProfiles.map((p) => {
              if (p.id === profile.id) {
                return profile;
              }
              return p;
            })
          : [
              ...prevProfiles,
              {
                id: uuidv4(),
                ...profile,
                relocation: profile.relocation ?? false,
                location: {
                  ...profile.location,
                  remote: profile.location.remote ?? false,
                },
              },
            ],
      });
    } else {
      await browser.storage.local.set({
        profiles: [
          {
            id: uuidv4(),
            ...profile,
            relocation: profile.relocation ?? false,
            location: {
              ...profile.location,
              remote: profile.location.remote ?? false,
            },
          },
        ],
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Front-end Developer, Fullstack Engineer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currentJobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Front-end Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_TYPES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-start">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+7 777 777 777" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-start justify-between">
          <FormField
            control={form.control}
            name="location.label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Warsaw" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location.remote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remote</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="relocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relocation</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="contractType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract types</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CONTRACT_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment types</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {EMPLOYMENT_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <MultiSelect
                  // TODO
                  key={JSON.stringify(field.value)}
                  options={SKILLS}
                  onValueChange={field.onChange}
                  placeholder="Select skills"
                  variant="inverted"
                  animation={2}
                  maxCount={8}
                  defaultValue={field.value}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="salaryExpectation.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary currency</FormLabel>
                <FormControl>
                  <Input placeholder="USD, PLN, EUR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salaryExpectation.value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary value</FormLabel>
                <FormControl>
                  <Input placeholder="1600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="noticePeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_PERIODS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* LANGUAGES */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Label>Languages</Label>
            <Button
              type="button"
              onClick={() =>
                addLanguage({ id: uuidv4(), language: "", proficiency: "" })
              }
              variant={"outline"}
            >
              <PlusCircle />
            </Button>
          </div>
          {languagesFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-stretch">
              <FormField
                control={form.control}
                name={`languages.${index}.language`}
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.sort((a, b) => a.localeCompare(b)).map(
                            (lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`languages.${index}.proficiency`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant={"outline"}
                type="button"
                onClick={() => removeLanguage(index)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
        {/* EDUCATION */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Label>Education</Label>
            <Button
              type="button"
              onClick={() => {
                addEducation({
                  id: uuidv4(),
                  profession: "",
                  institution: "",
                  area: "",
                  date: {
                    start: "",
                    end: "",
                    ongoing: false,
                  },
                });
                setEducationEditingIndex(educationFields.length);
              }}
              variant={"outline"}
            >
              <PlusCircle />
            </Button>
          </div>
          {educationFields.map((field, index) => {
            const ongoing = watchedEducation?.[index]?.date?.ongoing;

            const profession = form.watch(`education.${index}.profession`);
            const institution = form.watch(`education.${index}.institution`);
            const area = form.watch(`education.${index}.area`);
            const start = form.watch(`education.${index}.date.start`);
            const end = form.watch(`education.${index}.date.end`);

            const isEditing = index === educationEditingIndex;
            return (
              <>
                {isEditing ? (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md"
                  >
                    <FormField
                      control={form.control}
                      name={`education.${index}.profession`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Software developer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Wroclaw WUST"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.area`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Computer science"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.date.start`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date start</FormLabel>
                          <FormControl>
                            <DatePickerForm {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`education.${index}.date.end`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Date end</FormLabel>
                            <FormControl>
                              <DatePickerForm disabled={ongoing} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`education.${index}.date.ongoing`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ongoing</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={"ghost"}
                        className="flex-1"
                        type="button"
                        onClick={() => removeEducation(index)}
                      >
                        Remove
                      </Button>
                      <Button
                        className="flex-1"
                        type="button"
                        variant={"outline"}
                        onClick={() => setEducationEditingIndex(null)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  // TODO: ShadCn Card
                  <div
                    onClick={() => setEducationEditingIndex(index)}
                    key={field.id}
                    className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md hover:outline hover:outline-slate-600 cursor-pointer"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-semibold">
                        {profession || "Untitled education"}
                      </div>
                      <div>{institution}</div>
                      <div className="text-sm text-muted-foreground">
                        {area}
                      </div>
                      <div className="text-sm">
                        {start ? format(start, "MMM yyyy") : "Start date"} —
                        {ongoing
                          ? "Present"
                          : end
                          ? format(end, "MMM yyyy")
                          : "End date"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Label>Socials</Label>
            <Button
              type="button"
              onClick={() => {
                addSocial({
                  id: uuidv4(),
                  url: {
                    href: "",
                    label: "",
                  },
                });
                setSocialEditingIndex(socialFields.length);
              }}
              variant={"outline"}
            >
              <PlusCircle />
            </Button>
          </div>
          {socialFields.map((field, index) => {
            const currentLabel = form.watch(`socials.${index}.url.label`);
            const currentHref = form.watch(`socials.${index}.url.href`);

            const isEditing = index === socialEditingIndex;
            return (
              <>
                {isEditing ? (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md hover:outline hover:outline-slate-600 cursor-pointer"
                  >
                    <FormField
                      control={form.control}
                      name={`socials.${index}.url.label`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Url label"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`socials.${index}.url.href`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Href</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              type="url"
                              placeholder="Url href"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={"ghost"}
                        className="flex-1"
                        type="button"
                        onClick={() => removeSocial(index)}
                      >
                        Remove
                      </Button>
                      <Button
                        className="flex-1"
                        type="button"
                        variant={"outline"}
                        onClick={() => setSocialEditingIndex(null)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={field.id}
                    onClick={() => setSocialEditingIndex(index)}
                    className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md hover:outline hover:outline-slate-600 cursor-pointer"
                  >
                    <Label className="w-fit">
                      <a href={currentHref} className="capitalize">
                        {currentLabel
                          ? currentLabel
                          : new URL(currentHref).hostname.replace(".com", "")}
                      </a>
                    </Label>
                  </div>
                )}
              </>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Label>Experience</Label>
            <Button
              type="button"
              onClick={() => {
                addExperience({
                  id: uuidv4(),
                  company: "",
                  date: {
                    start: "",
                    end: "",
                    ongoing: false,
                  },
                  description: "",
                  location: {
                    label: "",
                    latitude: undefined,
                    longitude: undefined,
                    remote: false,
                  },
                  position: "",
                  url: {
                    label: "",
                    href: "",
                  },
                });
                setExperienceEditingIndex(experienceFields.length);
              }}
              variant={"outline"}
            >
              <PlusCircle />
            </Button>
          </div>
          {experienceFields.map((field, index) => {
            const ongoing = watchedExperience?.[index]?.date?.ongoing;
            const remote = watchedExperience?.[index]?.location?.remote;

            const company = form.watch(`experience.${index}.company`);
            const position = form.watch(`experience.${index}.position`);
            const description = form.watch(`experience.${index}.description`);
            const startDate = form.watch(`experience.${index}.date.start`);
            const endDate = form.watch(`experience.${index}.date.end`);

            const isEditing = index === experienceEditingIndex;

            return (
              <>
                {isEditing ? (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md hover:outline hover:outline-slate-600 cursor-pointer"
                  >
                    <FormField
                      control={form.control}
                      name={`experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Google"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.position`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Frontend Developer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <TextareaAutosize
                              className="bg-white resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              placeholder="Responsible for... achievements..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.url.label`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              placeholder="Url label"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.url.href`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Href</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              type="url"
                              placeholder="Url href"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${index}.date.start`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date start</FormLabel>
                          <FormControl>
                            <DatePickerForm {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.date.end`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Date end</FormLabel>
                            <FormControl>
                              <DatePickerForm disabled={ongoing} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experience.${index}.date.ongoing`}
                        render={({ field }) => (
                          <FormItem className="w-1/5">
                            <FormLabel>Ongoing</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2 items-start justify-between">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.location.label`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                disabled={remote}
                                className="bg-white"
                                placeholder="Warsaw"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experience.${index}.location.remote`}
                        render={({ field }) => (
                          <FormItem className="w-1/5">
                            <FormLabel>Remote</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={"ghost"}
                        className="flex-1"
                        type="button"
                        onClick={() => removeExperience(index)}
                      >
                        Remove
                      </Button>
                      <Button
                        className="flex-1"
                        type="button"
                        variant={"outline"}
                        onClick={async () => {
                          const isValid = await form.trigger(
                            `experience.${index}`
                          );
                          if (isValid) {
                            setExperienceEditingIndex(null);
                          }
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setExperienceEditingIndex(index)}
                    key={field.id}
                    className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md hover:outline hover:outline-slate-600 cursor-pointer"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-semibold">
                        {company || "Untitled position"}
                      </div>
                      <div>{position}</div>
                      <div className="text-sm text-muted-foreground line-clamp-6">
                        {description}
                      </div>
                      <div className="text-sm">
                        {startDate
                          ? format(startDate, "MMM yyyy")
                          : "Start date"}{" "}
                        —
                        {ongoing
                          ? "Present"
                          : endDate
                          ? format(endDate, "MMM yyyy")
                          : "End date"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              browser.storage.local.remove([FORM_STORAGE_KEY, "editProfileId"]);
              form.reset(defaultValues);
            }}
            variant="ghost"
            className="flex-1 mb-4"
            type="button"
          >
            Clear
          </Button>
          <Button
            disabled={!isValid || isSubmitting}
            variant="outline"
            className="flex-1 mb-4"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};
