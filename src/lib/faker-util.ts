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
  string: () => faker.helpers.arrayElement([faker.hacker.phrase(), faker.company.buzzPhrase()]),
  text: () => faker.hacker.phrase(),
  number: (options?: { max?: number }) => faker.number.int(options),
  boolean: () => faker.datatype.boolean(),
  datetime: () => faker.date.anytime(),
  userName: () => faker.internet.userName(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  price: () => faker.commerce.price(),
  sentence: () => faker.hacker.phrase(),
  phoneNumber: () => faker.phone.number(),
  email: () => faker.internet.email(),
  address: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  country: () => faker.location.country(),
  url: () => faker.internet.url(),
  zipCode: () => faker.location.zipCode(),
  state: () => faker.location.state(),
  title: () => faker.helpers.arrayElement([faker.music.songName(), faker.commerce.product(), faker.vehicle.vehicle()]),
  uuid: () => faker.string.uuid(),
};
