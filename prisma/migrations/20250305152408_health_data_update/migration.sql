-- AlterTable
ALTER TABLE "patient_health_data" ALTER COLUMN "hasAllergies" DROP NOT NULL,
ALTER COLUMN "hasDiabetes" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL,
ALTER COLUMN "smokingStatus" DROP NOT NULL,
ALTER COLUMN "dietaryPreferences" DROP NOT NULL,
ALTER COLUMN "mentalHealthHistory" DROP NOT NULL,
ALTER COLUMN "immunizationStatus" DROP NOT NULL,
ALTER COLUMN "hasPastSurgeries" DROP NOT NULL,
ALTER COLUMN "recentAnxiety" DROP NOT NULL,
ALTER COLUMN "recentDepression" DROP NOT NULL,
ALTER COLUMN "maritalStatus" SET DEFAULT 'SINGLE';
