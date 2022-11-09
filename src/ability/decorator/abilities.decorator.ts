import { SetMetadata } from '@nestjs/common';
import { Action, Subjects } from '../ability.factory';

export interface RequiredRule {
  action: Action;
  subject: Subjects;
}
export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata('check-abilities', true);
