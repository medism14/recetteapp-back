import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) {}

  async getAllCategories() {
    try {
      return await this.prismaService.category.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des catégories',
      );
    }
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          name: createCategoryDto.name
        }
      });

      if (existingCategory) {
        throw new ConflictException('Une catégorie avec ce nom existe déjà');
      }

      return await this.prismaService.category.create({
        data: {
          name: createCategoryDto.name,
          description: createCategoryDto.description
        }
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Une erreur est survenue lors de la création de la catégorie"
      );
    }
  }
}