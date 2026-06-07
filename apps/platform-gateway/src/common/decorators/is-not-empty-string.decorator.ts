import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isNotEmptyString', async: false })
export class IsNotEmptyStringConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property}는 공백만으로 구성될 수 없습니다.`;
  }
}

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsNotEmptyStringConstraint,
    });
  };
}
