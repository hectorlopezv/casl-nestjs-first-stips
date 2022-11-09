import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export enum Action {
  Manage = 'manage', // Wildcar for any action
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
export type Subjects = InferSubjects<typeof User> | 'all';
export type AppAbility = Ability<[Action, Subjects]>;
@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    // Define rules for user
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );
    if (user.isAdmin) {
      can(Action.Manage, 'all');
      cannot(Action.Manage, User, { orgId: { $ne: user.orgId } }).because(
        'you can only manage users in your own organization',
      );
    } else {
      can(Action.Read, User);
      cannot(Action.Create, User).because('your special message: only admins!');
      cannot(Action.Delete, User).because("you just cant't delete users");
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
