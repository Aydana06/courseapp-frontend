export const environment = {
  production: true,
  apiUrl: 'https://api.training-website.com/api',
  appName: 'Төлбөртэй Сургалтын Вэбсайт',
  version: '1.0.0',
  features: {
    enableMockData: false,
    enableAnalytics: true,
    enableLogging: false
  },
  stripe: {
    publishableKey: 'pk_live_your_stripe_publishable_key_here'
  },
  social: {
    facebook: 'https://facebook.com/training-website',
    twitter: 'https://twitter.com/training-website',
    instagram: 'https://instagram.com/training-website'
  }
}; 