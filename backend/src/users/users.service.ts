import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  UploadLicenseDto,
  ApproveLicenseDto,
  UpdateProfileDto,
} from "./dto/users.dto";
import { LicenseStatus, Role } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async uploadLicense(userId: number, dto: UploadLicenseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role !== Role.RENTER) {
      throw new ForbiddenException("Only renters can upload licenses");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        licenseUrl: dto.licenseUrl,
        licenseStatus: LicenseStatus.PENDING,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        licenseUrl: true,
        licenseStatus: true,
      },
    });

    return updatedUser;
  }

  async approveLicense(
    adminId: number,
    userId: number,
    dto: ApproveLicenseDto,
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException("Only admins can approve licenses");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        licenseStatus: dto.status,
        licenseApprovedAt:
          dto.status === LicenseStatus.APPROVED ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        licenseUrl: true,
        licenseStatus: true,
        licenseApprovedAt: true,
      },
    });

    // Send notification email
    if (dto.status === LicenseStatus.APPROVED) {
      await this.notificationsService.sendLicenseApprovalEmail(
        user.email,
        user.firstName,
      );
    }

    return updatedUser;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        businessName: true,
        businessAddress: true,
        licenseUrl: true,
        licenseStatus: true,
        licenseApprovedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        businessName: true,
        businessAddress: true,
      },
    });

    return user;
  }

  async getPendingLicenses() {
    const users = await this.prisma.user.findMany({
      where: {
        role: Role.RENTER,
        licenseStatus: LicenseStatus.PENDING,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        licenseUrl: true,
        licenseStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}
