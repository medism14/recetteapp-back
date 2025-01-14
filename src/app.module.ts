import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { RecipesService } from './recipes/recipes.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsersModule, RecipesModule, CategoriesModule, FavoritesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, RecipesService],
})
export class AppModule {}
