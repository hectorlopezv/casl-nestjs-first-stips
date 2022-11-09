import { ForbiddenError } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../ability.factory';
import { RequiredRule } from '../decorator/abilities.decorator';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private refelector: Reflector,
    private caslAbilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rules =
      this.refelector.get<RequiredRule[]>(
        'check-abilities',
        context.getHandler(),
      ) || [];

    // const { user } = context.switchToHttp().getRequest();
    const user = { id: 1, isAdmin: true, orgId: 1 }; // req.user
    const ability = this.caslAbilityFactory.defineAbility(user);

    try {
      rules.forEach((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
      );
      // return rules.every((rule) => ability.can(rule.action, rule.subject));
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
    return false;
  }
}
