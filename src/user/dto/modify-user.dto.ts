import { IsString, IsBoolean, IsOptional } from "class-validator";

export class ModifyUserDto {
  @IsOptional()
  @IsString()
  notificationEmail: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  resumeLink?: string;

  @IsOptional()
  @IsString()
  birthYear?: number;

  @IsOptional()
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsString()
  locationState?: string;

  @IsOptional()
  @IsString()
  locationCountry?: string;

  @IsOptional()
  @IsBoolean()
  isFirstGenerationCollegeStudent?: boolean;
}

export class SudoModifyUserDto extends ModifyUserDto {
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
