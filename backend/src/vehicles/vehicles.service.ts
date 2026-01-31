import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto";
import { Role } from "@prisma/client";

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(merchantId: number, dto: CreateVehicleDto) {
    // Verify user is a merchant
    const user = await this.prisma.user.findUnique({
      where: { id: merchantId },
    });

    if (user.role !== Role.MERCHANT) {
      throw new ForbiddenException("Only merchants can create vehicles");
    }

    // Check if license plate already exists
    const existing = await this.prisma.vehicle.findUnique({
      where: { licensePlate: dto.licensePlate },
    });

    if (existing) {
      throw new ConflictException(
        "Vehicle with this license plate already exists",
      );
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...dto,
        merchantId,
      },
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
      },
    });

    return vehicle;
  }

  async findAll(filters?: { isAvailable?: boolean }) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: filters,
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return vehicles;
  }

  async findMyVehicles(merchantId: number) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { merchantId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return vehicles;
  }

  async findOne(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            businessAddress: true,
            phone: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ["ACCEPTED", "PENDING"],
            },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    return vehicle;
  }

  async update(id: number, merchantId: number, dto: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    if (vehicle.merchantId !== merchantId) {
      throw new ForbiddenException("You can only update your own vehicles");
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });

    return updated;
  }

  async remove(id: number, merchantId: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    if (vehicle.merchantId !== merchantId) {
      throw new ForbiddenException("You can only delete your own vehicles");
    }

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return { message: "Vehicle deleted successfully" };
  }
}
