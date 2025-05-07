const nextConfig = {
  reactStrictMode: true,
};

module.exports = {
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};
