export interface RegistrationCard {
  routeName: string;
  distance: string;
  requirements: string[];
  timeLimitNote?: string;
  price: number;
  priceLabel: string;
}

export interface EventRegistrationData {
  slug: string;
  eventName: string;
  city: string;
  registrationCards: RegistrationCard[];
  borderColors: string[];
  backUrl: string;
}

export const borderColors = ['#fec800', '#62b22f', '#e61c56'];

export const suzdalRegistration: EventRegistrationData = {
  slug: 'suzdal',
  eventName: 'Tour de Russie — Суздаль',
  city: 'Суздаль',
  backUrl: '/events/suzdal',
  borderColors: ['#fec800', '#e61c56'],
  registrationCards: [
    {
      routeName: 'Median Tour',
      distance: '60 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Grand Tour',
      distance: '114 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      timeLimitNote: 'Дистанция GRAND TOUR имеет лимит времени, при достижении которого контролеры начинают направлять участников в сторону финиша с сокращением дистанции.',
      price: 6000,
      priceLabel: '6 000 ₽',
    },
  ],
};

export const igoraRegistration: EventRegistrationData = {
  slug: 'igora',
  eventName: 'Tour de Russie — Игора',
  city: 'Игора',
  backUrl: '/events/igora',
  borderColors,
  registrationCards: [
    {
      routeName: 'Intro Tour',
      distance: '32 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Median Tour',
      distance: '60 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Grand Tour',
      distance: '86 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      timeLimitNote: 'Дистанция GRAND TOUR имеет лимит времени, при достижении которого контролеры начинают направлять участников в сторону финиша с сокращением дистанции.',
      price: 6000,
      priceLabel: '6 000 ₽',
    },
  ],
};

export const pushkinRegistration: EventRegistrationData = {
  slug: 'pushkin',
  eventName: 'Tour de Russie — Пушкин',
  city: 'Пушкин',
  backUrl: '/events/pushkin',
  borderColors,
  registrationCards: [
    {
      routeName: 'Intro Tour',
      distance: '22 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Median Tour',
      distance: '46 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Grand Tour',
      distance: '95 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      timeLimitNote: 'Дистанция GRAND TOUR имеет лимит времени, при достижении которого контролеры начинают направлять участников в сторону финиша с сокращением дистанции.',
      price: 6000,
      priceLabel: '6 000 ₽',
    },
  ],
};

export const moscowRegistration: EventRegistrationData = {
  slug: 'moscow',
  eventName: 'Tour de Russie — Москва',
  city: 'Москва',
  backUrl: '/events/moscow',
  borderColors,
  registrationCards: [
    {
      routeName: 'Intro Tour',
      distance: '33 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Median Tour',
      distance: '66 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      price: 6000,
      priceLabel: '6 000 ₽',
    },
    {
      routeName: 'Grand Tour',
      distance: '100 км',
      requirements: ['Возраст: от 18 лет', 'Медицинская справка', 'Страховка'],
      timeLimitNote: 'Дистанция GRAND TOUR имеет лимит времени, при достижении которого контролеры начинают направлять участников в сторону финиша с сокращением дистанции.',
      price: 6000,
      priceLabel: '6 000 ₽',
    },
  ],
};
