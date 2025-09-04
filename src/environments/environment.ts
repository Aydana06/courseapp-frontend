export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  baseUrl: 'http://localhost:4200',
  appName: 'Төлбөртэй Сургалтын Вэбсайт',
  version: '1.0.0',
  features: {
    enableMockData: false,
    enableAnalytics: false,
    enableLogging: true
  },
  stripe: {
    publishableKey: 'pk_test_your_stripe_publishable_key_here'
  },
  social: {
    facebook: 'https://facebook.com/training-website',
    twitter: 'https://twitter.com/training-website',
    instagram: 'https://instagram.com/training-website'
  }
}; 