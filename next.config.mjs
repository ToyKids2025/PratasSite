/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para ajudar com problemas do Firebase
  webpack: (config, { isServer }) => {
    // Ignorar pacotes problemáticos
    if (!isServer) {
      config.resolve.alias['@firebase/logger'] = require.resolve('./lib/empty-module.js');
      config.resolve.alias['@firebase/util'] = require.resolve('./lib/empty-module.js');
    }
    return config;
  },
  // Desativar otimizações que podem causar problemas
  swcMinify: false,
  // Configurações de ambiente
  env: {
    FIREBASE_LOGGING_DISABLED: 'true',
    FIREBASE_LOG_LEVEL: 'error',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
