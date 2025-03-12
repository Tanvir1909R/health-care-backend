import { UserRole } from "@prisma/client";
import { prisma } from "../src/app";
import bcrypt from 'bcrypt'

const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (isExistSuperAdmin) {
      console.log("Super admin already exists!");
      return;
    }

    const hashPassword = bcrypt.hashSync("superadmin", 12);

    await prisma.user.create({
      data: {
        email: "super@admin.com",
        password: hashPassword,
        role: UserRole.SUPER_ADMIN,
        admin: {
          create: {
            name: "super admin",
            contactNumber: "00000000",
          },
        },
      },
    });
    console.log("super admin create successfully");
  } catch (err) {
    console.log((err as Error).message);
  } finally {
    await prisma.$disconnect();
  }
};


seedSuperAdmin()