import { faker } from '@faker-js/faker';
import { FakerUtilMethods } from '../types';

/**
 * Sets the faker seed for deterministic generation
 */
export function setFakerSeed(seed: number): void {
  faker.seed(seed);
}

/**
 * Resets faker to use random seed
 */
export function resetFakerSeed(): void {
  faker.seed();
}

export const fakerUtil: FakerUtilMethods = {
  string: () => faker.string.alpha(),
  text: () => faker.lorem.text(),
  number: (options?: { max?: number }) => faker.number.int(options),
  boolean: () => faker.datatype.boolean(),
  datetime: () => faker.date.anytime(),
  userName: () => faker.internet.userName(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  price: () => faker.commerce.price(),
  sentence: () => faker.lorem.sentence(),
};
