import { IsString, IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { LicenseStatus } from "@prisma/client";

export class UploadLicenseDto {
  @ApiProperty({ example: "https://r2.example.com/license.jpg" })
  @IsString()
  licenseUrl: string;
}

export class ApproveLicenseDto {
  @ApiProperty({ enum: LicenseStatus, example: LicenseStatus.APPROVED })
  @IsEnum(LicenseStatus)
  status: LicenseStatus;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessAddress?: string;
}
