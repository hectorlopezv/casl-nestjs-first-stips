import { ForbiddenError } from '@casl/ability';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AbilityFactory, Action } from 'src/ability/ability.factory';
import { CheckAbilities } from 'src/ability/decorator/abilities.decorator';
import { AbilitiesGuard } from 'src/ability/Guard/ability.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const user = { id: 1, isAdmin: false, orgId: 1 }; // req.user
    const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(Action.Create, User);
    // if (!isAllowed) {
    //   throw new ForbiddenException('only admin');
    // }

    try {
      ForbiddenError.from(ability)
        .setMessage('only for admins man')
        .throwUnlessCan(Action.Create, User);
      return this.userService.create(createUserDto);
    } catch (error: any) {
      throw new ForbiddenException(error.message);
    }
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = { id: 1, isAdmin: true, orgId: 1 }; // req.user
    const ability = this.abilityFactory.defineAbility(user);

    // const isAllowed = ability.can(Action.Create, User);
    // if (!isAllowed) {
    //   throw new ForbiddenException('only admin');
    // }

    try {
      const userToUpdate = this.userService.findOne(+id);
      ForbiddenError.from(ability).throwUnlessCan(Action.Update, userToUpdate);
      return this.userService.update(+id, updateUserDto);
    } catch (error: any) {
      throw new ForbiddenException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
