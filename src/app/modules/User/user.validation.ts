import { Gender, UserRole } from "@prisma/client";
import { z } from "zod";

export const createAdminZodSchema = z.object({
  password: z.string({
    required_error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z.string({
      required_error: "Email is required",
    }),
    contactNumber: z.string({
      required_error: "Contact number is required",
    }),
  }),
});

export const createDoctorZodSchema = z.object({
  password: z.string({
    required_error: "Password is required",
  }),

  doctor: z.object({
    name: z.string({
      required_error: "Name is required!",
    }),
    email: z.string({
      required_error: "Email is required!",
    }),
    contactNumber: z.string({
      required_error: "Contact Number is required!",
    }),
    address: z.string().optional(),
    registrationNumber: z.string({
      required_error: "Reg number is required",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({
      required_error: "appointment fee is required",
    }),
    qualification: z.string({
      required_error: "qualification is required",
    }),
    currentWorkingPlace: z.string({
      required_error: "Current working place is required",
    }),
    designation: z.string({
      required_error: "Designation is required!",
    }),
  }),
});
export const createPatientZodSchema = z.object({
  password: z.string({
    required_error: "Password is required",
  }),

  patient: z.object({
    name: z.string({
      required_error: "Name is required!",
    }),
    email: z.string({
      required_error: "Email is required!",
    }),
    contactNumber: z.string({
      required_error: "Contact Number is required!",
    }),
    address: z.string().optional(),
  }),
});

export const changeStatusZodSchema = z.object({
  body:z.object({
    status: z.string({
      required_error:"status is required"
    })
  })
})
